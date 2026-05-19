// Supabase Edge Function: inbox-send
// Отправка исходящих сообщений в канал (Green API / Telegram).
// Вызывается из браузера через supabase.functions.invoke('inbox-send', { body: {...} }).
//
// Принимает:
//   { conversation_id, channel_id, external_id, body, attachments[], message_id }
// Возвращает:
//   { provider_msg_id, status }
//
// Деплой:  supabase functions deploy inbox-send

// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

interface SendPayload {
  conversation_id: string;
  channel_id: string;
  external_id: string;
  body?: string | null;
  attachments?: Array<{ kind: string; url: string; name?: string }>;
  message_id?: string;
}

// ─── Green API ────────────────────────────────────────────────────
async function sendGreenApi(channel: any, payload: SendPayload) {
  const cfg = channel.provider_config || {};
  const idInstance = cfg.idInstance;
  const apiToken = cfg.apiTokenInstance;
  if (!idInstance || !apiToken) throw new Error('Green API: idInstance/apiTokenInstance не настроены');

  const apiUrl = cfg.apiUrl || 'https://api.green-api.com';
  const base = `${apiUrl}/waInstance${idInstance}`;

  // Если есть вложения — слать sendFileByUrl на каждое + caption на первое
  const atts = payload.attachments || [];
  if (atts.length > 0) {
    const results: string[] = [];
    for (let i = 0; i < atts.length; i++) {
      const a = atts[i];
      const r = await fetch(`${base}/sendFileByUrl/${apiToken}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chatId: payload.external_id,
          urlFile: a.url,
          fileName: a.name || 'file',
          caption: i === 0 ? (payload.body || '') : ''
        })
      });
      const j = await r.json();
      if (!r.ok || !j.idMessage) throw new Error('Green API sendFileByUrl: ' + (j.message || r.status));
      results.push(j.idMessage);
    }
    return { provider_msg_id: results[0], status: 'sent' };
  }

  // Текстовое сообщение
  const r = await fetch(`${base}/sendMessage/${apiToken}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chatId: payload.external_id, message: payload.body || '' })
  });
  const j = await r.json();
  if (!r.ok || !j.idMessage) throw new Error('Green API sendMessage: ' + (j.message || r.status));
  return { provider_msg_id: j.idMessage, status: 'sent' };
}

// ─── Telegram Bot API ────────────────────────────────────────────
async function sendTelegram(channel: any, payload: SendPayload) {
  const token = channel.provider_config?.botToken;
  if (!token) throw new Error('Telegram: botToken не настроен');
  const base = `https://api.telegram.org/bot${token}`;

  const atts = payload.attachments || [];
  if (atts.length > 0) {
    const a = atts[0];
    const method = a.kind === 'image' ? 'sendPhoto'
                 : a.kind === 'video' ? 'sendVideo'
                 : a.kind === 'audio' ? 'sendVoice' : 'sendDocument';
    const fileField = a.kind === 'image' ? 'photo'
                    : a.kind === 'video' ? 'video'
                    : a.kind === 'audio' ? 'voice' : 'document';
    const r = await fetch(`${base}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: payload.external_id,
        [fileField]: a.url,
        caption: payload.body || ''
      })
    });
    const j = await r.json();
    if (!j.ok) throw new Error('Telegram ' + method + ': ' + (j.description || 'unknown'));
    return { provider_msg_id: String(j.result.message_id), status: 'sent' };
  }

  const r = await fetch(`${base}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: payload.external_id, text: payload.body || '' })
  });
  const j = await r.json();
  if (!j.ok) throw new Error('Telegram sendMessage: ' + (j.description || 'unknown'));
  return { provider_msg_id: String(j.result.message_id), status: 'sent' };
}

// ─── HTTP entry ──────────────────────────────────────────────────
// @ts-ignore deno deploy
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  try {
    const payload: SendPayload = await req.json();
    if (!payload?.channel_id || !payload?.external_id) {
      return new Response(JSON.stringify({ error: 'channel_id and external_id required' }), { status: 400 });
    }

    const { data: channel, error: chErr } = await sb
      .from('channels')
      .select('*')
      .eq('id', payload.channel_id)
      .eq('is_active', true)
      .maybeSingle();
    if (chErr) throw chErr;
    if (!channel) return new Response(JSON.stringify({ error: 'channel not found' }), { status: 404 });

    let result: { provider_msg_id: string; status: string };
    if (channel.provider === 'green_api')        result = await sendGreenApi(channel, payload);
    else if (channel.provider === 'telegram_bot') result = await sendTelegram(channel, payload);
    else throw new Error('unsupported provider: ' + channel.provider);

    // обновляем message в БД с provider_msg_id
    if (payload.message_id) {
      await sb.from('messages')
        .update({ provider_msg_id: result.provider_msg_id, status: result.status })
        .eq('id', payload.message_id);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.error('[inbox-send]', e);
    // помечаем сообщение как failed
    try {
      const body: SendPayload = await req.clone().json();
      if (body?.message_id) {
        await sb.from('messages')
          .update({ status: 'failed', status_error: String((e as Error).message || e) })
          .eq('id', body.message_id);
      }
    } catch (_) {}
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), { status: 500 });
  }
});
