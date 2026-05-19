// Supabase Edge Function: inbox-webhook
// Принимает входящие webhook'и от Green API (WhatsApp) и Telegram Bot API,
// нормализует в единую модель и пишет в таблицы conversations / messages.
//
// Маршруты:
//   POST /inbox-webhook?provider=green_api&secret=<webhook_secret>
//   POST /inbox-webhook?provider=telegram_bot&secret=<webhook_secret>
//
// Webhook secret прописывается в channels.webhook_secret и должен совпадать
// с параметром в URL — это защита от подделки входящих.
//
// Деплой:  supabase functions deploy inbox-webhook --no-verify-jwt
// URL: https://<PROJECT>.supabase.co/functions/v1/inbox-webhook

// @ts-ignore deno deploy types
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// @ts-ignore
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
// @ts-ignore
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

// ─── общие хелперы ────────────────────────────────────────────────
function phoneNormalize(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let s = String(raw).replace(/@[a-z.]+$/i, '');
  s = s.replace(/[^\d]/g, '');
  if (!s) return null;
  if (s.length === 11 && s[0] === '8') s = '7' + s.slice(1);
  if (s.length === 10) s = '7' + s;
  if (s.length !== 11 || s[0] !== '7') return null;
  return '+' + s;
}

async function findOrCreateConversation(opts: {
  channelId: string;
  externalId: string;
  phone?: string | null;
  name?: string | null;
  avatar?: string | null;
}) {
  const { data: existing } = await sb
    .from('conversations')
    .select('*')
    .eq('channel_id', opts.channelId)
    .eq('contact_external_id', opts.externalId)
    .maybeSingle();

  if (existing) {
    // подтягиваем телефон если узнали позже
    if (opts.phone && !existing.contact_phone) {
      const phone = phoneNormalize(opts.phone);
      if (phone) {
        await sb.from('conversations').update({ contact_phone: phone, updated_at: new Date().toISOString() }).eq('id', existing.id);
        existing.contact_phone = phone;
      }
    }
    return existing;
  }

  // дефолтная колонка канбана
  const { data: defCol } = await sb
    .from('lead_columns')
    .select('id')
    .eq('is_default', true)
    .maybeSingle();

  // матчинг клиента по телефону
  let clientId: string | null = null;
  const normPhone = phoneNormalize(opts.phone);
  if (normPhone) {
    const { data: client } = await sb
      .from('clients')
      .select('id')
      .eq('phone', normPhone)
      .maybeSingle();
    clientId = client?.id || null;
  }

  const { data: created, error } = await sb
    .from('conversations')
    .insert({
      channel_id: opts.channelId,
      contact_external_id: opts.externalId,
      contact_phone: normPhone,
      contact_name: opts.name || null,
      contact_avatar: opts.avatar || null,
      client_id: clientId,
      status_id: defCol?.id || null,
      tags: [],
      unread_count: 0,
      last_message_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return created;
}

async function insertIncomingMessage(opts: {
  conversationId: string;
  body?: string | null;
  attachments?: any[];
  providerMsgId?: string | null;
  senderName?: string | null;
  sentAt?: string | null;
}) {
  const { data, error } = await sb
    .from('messages')
    .insert({
      conversation_id: opts.conversationId,
      direction: 'in',
      body: opts.body || null,
      attachments: opts.attachments || [],
      sender_name: opts.senderName || null,
      provider_msg_id: opts.providerMsgId || null,
      status: 'received',
      sent_at: opts.sentAt || new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Green API parsers ────────────────────────────────────────────
// Документация: https://green-api.com/docs/api/receiving/notifications-format/
async function handleGreenApi(channel: any, payload: any) {
  const type = payload?.typeWebhook;
  if (!type) return { skipped: true };

  // Входящее сообщение
  if (type === 'incomingMessageReceived') {
    const senderData = payload.senderData || {};
    const messageData = payload.messageData || {};
    const externalId = senderData.chatId;
    if (!externalId) return { skipped: true };

    let body: string | null = null;
    const attachments: any[] = [];

    const md = messageData;
    if (md.typeMessage === 'textMessage') {
      body = md.textMessageData?.textMessage || null;
    } else if (md.typeMessage === 'extendedTextMessage') {
      body = md.extendedTextMessageData?.text || null;
    } else if (['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage'].includes(md.typeMessage)) {
      const fd = md.fileMessageData || {};
      body = fd.caption || null;
      const kind = md.typeMessage === 'imageMessage' ? 'image'
                 : md.typeMessage === 'videoMessage' ? 'video'
                 : md.typeMessage === 'audioMessage' ? 'audio' : 'doc';
      if (fd.downloadUrl) attachments.push({ kind, url: fd.downloadUrl, name: fd.fileName || null });
    } else if (md.typeMessage === 'locationMessage') {
      const ld = md.locationMessageData || {};
      body = `📍 ${ld.nameLocation || ''} ${ld.latitude},${ld.longitude}`.trim();
    } else {
      body = '[' + md.typeMessage + ']';
    }

    const phone = String(externalId).replace(/@.*/, '');
    const conv = await findOrCreateConversation({
      channelId: channel.id,
      externalId: String(externalId),
      phone,
      name: senderData.senderName || senderData.chatName || null
    });

    await insertIncomingMessage({
      conversationId: conv.id,
      body,
      attachments,
      providerMsgId: payload.idMessage || null,
      senderName: senderData.senderName || null,
      sentAt: payload.timestamp ? new Date(payload.timestamp * 1000).toISOString() : null
    });
    return { ok: true };
  }

  // Статусы исходящих
  if (type === 'outgoingMessageStatus' || type === 'outgoingAPIMessageStatus') {
    const providerMsgId = payload.idMessage;
    const newStatus = payload.status; // sent | delivered | read | failed
    if (!providerMsgId || !newStatus) return { skipped: true };
    const map: Record<string, string> = { sent: 'sent', delivered: 'delivered', read: 'read', failed: 'failed' };
    const status = map[newStatus] || newStatus;
    const patch: any = { status };
    if (status === 'delivered') patch.delivered_at = new Date().toISOString();
    if (status === 'read') patch.read_at = new Date().toISOString();
    await sb.from('messages').update(patch).eq('provider_msg_id', providerMsgId);
    return { ok: true };
  }

  return { skipped: true, type };
}

// ─── Telegram Bot API parser ──────────────────────────────────────
// Документация: https://core.telegram.org/bots/api#update
async function handleTelegram(channel: any, payload: any) {
  const msg = payload.message || payload.edited_message;
  if (!msg) return { skipped: true };

  const from = msg.from || {};
  const chat = msg.chat || {};
  const externalId = String(chat.id);
  const name = [from.first_name, from.last_name].filter(Boolean).join(' ').trim() || from.username || null;

  let body: string | null = msg.text || msg.caption || null;
  const attachments: any[] = [];

  // фото — берём самый большой size
  if (msg.photo?.length) {
    const ph = msg.photo[msg.photo.length - 1];
    const url = await tgGetFileUrl(channel, ph.file_id);
    if (url) attachments.push({ kind: 'image', url });
  }
  if (msg.document) {
    const url = await tgGetFileUrl(channel, msg.document.file_id);
    if (url) attachments.push({ kind: 'doc', url, name: msg.document.file_name });
  }
  if (msg.voice) {
    const url = await tgGetFileUrl(channel, msg.voice.file_id);
    if (url) attachments.push({ kind: 'audio', url });
  }
  if (msg.video) {
    const url = await tgGetFileUrl(channel, msg.video.file_id);
    if (url) attachments.push({ kind: 'video', url });
  }
  if (msg.location) {
    body = (body || '') + ` 📍 ${msg.location.latitude},${msg.location.longitude}`;
  }

  const conv = await findOrCreateConversation({
    channelId: channel.id,
    externalId,
    phone: msg.contact?.phone_number || null,
    name
  });

  await insertIncomingMessage({
    conversationId: conv.id,
    body,
    attachments,
    providerMsgId: String(msg.message_id),
    senderName: name,
    sentAt: msg.date ? new Date(msg.date * 1000).toISOString() : null
  });
  return { ok: true };
}

async function tgGetFileUrl(channel: any, fileId: string): Promise<string | null> {
  try {
    const token = channel.provider_config?.botToken;
    if (!token) return null;
    const r = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const j = await r.json();
    if (!j.ok || !j.result?.file_path) return null;
    return `https://api.telegram.org/file/bot${token}/${j.result.file_path}`;
  } catch (_) {
    return null;
  }
}

// ─── HTTP entry ───────────────────────────────────────────────────
// @ts-ignore deno deploy
Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider');
    const secret = url.searchParams.get('secret');

    if (!provider || !secret) {
      return new Response(JSON.stringify({ error: 'provider and secret required' }), { status: 400 });
    }

    // Найти канал по secret + провайдеру
    const { data: channel, error: chErr } = await sb
      .from('channels')
      .select('*')
      .eq('webhook_secret', secret)
      .eq('provider', provider)
      .eq('is_active', true)
      .maybeSingle();
    if (chErr) throw chErr;
    if (!channel) {
      return new Response(JSON.stringify({ error: 'channel not found or inactive' }), { status: 404 });
    }

    const payload = await req.json();
    let result: any;
    if (provider === 'green_api')         result = await handleGreenApi(channel, payload);
    else if (provider === 'telegram_bot') result = await handleTelegram(channel, payload);
    else result = { error: 'unknown provider' };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  } catch (e) {
    console.error('[inbox-webhook]', e);
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), { status: 500 });
  }
});
