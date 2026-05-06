-- ============================================================
-- PAYD — Migration V2 FIX (запусти после Migration V2)
-- Меняет тип id у products / product_categories / связанных полей
-- с uuid на text. Постгрес запрещает менять тип PK пока на него
-- ссылается FK — поэтому сначала дропаем ВСЕ FK, потом меняем
-- типы, потом возвращаем FK.
-- ============================================================

-- 1) Drop all FKs referencing products.id / product_categories.id
alter table products              drop constraint if exists products_category_id_fkey;
alter table product_categories    drop constraint if exists product_categories_parent_id_fkey;
alter table product_price_history drop constraint if exists product_price_history_product_id_fkey;
alter table applications          drop constraint if exists applications_product_id_fkey;

-- 2) Drop default uuid generators on PK
alter table products              alter column id drop default;
alter table product_categories    alter column id drop default;

-- 3) Alter all referencing columns from uuid → text
alter table products              alter column id          type text using id::text;
alter table products              alter column category_id type text using category_id::text;
alter table product_categories    alter column id          type text using id::text;
alter table product_categories    alter column parent_id   type text using parent_id::text;
alter table product_price_history alter column product_id  type text using product_id::text;
alter table applications          alter column product_id  type text using product_id::text;

-- 4) Re-add FKs (text → text now)
alter table product_categories
  add constraint product_categories_parent_id_fkey
  foreign key (parent_id) references product_categories(id) on delete cascade;

alter table products
  add constraint products_category_id_fkey
  foreign key (category_id) references product_categories(id);

alter table product_price_history
  add constraint product_price_history_product_id_fkey
  foreign key (product_id) references products(id) on delete cascade;

-- applications.product_id — оставляем без FK (товар может быть удалён)

-- ============================================================
-- Проверка
-- ============================================================
select 'products.id'              as col, data_type from information_schema.columns
  where table_name = 'products' and column_name = 'id'
union all
select 'product_categories.id',  data_type from information_schema.columns
  where table_name = 'product_categories' and column_name = 'id'
union all
select 'product_price_history.product_id', data_type from information_schema.columns
  where table_name = 'product_price_history' and column_name = 'product_id'
union all
select 'applications.product_id', data_type from information_schema.columns
  where table_name = 'applications' and column_name = 'product_id';
-- Все должны быть text
