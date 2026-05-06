-- ============================================================
-- PAYD — Migration V3
-- Цепочка заявка → справочники + полный график платежей
-- ============================================================

-- 1) applications: snapshot полей расчёта + связь с тарифом
alter table applications add column if not exists tariff_id     text;
alter table applications add column if not exists markup_pct    numeric(8,2);
alter table applications add column if not exists markup_amount numeric(12,2);
alter table applications add column if not exists base_price    numeric(12,2);  -- цена товара ДО наценки

-- product_id и client_id уже добавлены в V2; убедимся что тип text
do $$ begin
  if exists (select 1 from information_schema.columns where table_name='applications' and column_name='product_id' and data_type<>'text') then
    alter table applications alter column product_id type text using product_id::text;
  end if;
exception when others then null; end $$;

-- 2) payments: полный график
alter table payments add column if not exists num         int default 0;
alter table payments add column if not exists due_date    date;
alter table payments add column if not exists status      text default 'pending';
alter table payments add column if not exists paid_at     timestamptz;
alter table payments add column if not exists kind        text default 'installment';

-- num: 0 = первоначальный взнос, 1..N = ежемесячные
-- status: pending | paid | overdue | cancelled
-- kind: down_payment | installment

create index if not exists idx_payments_due_status on payments(status, due_date);
create index if not exists idx_payments_app_num on payments(app_id, num);

-- 3) cash_articles — служебные статьи на кассу
insert into cash_articles (id, name, dir, color, group_name)
values
  ('a_first_pay',    'Первоначальный взнос',         'in',  'success', 'Платежи рассрочки'),
  ('a_installment',  'Платёж по графику',            'in',  'success', 'Платежи рассрочки'),
  ('a_late_pay',     'Платёж с просрочкой',          'in',  'warning', 'Платежи рассрочки'),
  ('a_partner_pay',  'Закупка у партнёра',           'out', 'danger',  'Закупка'),
  ('a_partner_comm', 'Комиссия партнёру',            'out', 'warning', 'Партнёры')
on conflict (id) do nothing;

-- 4) Проверка
select 'applications.tariff_id'    as col, data_type from information_schema.columns where table_name='applications' and column_name='tariff_id'
union all select 'applications.markup_pct', data_type from information_schema.columns where table_name='applications' and column_name='markup_pct'
union all select 'payments.due_date', data_type from information_schema.columns where table_name='payments' and column_name='due_date'
union all select 'payments.num', data_type from information_schema.columns where table_name='payments' and column_name='num'
union all select 'payments.status', data_type from information_schema.columns where table_name='payments' and column_name='status';
