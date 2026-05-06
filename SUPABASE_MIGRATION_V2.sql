-- ============================================================
-- PAYD — Migration V2
-- Запустить в Supabase → SQL Editor → New query
-- Безопасна: использует if not exists / on conflict do nothing
-- ============================================================

-- ============================================================
-- 1. CLIENTS — отдельная сущность (раньше жили в localStorage)
-- ============================================================
create table if not exists clients (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  phone          text,
  passport       text,
  address        text,
  dob            date,
  email          text,
  note           text,
  is_blacklisted boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
-- Уникальный phone (требуется для onConflict в PaydDB.sync.push)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'clients_phone_unique'
  ) then
    alter table clients add constraint clients_phone_unique unique (phone);
  end if;
end $$;
create index if not exists idx_clients_name on clients(full_name);

-- ============================================================
-- 2. PRODUCT_CATEGORIES — дерево с динамическими полями
-- ============================================================
create table if not exists product_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  parent_id   uuid references product_categories(id) on delete cascade,
  fields      jsonb default '[]'::jsonb,   -- [{label, example}]
  position    int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_cat_parent on product_categories(parent_id);
create index if not exists idx_cat_active on product_categories(is_active);

-- ============================================================
-- 3. PRODUCTS — каталог
-- ============================================================
create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category_id     uuid references product_categories(id),
  field_values    jsonb default '{}'::jsonb,
  price           numeric(12,2) not null default 0,
  purchase_price  numeric(12,2),
  status          text default 'instock',     -- instock | order | archived
  is_active       boolean default true,
  stock           int default 0,
  sku             text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_products_cat on products(category_id);
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_products_status on products(status);
create unique index if not exists idx_products_sku on products(sku) where sku is not null and length(sku) > 0;

-- ============================================================
-- 4. PRODUCT_PRICE_HISTORY + триггер
-- ============================================================
create table if not exists product_price_history (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid references products(id) on delete cascade,
  price           numeric(12,2) not null,
  purchase_price  numeric(12,2),
  changed_by      uuid references auth.users(id),
  reason          text,
  ts              timestamptz default now()
);
create index if not exists idx_pph_product on product_price_history(product_id, ts desc);

create or replace function products_log_price_change() returns trigger as $$
begin
  if (TG_OP = 'INSERT') or (NEW.price is distinct from OLD.price) or (NEW.purchase_price is distinct from OLD.purchase_price) then
    insert into product_price_history (product_id, price, purchase_price, changed_by)
    values (NEW.id, NEW.price, NEW.purchase_price, auth.uid());
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_products_price_history on products;
create trigger trg_products_price_history
  after insert or update of price, purchase_price on products
  for each row execute function products_log_price_change();

-- ============================================================
-- 5. CONTRACTS — отдельные договоры
-- ============================================================
create table if not exists contracts (
  id                 uuid primary key default gen_random_uuid(),
  number             text not null unique,        -- ДР-0142/2026
  app_id             uuid references applications(id) on delete cascade,
  type               text default 'murabaha',     -- standard | murabaha | ijara
  signed_at          timestamptz,
  signed_by          text,                        -- метод: sms | paper
  status             text default 'draft',        -- draft | signed | terminated
  terminated_at      timestamptz,
  termination_reason text,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
create index if not exists idx_contracts_app on contracts(app_id);
create index if not exists idx_contracts_status on contracts(status);

-- ============================================================
-- 6. DOCUMENTS — все прикреплённые файлы
-- ============================================================
create table if not exists documents (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null,    -- application | client | contract | partner | payment
  entity_id    uuid not null,
  doc_type     text,             -- passport | contract | scan | photo | invoice
  filename     text not null,
  storage_path text not null,    -- путь в bucket payd-docs
  size_bytes   bigint,
  mime_type    text,
  uploaded_by  uuid references auth.users(id),
  uploaded_at  timestamptz default now()
);
create index if not exists idx_docs_entity on documents(entity_type, entity_id);
create index if not exists idx_docs_type on documents(doc_type);

-- ============================================================
-- 7. PROMO_CAMPAIGNS — акции
-- ============================================================
create table if not exists promo_campaigns (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  code         text,
  description  text,
  type         text,                              -- discount | cashback | term_extension
  value        numeric(10,2),
  start_at     date,
  end_at       date,
  partner_id   uuid references partners(id),
  is_active    boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
create unique index if not exists idx_promo_code on promo_campaigns(code) where code is not null and length(code) > 0;
create index if not exists idx_promo_active on promo_campaigns(is_active);

-- ============================================================
-- 8. ИЗМЕНЕНИЯ В СУЩЕСТВУЮЩИХ ТАБЛИЦАХ
-- ============================================================

-- applications: связь с клиентом и товаром
alter table applications add column if not exists client_id uuid references clients(id);
alter table applications add column if not exists product_id uuid references products(id);
create index if not exists idx_apps_client on applications(client_id);
create index if not exists idx_apps_product on applications(product_id);

-- cash_ops: связь с заявкой
alter table cash_ops add column if not exists app_id uuid references applications(id);
create index if not exists idx_cash_ops_app on cash_ops(app_id);

-- profiles: HR-поля
alter table profiles add column if not exists position text;
alter table profiles add column if not exists department text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists birthday date;
alter table profiles add column if not exists hired_at date;
alter table profiles add column if not exists fired_at date;
alter table profiles add column if not exists base_salary numeric(12,2);
alter table profiles add column if not exists notes text;

-- ============================================================
-- 9. УНИВЕРСАЛЬНЫЙ ТРИГГЕР updated_at
-- ============================================================
create or replace function set_updated_at() returns trigger as $$
begin NEW.updated_at = now(); return NEW; end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'clients', 'products', 'product_categories', 'contracts',
      'promo_campaigns', 'partners', 'applications', 'application_workflows'
    ])
  loop
    execute format('drop trigger if exists trg_%I_updated on %I', t, t);
    execute format('create trigger trg_%I_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table clients               enable row level security;
alter table product_categories    enable row level security;
alter table products              enable row level security;
alter table product_price_history enable row level security;
alter table contracts             enable row level security;
alter table documents             enable row level security;
alter table promo_campaigns       enable row level security;

-- Базовые политики: авторизованные читают/пишут (роли можно ужесточить позже)
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'clients','product_categories','products','product_price_history',
      'contracts','documents','promo_campaigns'
    ])
  loop
    execute format(
      'drop policy if exists "auth all %I" on %I',
      t, t
    );
    execute format(
      'create policy "auth all %I" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')',
      t, t
    );
  end loop;
end $$;

-- ============================================================
-- 11. REALTIME (для синхронизации между сотрудниками)
-- ============================================================
do $$
begin
  begin alter publication supabase_realtime add table clients;            exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table product_categories; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table products;           exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table contracts;          exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table documents;          exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table promo_campaigns;    exception when duplicate_object then null; end;
end $$;

-- ============================================================
-- 12. STORAGE BUCKET для файлов
-- ============================================================
insert into storage.buckets (id, name, public)
values ('payd-docs', 'payd-docs', false)
on conflict (id) do nothing;

drop policy if exists "auth read payd-docs" on storage.objects;
drop policy if exists "auth upload payd-docs" on storage.objects;
drop policy if exists "auth delete payd-docs" on storage.objects;

create policy "auth read payd-docs" on storage.objects for select
  using (auth.role() = 'authenticated' and bucket_id = 'payd-docs');
create policy "auth upload payd-docs" on storage.objects for insert
  with check (auth.role() = 'authenticated' and bucket_id = 'payd-docs');
create policy "auth delete payd-docs" on storage.objects for delete
  using (auth.role() = 'authenticated' and bucket_id = 'payd-docs');

-- ============================================================
-- 13. АДМИН-АККАУНТ Джабраилов
-- ============================================================
-- Привязывает уже существующий auth.users (ibrahimich@gmail.com) к профилю
-- с ролью admin и ФИО «Джабраилов Ибрагим». Все остальные пользователи
-- блокируются на уровне приложения (RLS уже гарантирует требование auth).
insert into profiles (id, full_name, role, active)
select id, 'Джабраилов Ибрагим', 'admin', true
from auth.users
where email = 'ibrahimich@gmail.com'
on conflict (id) do update set
  full_name = excluded.full_name,
  role      = 'admin',
  active    = true;

-- ============================================================
-- ГОТОВО. Проверка:
-- ============================================================
select 'tables' as kind, count(*) as n from information_schema.tables
  where table_schema = 'public' and table_name in (
    'clients','product_categories','products','product_price_history',
    'contracts','documents','promo_campaigns'
  )
union all
select 'storage_buckets', count(*) from storage.buckets where id = 'payd-docs';
-- Должно вернуть: tables=7, storage_buckets=1
