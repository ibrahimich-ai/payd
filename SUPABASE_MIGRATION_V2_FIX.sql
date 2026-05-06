-- ============================================================
-- PAYD — Migration V2 FIX (запусти после Migration V2)
-- Меняет тип id у products и product_categories с uuid на text,
-- чтобы локальные строковые id ('cat_phones', 'p_1234') сохранялись
-- как есть и не требовали миграции.
-- ============================================================

-- 1) products
alter table products drop constraint if exists products_category_id_fkey;
alter table products alter column id drop default;
alter table products alter column id type text using id::text;
alter table products alter column category_id type text using category_id::text;

-- 2) product_categories
alter table product_categories drop constraint if exists product_categories_parent_id_fkey;
alter table product_categories alter column id drop default;
alter table product_categories alter column id type text using id::text;
alter table product_categories alter column parent_id type text using parent_id::text;

-- 3) Re-add FKs (теперь text→text)
alter table product_categories
  add constraint product_categories_parent_id_fkey
  foreign key (parent_id) references product_categories(id) on delete cascade;

alter table products
  add constraint products_category_id_fkey
  foreign key (category_id) references product_categories(id);

-- 4) product_price_history тоже text
alter table product_price_history drop constraint if exists product_price_history_product_id_fkey;
alter table product_price_history alter column product_id type text using product_id::text;
alter table product_price_history
  add constraint product_price_history_product_id_fkey
  foreign key (product_id) references products(id) on delete cascade;

-- 5) Уберём FK applications.product_id (он на uuid, локально text)
alter table applications drop constraint if exists applications_product_id_fkey;
alter table applications alter column product_id type text using product_id::text;
-- Не возвращаем FK — заявка может ссылаться на товар который уже удалили

-- ГОТОВО
select 'products' as t, data_type from information_schema.columns
  where table_name = 'products' and column_name = 'id'
union all
select 'product_categories', data_type from information_schema.columns
  where table_name = 'product_categories' and column_name = 'id';
-- Должно вернуть data_type = text для обоих
