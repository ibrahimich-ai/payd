-- ============================================================
-- PAYD — Migration V4
-- Омниканальный inbox: каналы (Green API / Telegram) →
-- диалоги → сообщения. Канбан-воронка диалогов + связь с
-- существующей таблицей applications и clients.
-- ============================================================

-- 1) CHANNELS — подключённые каналы (один на каждый WA-инстанс / TG-бота)
create table if not exists channels (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                    -- 'Основной WhatsApp', 'TG-бот продаж'
  provider        text not null check (provider in ('green_api','telegram_bot')),
  provider_config jsonb default '{}'::jsonb,        -- {idInstance, apiTokenInstance} | {botToken}
  webhook_secret  text not null,                    -- секрет в URL вебхука для аутентификации входящих
  is_active       boolean default true,
  display_color   text default '#22c55e',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create unique index if not exists idx_channels_webhook_secret on channels(webhook_secret);
create index if not exists idx_channels_active on channels(provider) where is_active;

-- 2) LEAD_COLUMNS — настраиваемые колонки канбана (справочник)
create table if not exists lead_columns (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  position    int not null default 0,
  color       text default '#64748b',
  is_default  boolean default false,                -- куда падают новые диалоги
  is_final    boolean default false,                -- архив / отказ
  created_at  timestamptz default now()
);
-- Только один is_default = true
create unique index if not exists idx_lead_columns_default
  on lead_columns(is_default) where is_default = true;

-- сид дефолтных колонок (только если таблица пустая)
insert into lead_columns (name, position, color, is_default, is_final)
select * from (values
  ('Новый',             1, '#22c55e', true,  false),
  ('В работе',          2, '#3b82f6', false, false),
  ('Расчёт отправлен',  3, '#a855f7', false, false),
  ('Ждём документы',    4, '#f59e0b', false, false),
  ('Заявка создана',    5, '#0ea5e9', false, true),
  ('Архив / отказ',     6, '#64748b', false, true)
) as v(name, position, color, is_default, is_final)
where not exists (select 1 from lead_columns);

-- 3) CONVERSATIONS — диалог с одним контактом по одному каналу
create table if not exists conversations (
  id                     uuid primary key default gen_random_uuid(),
  channel_id             uuid not null references channels(id) on delete restrict,
  contact_external_id    text not null,             -- chat_id (TG) / chatId (Green API)
  contact_phone          text,                      -- нормализованный +7XXXXXXXXXX
  contact_name           text,
  contact_avatar         text,
  client_id              uuid references clients(id) on delete set null,
  status_id              uuid references lead_columns(id),
  assigned_to            uuid references auth.users(id) on delete set null,
  tags                   jsonb default '[]'::jsonb, -- ["горячий","iphone"]
  starred                boolean default false,
  unread_count           int default 0,
  last_message_at        timestamptz default now(),
  last_message_preview   text,
  last_message_direction text check (last_message_direction in ('in','out') or last_message_direction is null),
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);
create unique index if not exists idx_conv_channel_contact
  on conversations(channel_id, contact_external_id);
create index if not exists idx_conv_status_lastmsg
  on conversations(status_id, last_message_at desc);
create index if not exists idx_conv_client
  on conversations(client_id) where client_id is not null;
create index if not exists idx_conv_assigned
  on conversations(assigned_to) where assigned_to is not null;
create index if not exists idx_conv_unread
  on conversations(unread_count) where unread_count > 0;
create index if not exists idx_conv_phone
  on conversations(contact_phone) where contact_phone is not null;

-- 4) MESSAGES — сообщения
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  direction       text not null check (direction in ('in','out')),
  body            text,
  attachments     jsonb default '[]'::jsonb,        -- [{kind:'image'|'doc'|'audio'|'video', url, name, size}]
  sender_name     text,                              -- имя оператора для 'out', имя клиента для 'in'
  sender_user_id  uuid references auth.users(id),   -- оператор для 'out'
  provider_msg_id text,                              -- idMessage (Green API) / message_id (Telegram)
  status          text default 'received'
                  check (status in ('received','sent','delivered','read','failed')),
  status_error    text,
  sent_at         timestamptz default now(),
  delivered_at    timestamptz,
  read_at         timestamptz,
  created_at      timestamptz default now()
);
create index if not exists idx_msg_conv_sent on messages(conversation_id, sent_at desc);
create index if not exists idx_msg_provider on messages(provider_msg_id) where provider_msg_id is not null;

-- 5) CONVERSATION_NOTES — внутренние комментарии (не уходят клиенту)
create table if not exists conversation_notes (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id         uuid references auth.users(id),
  user_name       text,                              -- кэш ФИО на момент комментария
  body            text not null,
  created_at      timestamptz default now()
);
create index if not exists idx_conv_notes_conv on conversation_notes(conversation_id, created_at desc);

-- 6) APPLICATIONS — связь заявки с диалогом
alter table applications add column if not exists conversation_id uuid;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'applications_conversation_fk') then
    alter table applications add constraint applications_conversation_fk
      foreign key (conversation_id) references conversations(id) on delete set null;
  end if;
end $$;
create index if not exists idx_apps_conversation
  on applications(conversation_id) where conversation_id is not null;

-- 7) Триггер: при insert messages обновляем conversations
create or replace function tg_messages_after_insert() returns trigger as $$
begin
  update conversations
  set last_message_at        = new.sent_at,
      last_message_preview   = left(coalesce(new.body, '[вложение]'), 200),
      last_message_direction = new.direction,
      unread_count           = case when new.direction = 'in'
                                    then unread_count + 1
                                    else unread_count end,
      updated_at             = now()
  where id = new.conversation_id;
  return new;
end $$ language plpgsql;

drop trigger if exists trg_messages_after_insert on messages;
create trigger trg_messages_after_insert
  after insert on messages
  for each row execute function tg_messages_after_insert();

-- 8) RLS
alter table channels           enable row level security;
alter table lead_columns       enable row level security;
alter table conversations      enable row level security;
alter table messages           enable row level security;
alter table conversation_notes enable row level security;

do $$
declare t text;
begin
  for t in select unnest(array['channels','lead_columns','conversations','messages','conversation_notes'])
  loop
    execute format('drop policy if exists "auth all %I" on %I', t, t);
    execute format(
      'create policy "auth all %I" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')',
      t, t
    );
  end loop;
end $$;

-- 9) Realtime publications (идемпотентно)
do $$ begin
  alter publication supabase_realtime add table conversations;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table conversation_notes;
exception when duplicate_object then null; end $$;

-- 10) Проверка
select 'channels'           as table_name, count(*) as rows from channels
union all select 'lead_columns',          count(*) from lead_columns
union all select 'conversations',         count(*) from conversations
union all select 'messages',              count(*) from messages
union all select 'conversation_notes',    count(*) from conversation_notes;
