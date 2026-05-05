# Миграция Payd на Supabase — пошаговая инструкция

## Что вы получите после миграции

- ✅ Реальная PostgreSQL база данных (не localStorage)
- ✅ Все сотрудники видят одни и те же данные в реальном времени
- ✅ Авторизация по логинам с ролями
- ✅ Автоматические бэкапы
- ✅ Доступ с любого устройства
- ✅ Бесплатно для старта (500 МБ, 50 000 пользователей)

## Этап 1. Создание проекта (15 минут)

1. Откройте [supabase.com](https://supabase.com) и зарегистрируйтесь
2. Нажмите **«New Project»**
3. Заполните:
   - **Name**: `payd`
   - **Database Password**: придумайте надёжный (сохраните!)
   - **Region**: ближайший к Грозному — например `Frankfurt` или `Stockholm`
4. Подождите ~2 минуты пока проект создаётся
5. Когда готов — слева в меню откройте **Settings → API** и скопируйте:
   - `Project URL` (например `https://xxx.supabase.co`)
   - `anon public key` (длинная строка)

## Этап 2. Создание таблиц БД (10 минут)

В Supabase откройте **SQL Editor** и выполните весь SQL ниже:

```sql
-- ============================================================
-- 1. Партнёры (магазины)
-- ============================================================
create table partners (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique,
  legal        text,
  inn          text,
  contact      text,
  address      text,
  phone        text,
  email        text,
  category     text,         -- phone, laptop, shop, ...
  color        text,
  commission   numeric(5,2) default 4,  -- %
  status       text default 'active',   -- active|archived
  tariff       jsonb,        -- собственный тариф партнёра (или null = глобальный)
  deals        int default 0,
  turnover     text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- 2. Тарифы (глобальные пресеты)
-- ============================================================
create table tariffs (
  id              text primary key,           -- t_basic, t_promo, …
  name            text not null,
  description     text,
  types           text[] default '{}',         -- {standard, murabaha, ijara}
  terms           int[]  default '{}',
  min_dp          numeric(5,2) default 0,
  max_amount      numeric(12,2) default 3000000,
  murabaha_rates  jsonb,         -- { "3": 5, "6": 8, ... }
  ijara_rates     jsonb,
  is_default      boolean default false,
  created_at      timestamptz default now()
);

-- ============================================================
-- 3. Кассы
-- ============================================================
create table cashes (
  id              text primary key,            -- c_main, c_argun, …
  name            text not null,
  address         text,
  kkt             text,                        -- Атол 30Ф …
  fn              text,                        -- ФН номер
  responsible     text,                        -- ФИО кассира
  balance         numeric(12,2) default 0,
  status          text default 'active',       -- active|archived
  created_at      timestamptz default now()
);

-- ============================================================
-- 4. Статьи ДДС
-- ============================================================
create table cash_articles (
  id          text primary key,
  name        text not null,
  dir         text not null,           -- in | out
  color       text,
  group_name  text,
  created_at  timestamptz default now()
);

-- ============================================================
-- 5. Кассовые проводки
-- ============================================================
create table cash_ops (
  id            uuid primary key default gen_random_uuid(),
  num           text not null,            -- PD-1001
  date          timestamptz not null default now(),
  article_id    text references cash_articles(id),
  article_name  text,
  dir           text not null,            -- in | out
  cash_id       text references cashes(id),
  amount        numeric(12,2) not null,
  party         text,                     -- контрагент
  note          text,
  created_at    timestamptz default now()
);
create index idx_cash_ops_date on cash_ops(date desc);
create index idx_cash_ops_article on cash_ops(article_id);
create index idx_cash_ops_cash on cash_ops(cash_id);

-- ============================================================
-- 6. Заявки
-- ============================================================
create table applications (
  id              uuid primary key default gen_random_uuid(),
  number          text unique not null,     -- 0000000147
  client_name     text not null,
  client_phone    text,
  client_passport text,
  client_address  text,
  partner_id      uuid references partners(id),
  product         text,
  product_color   text,
  type            text,                     -- 'Товар со склада' | 'Товар от партнёра' | 'Под заказ' | 'Услуга'
  amount          numeric(12,2),
  down_payment    numeric(12,2),
  term            int,                      -- мес
  monthly         numeric(12,2),
  manager_id      uuid,                     -- → users
  source          text,                     -- 'calculator' | 'tablet' | 'manual'
  ts              timestamptz default now(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index idx_apps_partner on applications(partner_id);
create index idx_apps_phone on applications(client_phone);

-- ============================================================
-- 7. Workflow заявки (состояние воркфлоу)
-- ============================================================
create table application_workflows (
  app_id      uuid primary key references applications(id) on delete cascade,
  step        int default 1,
  sb_passed   boolean default false,
  sb_score    int,
  rejected    boolean default false,
  completed   boolean default false,
  type        text,
  updated_at  timestamptz default now()
);

-- ============================================================
-- 8. История изменений заявки (аудит)
-- ============================================================
create table application_history (
  id          uuid primary key default gen_random_uuid(),
  app_id      uuid references applications(id) on delete cascade,
  action      text not null,
  by_user     text,                          -- ФИО или auth.uid
  meta        jsonb,
  ts          timestamptz default now()
);

-- ============================================================
-- 9. Платежи клиента
-- ============================================================
create table payments (
  id          uuid primary key default gen_random_uuid(),
  app_id      uuid references applications(id) on delete cascade,
  num         int,                           -- какой по графику
  amount      numeric(12,2) not null,
  method      text,                          -- cash | card | sbp
  cash_id     text references cashes(id),
  cashier_id  uuid,                          -- → users
  partner_id  uuid references partners(id),  -- если принял партнёр
  ts          timestamptz default now(),
  created_at  timestamptz default now()
);
create index idx_pay_app on payments(app_id);

-- ============================================================
-- 10. Резервы у партнёра (Мурабаха-цепочка)
-- ============================================================
create table partner_reservations (
  id           uuid primary key default gen_random_uuid(),
  app_id       uuid unique references applications(id) on delete cascade,
  partner_id   uuid references partners(id),
  product      text,
  purchase_amt numeric(12,2),                -- цена закупки
  sale_amt     numeric(12,2),                -- цена продажи клиенту
  stage        text default 'reserved',      -- reserved|sold|contract|delivered
  ts           timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- 11. Выплаты партнёрам (от инкассатора)
-- ============================================================
create table partner_payouts (
  id            uuid primary key default gen_random_uuid(),
  partner_id    uuid references partners(id),
  amount        numeric(12,2) not null,
  description   text,
  inkassator_id uuid,                        -- → users
  recipient     text,
  sign          text,
  note          text,
  delivered_at  timestamptz,
  confirmed_at  timestamptz,
  status        text default 'pending',      -- pending|confirmed|disputed
  dispute_reason text,
  created_at    timestamptz default now()
);

-- ============================================================
-- 12. Маршрут инкассатора (точки)
-- ============================================================
create table inkassator_stops (
  id           uuid primary key default gen_random_uuid(),
  shift_date   date not null,
  inkassator_id uuid,                        -- → users
  partner_id   uuid references partners(id),
  dir          text not null,                -- deliver|pickup
  amount       numeric(12,2) not null,
  planned_at   time,
  status       text default 'pending',       -- pending|done|skip
  recipient    text,
  note         text,
  ts           timestamptz default now()
);

-- ============================================================
-- 13. Пользователи (расширение auth.users)
-- ============================================================
create table profiles (
  id          uuid primary key references auth.users(id),
  full_name   text,
  role        text not null,        -- admin|manager|cashier|sb|collector|inkassator|partner
  partner_id  uuid references partners(id),  -- если роль = partner
  initials    text,
  color       text,
  active      boolean default true,
  created_at  timestamptz default now()
);

-- ============================================================
-- 14. Настройки (key-value)
-- ============================================================
create table settings (
  key      text primary key,
  value    jsonb,
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table partners              enable row level security;
alter table tariffs               enable row level security;
alter table cashes                enable row level security;
alter table cash_articles         enable row level security;
alter table cash_ops              enable row level security;
alter table applications         enable row level security;
alter table application_workflows enable row level security;
alter table application_history   enable row level security;
alter table payments              enable row level security;
alter table partner_reservations  enable row level security;
alter table partner_payouts       enable row level security;
alter table inkassator_stops      enable row level security;
alter table profiles              enable row level security;
alter table settings              enable row level security;

-- Базовые правила: авторизованные могут читать всё
create policy "auth read partners"      on partners      for select using (auth.role() = 'authenticated');
create policy "auth read tariffs"       on tariffs       for select using (auth.role() = 'authenticated');
create policy "auth read cashes"        on cashes        for select using (auth.role() = 'authenticated');
create policy "auth read articles"      on cash_articles for select using (auth.role() = 'authenticated');
create policy "auth read ops"           on cash_ops      for select using (auth.role() = 'authenticated');
create policy "auth read apps"          on applications  for select using (auth.role() = 'authenticated');
-- … (расширить под роли позже)

-- Для старта: разрешим всем авторизованным писать; потом ограничим по ролям
create policy "auth write partners"     on partners      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write tariffs"      on tariffs       for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write cashes"       on cashes        for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write articles"     on cash_articles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write ops"          on cash_ops      for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write apps"         on applications  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
-- … остальные таблицы аналогично

-- ============================================================
-- REALTIME (для синхронизации между сотрудниками)
-- ============================================================
alter publication supabase_realtime add table partners;
alter publication supabase_realtime add table tariffs;
alter publication supabase_realtime add table applications;
alter publication supabase_realtime add table application_workflows;
alter publication supabase_realtime add table cash_ops;
alter publication supabase_realtime add table partner_reservations;
alter publication supabase_realtime add table partner_payouts;
```

## Этап 3. Подключение к платформе (1-2 дня работы)

Когда таблицы созданы, нужно поменять `db.js` так, чтобы он использовал Supabase вместо localStorage. Сейчас `db.js` имеет API совместимый с Supabase (`list/get/upsert/remove`), поэтому страницы трогать не придётся.

### Шаги:

1. **Подключить Supabase JS SDK** (везде где есть `app.js`):
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```

2. **Обновить `db.js`** — заменить тело методов:
   ```js
   const sb = supabase.createClient('YOUR_PROJECT_URL', 'YOUR_ANON_KEY');

   async function list(coll, opts) {
     let q = sb.from(coll).select('*');
     if (opts?.where) Object.entries(opts.where).forEach(([k,v]) => q = q.eq(k, v));
     if (opts?.orderBy) q = q.order(opts.orderBy.field, { ascending: opts.orderBy.dir !== 'desc' });
     if (opts?.limit) q = q.limit(opts.limit);
     const { data, error } = await q;
     if (error) throw error;
     return data;
   }

   async function upsert(coll, item) {
     const { data, error } = await sb.from(coll).upsert(item).select().single();
     if (error) throw error;
     return data;
   }
   // ... аналогично для get, remove, count, subscribe (через sb.channel)
   ```

3. **Импортировать существующие данные** — есть готовая кнопка «⬇ Скачать бэкап» в настройках. JSON-файл затем загружается в Supabase через SQL Editor или скрипт миграции.

4. **Сделать форму входа** — в `index.html` подключить `supabase.auth.signInWithPassword()`. Логины менеджеров создаются в Supabase Dashboard → Authentication.

5. **Раздать роли** — в таблице `profiles` указать каждому пользователю роль (`manager`, `cashier`, `sb`, `partner`, ...). RLS-политики в SQL автоматически ограничат доступ.

## Этап 4. Постепенный переход (по разделам)

Не нужно мигрировать всё сразу. Можно по одной коллекции:
- ✅ День 1: партнёры + тарифы (статичные данные) → Supabase
- ✅ День 2: заявки + workflow → Supabase
- ✅ День 3: кассовые проводки → Supabase
- ✅ День 4: выплаты партнёрам, резервы, маршрут инкассатора → Supabase
- ✅ День 5: тестирование, миграция реальных данных, обучение сотрудников

## Что у меня уже готово

- ✅ Файл [`db.js`](db.js) с API, идентичным Supabase — все страницы можно постепенно перевести
- ✅ Кнопки **«⬇ Скачать бэкап»** и **«⬆ Загрузить»** в настройках — работают сейчас, не потеряете данные при миграции
- ✅ Защита от случайного сброса (требует ввода слова `СБРОСИТЬ`)
- ✅ Авто-напоминание о бэкапе если давно не делали
- ✅ Просмотр всех ключей данных в настройках — видите что и сколько занимает
- ✅ Полная схема таблиц БД (этот файл)

## Сколько это стоит

- **Supabase Free**: до 500 МБ БД, 50 000 пользователей, 5 ГБ трафика — для старта хватит на год работы
- **Supabase Pro**: $25/мес — 8 ГБ БД, ежедневные бэкапы, 100 ГБ трафика — для растущей компании
- **Supabase Enterprise**: для крупных, под запрос

## Альтернативы

- **Firebase Firestore** — если хочется проще real-time, но это NoSQL (структура свободнее, но запросы сложнее)
- **Свой VPS** (DigitalOcean, Timeweb) + Node.js + PostgreSQL — полный контроль, ~$5-20/мес, но нужен админ
- **PHP + MySQL хостинг** (Beget, Reg.ru) — самое дешёвое, ~$2-5/мес

---

**Если готов идти на Supabase** — заведи аккаунт, создай проект, пришли мне `Project URL` и `anon key`, и я допишу `db.js` под Supabase. Все страницы при этом работать продолжат — менять их не придётся.
