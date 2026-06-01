-- ============================================================
-- PAYD — SEED PHASE 1
-- Дата: 2026-06-01
-- Цель: Реальные взаимосвязанные данные (без демо-моков)
--       для всех справочников + 10 чеченских партнёров + 45 клиентов.
--
-- БЕЗОПАСНО: транзакционно (BEGIN/COMMIT), идемпотентно
-- (ON CONFLICT DO NOTHING / WHERE NOT EXISTS).
-- Можно перезапускать — дубликатов не будет.
--
-- Запустить в Supabase Studio → SQL Editor → New Query → Run.
-- После выполнения внизу скрипта есть проверочные SELECT'ы.
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION A. SCHEMA MIGRATION (SQL Шага 1A)
--   Добавляет partners.tariff_id + создаёт partner_aliases.
-- ============================================================

-- A.1 partners.tariff_id — кастомный тариф партнёра (NULL = глобальный)
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS tariff_id text REFERENCES tariffs(id) ON DELETE SET NULL;

-- A.2 partner_aliases — история переименований
CREATE TABLE IF NOT EXISTS partner_aliases (
  old_name   text PRIMARY KEY,
  new_name   text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- A.3 Realtime publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE partner_aliases;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- A.4 RLS на partner_aliases (как у partners)
ALTER TABLE partner_aliases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "auth read partner_aliases" ON partner_aliases
    FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "auth write partner_aliases" ON partner_aliases
    FOR ALL USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- SECTION B. TARIFFS (3 шт)
--   t_basic — по умолчанию, стандартная Мурабаха
--   t_promo — короткая (3-6 мес), низкая наценка
--   t_ijara — исламский (Иджара)
-- ============================================================

INSERT INTO tariffs (id, name, description, types, terms, min_dp, max_amount, murabaha_rates, ijara_rates, is_default)
VALUES
  ('t_basic',
   'Базовый',
   'Стандартная рассрочка / Мурабаха. Сроки 3-12 мес.',
   ARRAY['standard','murabaha'],
   ARRAY[3,6,9,12],
   10,
   1500000,
   '{"3":5, "6":10, "9":13, "12":17}'::jsonb,
   NULL,
   TRUE),

  ('t_promo',
   'Промо',
   'Короткая рассрочка для мелкой техники. 3-6 мес, минимальная наценка.',
   ARRAY['standard'],
   ARRAY[3,6],
   15,
   200000,
   '{"3":3, "6":7}'::jsonb,
   NULL,
   FALSE),

  ('t_ijara',
   'Иджара (исламский)',
   'Шариатская аренда с переходом права. 6-24 мес.',
   ARRAY['ijara'],
   ARRAY[6,12,18,24],
   20,
   1500000,
   NULL,
   '{"6":15, "12":20, "18":24, "24":28}'::jsonb,
   FALSE)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION C. CASHES (2 кассы)
--   c_main — Грозный (центральный офис)
--   c_argun — Аргун (филиал)
--   Используем WHERE NOT EXISTS т.к. cashes.id — uuid (нет unique на name).
-- ============================================================

INSERT INTO cashes (name, address, kkt, fn, responsible, balance, status)
SELECT 'Касса Грозный (центр)', 'Грозный, пр. Путина, 17', 'ККТ-001', 'ФН-001', 'Старший кассир', 0, 'active'
WHERE NOT EXISTS (SELECT 1 FROM cashes WHERE name = 'Касса Грозный (центр)');

INSERT INTO cashes (name, address, kkt, fn, responsible, balance, status)
SELECT 'Касса Аргун', 'Аргун, ул. Кадырова, 31', 'ККТ-002', 'ФН-002', 'Кассир филиала', 0, 'active'
WHERE NOT EXISTS (SELECT 1 FROM cashes WHERE name = 'Касса Аргун');


-- ============================================================
-- SECTION D. CASH_ARTICLES (10 статей)
--   V3 миграция уже добавила: a_first_pay, a_installment, a_late_pay,
--   a_partner_pay, a_partner_comm. Здесь добавляем недостающие 5.
-- ============================================================

INSERT INTO cash_articles (id, name, dir, color, group_name) VALUES
  ('a_first_pay',    'Первоначальный взнос',         'in',  'success', 'Платежи рассрочки'),
  ('a_installment',  'Платёж по графику',            'in',  'success', 'Платежи рассрочки'),
  ('a_late_pay',     'Платёж с просрочкой',          'in',  'warning', 'Платежи рассрочки'),
  ('a_partner_pay',  'Закупка у партнёра',           'out', 'danger',  'Закупка'),
  ('a_partner_comm', 'Комиссия партнёру',            'out', 'warning', 'Партнёры'),
  ('a_cash_in',      'Внесение наличных в кассу',    'in',  'info',    'Корректировка'),
  ('a_cash_out',     'Снятие наличных из кассы',     'out', 'info',    'Корректировка'),
  ('a_refund_out',   'Возврат клиенту',              'out', 'danger',  'Возвраты'),
  ('a_inkass_out',   'Передача инкассатору',         'out', 'info',    'Инкассация'),
  ('a_correct',      'Корректировка остатка',        'in',  'gray',    'Корректировка')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION E. PRODUCT_CATEGORIES (6 категорий)
-- ============================================================

INSERT INTO product_categories (id, name, position, is_active, fields) VALUES
  ('cat_phones',     'Телефоны и планшеты',     1, TRUE, '[{"label":"Цвет","example":"Чёрный"},{"label":"Память","example":"256GB"}]'::jsonb),
  ('cat_laptops',    'Ноутбуки и компьютеры',   2, TRUE, '[{"label":"Цвет","example":"Серебристый"},{"label":"Конфигурация","example":"M3 / 16GB / 512GB"}]'::jsonb),
  ('cat_appliances', 'Бытовая техника',         3, TRUE, '[{"label":"Цвет","example":"Белый"},{"label":"Модель","example":"WD-8512"}]'::jsonb),
  ('cat_furniture',  'Мебель',                  4, TRUE, '[{"label":"Цвет/ткань","example":"Бежевый велюр"},{"label":"Размер","example":"3.2 × 1.8 м"}]'::jsonb),
  ('cat_auto',       'Автомобили',              5, TRUE, '[{"label":"Цвет","example":"Белый"},{"label":"Комплектация","example":"Comfort"},{"label":"Год","example":"2024"}]'::jsonb),
  ('cat_cafe',       'Оборудование для кафе',   6, TRUE, '[{"label":"Производитель","example":"Jura"},{"label":"Модель","example":"E8"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION F. PRODUCTS (15 товаров)
-- ============================================================

INSERT INTO products (id, name, category_id, field_values, price, purchase_price, status, is_active, stock, sku) VALUES
  -- Phones (3)
  ('prod_iphone_15_pro',     'iPhone 15 Pro 256GB Natural Titanium', 'cat_phones',     '{"Цвет":"Natural Titanium","Память":"256GB"}'::jsonb,  130000, 115000, 'instock', TRUE, 8,  'IP15PRO-256-NT'),
  ('prod_iphone_15',         'iPhone 15 128GB Чёрный',               'cat_phones',     '{"Цвет":"Чёрный","Память":"128GB"}'::jsonb,            80000,  70000,  'instock', TRUE, 15, 'IP15-128-BLK'),
  ('prod_samsung_s24',       'Samsung Galaxy S24 256GB Серебро',     'cat_phones',     '{"Цвет":"Серебристый","Память":"256GB"}'::jsonb,       75000,  65000,  'instock', TRUE, 12, 'SS-S24-256-SLV'),

  -- Laptops (3)
  ('prod_macbook_air_m3',    'MacBook Air M3 13" 512GB',             'cat_laptops',    '{"Цвет":"Серебристый","Конфигурация":"M3/16/512"}'::jsonb,    145000, 130000, 'instock', TRUE, 6,  'MBA-M3-13-512'),
  ('prod_macbook_pro_m4',    'MacBook Pro M4 14" 1TB',               'cat_laptops',    '{"Цвет":"Космос","Конфигурация":"M4/16/1TB"}'::jsonb,         220000, 200000, 'instock', TRUE, 3,  'MBP-M4-14-1TB'),
  ('prod_lenovo_ideapad',    'Lenovo IdeaPad 3 15.6"',               'cat_laptops',    '{"Цвет":"Серый","Конфигурация":"Ryzen 5/8/512"}'::jsonb,      55000,  47000,  'instock', TRUE, 10, 'LN-IP3-156'),

  -- Appliances (3)
  ('prod_washing_lg',        'Стиральная машина LG F2J5HS6W 7кг',    'cat_appliances', '{"Цвет":"Белый","Модель":"F2J5HS6W"}'::jsonb,                 45000,  38000,  'instock', TRUE, 12, 'LG-WM-7'),
  ('prod_fridge_atlant',     'Холодильник Atlant ХМ 4524 двухкам.',  'cat_appliances', '{"Цвет":"Белый","Модель":"ХМ-4524"}'::jsonb,                  38000,  32000,  'instock', TRUE, 8,  'ATL-XM-4524'),
  ('prod_oven_bosch',        'Духовой шкаф Bosch HBJ558YS0Q',        'cat_appliances', '{"Цвет":"Нержавейка","Модель":"HBJ558YS0Q"}'::jsonb,          32000,  27000,  'instock', TRUE, 5,  'BSH-HBJ558'),

  -- Furniture (2)
  ('prod_sofa_corner',       'Диван угловой Прага бежевый',          'cat_furniture',  '{"Цвет/ткань":"Бежевый велюр","Размер":"3.2x1.8м"}'::jsonb,   65000,  52000,  'instock', TRUE, 4,  'FRN-SOFA-PRG'),
  ('prod_bedroom_set',       'Спальный гарнитур Милан 5 предметов',  'cat_furniture',  '{"Цвет/ткань":"Молочный дуб","Размер":"5 предметов"}'::jsonb, 120000, 95000,  'instock', TRUE, 2,  'FRN-BDR-MLN'),

  -- Auto (2)
  ('prod_lada_vesta',        'Lada Vesta SW 1.6 2024',               'cat_auto',       '{"Цвет":"Белый","Комплектация":"Comfort","Год":"2024"}'::jsonb,    1450000, 1350000, 'instock', TRUE, 3, 'AUTO-VESTA-2024'),
  ('prod_haval_jolion',      'Haval Jolion 1.5T Comfort 2024',       'cat_auto',       '{"Цвет":"Серебристый","Комплектация":"Comfort","Год":"2024"}'::jsonb, 2200000, 2050000, 'instock', TRUE, 2, 'AUTO-JOLION-2024'),

  -- Cafe (2)
  ('prod_coffee_jura',       'Кофемашина Jura E8 Chrome',            'cat_cafe',       '{"Производитель":"Jura","Модель":"E8 Chrome"}'::jsonb,        180000, 155000, 'instock', TRUE, 3,  'CAFE-JURA-E8'),
  ('prod_fridge_display',    'Витрина холодильная Polair DC92SD',    'cat_cafe',       '{"Производитель":"Polair","Модель":"DC92SD-S"}'::jsonb,       95000,  78000,  'instock', TRUE, 2,  'CAFE-POLAIR-DC92')
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- SECTION G. PARTNERS (10 чеченских торговых точек)
--   ИНН — placeholder (правильный формат 10 цифр, но не зарегистр. в ФНС).
--   category — иконка из partners.html ICONS (phone/sofa/shop/home/tv).
--   color — палитра из partners.html PALETTES.
-- ============================================================

INSERT INTO partners (name, legal, inn, contact, address, phone, email, category, color, commission, status, tariff_id)
VALUES
  ('Радуга',             'ООО «Радуга»',           '2014000010', 'Магомедов А.С.', 'Грозный, пр. Путина, 17',              '+7 (8712) 22-11-10', 'info@raduga-grz.ru',      'shop',     'indigo', 5.0, 'active', NULL),
  ('ТехноМир',           'ИП Дудаев Р.М.',         '201400001011','Дудаев Р.М.',    'Грозный, ул. Маяковского, 42',         '+7 (8712) 22-11-22', 'sales@technomir.ru',      'phone',    'blue',   4.5, 'active', NULL),
  ('Магнолия',           'ООО «Магнолия Мебель»',  '2014000012', 'Висаитова Л.А.', 'Грозный, ул. Идрисова, 8',             '+7 (8712) 22-11-33', 'order@magnolia-mbl.ru',   'sofa',     'violet', 6.0, 'active', NULL),
  ('Кавказ-Авто',        'ООО «Кавказ-Авто»',      '2014000013', 'Тагаев Ш.И.',    'Грозный, пр. Кадырова, 54',            '+7 (8712) 22-44-55', 'sales@kavkaz-auto.ru',    'shop',     'teal',   3.0, 'active', NULL),
  ('BAYT',               'ИП Бекмурзаев А.Х.',     '201400001415','Бекмурзаев А.Х.','Грозный, ул. Анисимова, 15',           '+7 (8712) 22-77-88', 'info@bayt.ru',            'home',     'green',  5.5, 'active', NULL),
  ('Кавказ-Электро',     'ООО «Кавказ-Электро»',   '2015000001', 'Эльдиев И.М.',   'Гудермес, ул. Кадырова, 12',           '+7 (8715) 22-33-44', 'info@kavkaz-electro.ru',  'tv',       'yellow', 4.0, 'active', NULL),
  ('Стиль-Плюс',         'ООО «Стиль-Плюс»',       '2016000001', 'Тагиров М.М.',   'Шали, ул. Шейха Мансура, 8',           '+7 (8714) 22-11-11', 'sales@stil-plus.ru',      'sofa',     'orange', 5.5, 'active', NULL),
  ('АвтоВыбор',          'ИП Хатуев Х.Л.',         '201700000118','Хатуев Х.Л.',   'Аргун, ул. Бачаева, 19',               '+7 (8714) 33-22-11', 'info@avtovybor.ru',       'shop',     'red',    3.5, 'active', NULL),
  ('Comfort House',      'ООО «Комфорт Хаус»',     '2018000001', 'Дашаева М.Р.',   'Урус-Мартан, ул. Хамзатова, 22',       '+7 (8714) 44-55-66', 'order@comfort-house.ru',  'sofa',     'pink',   5.0, 'active', NULL),
  ('Smart City Маркет',  'ИП Юсупов М.С.',         '201900000120','Юсупов М.С.',   'Курчалой, ул. Кадырова, 6',            '+7 (8714) 55-66-77', 'info@smartcity-mkt.ru',   'shop',     'gray',   4.5, 'active', NULL)
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- SECTION H. CLIENTS (45 чеченских клиентов)
--   ФИО — реальные чеченские фамилии/имена/отчества.
--   Паспорта — NULL (по запросу: без паспортных данных).
--   Телефоны — +7 (928) XXX-XX-XX (Мегафон Чечня), уникальные.
--   Адреса — реальные улицы Грозного / Гудермеса / Аргуна / Шали /
--           Урус-Мартана / Курчалоя.
-- ============================================================

INSERT INTO clients (full_name, phone, address, email, is_blacklisted) VALUES
  -- Мужчины (1-34)
  ('Дудаев Магомед Русланович',         '+7 (928) 100-01-01', 'Грозный, ул. Маяковского, 42',          NULL, FALSE),
  ('Ахмадов Хусейн Висаитович',          '+7 (928) 100-01-02', 'Грозный, ул. Идрисова, 8',              NULL, FALSE),
  ('Кадыров Адам Сулиманович',           '+7 (928) 100-01-03', 'Грозный, пр. Путина, 17',               NULL, FALSE),
  ('Висаитов Магомед Ахмедович',         '+7 (928) 100-01-04', 'Грозный, ул. Анисимова, 15',            NULL, FALSE),
  ('Эльдиев Ислам Магомедович',          '+7 (928) 100-01-05', 'Грозный, пр. Кадырова, 54',             NULL, FALSE),
  ('Бекмурзаев Адам Хасанович',          '+7 (928) 100-01-06', 'Грозный, ул. Висаитова, 23',            NULL, FALSE),
  ('Дашаев Тимур Русланович',            '+7 (928) 100-01-07', 'Грозный, ул. Лорсанова, 9',             NULL, FALSE),
  ('Тагаев Шамиль Ибрагимович',          '+7 (928) 100-01-08', 'Грозный, ул. Маяковского, 67',          NULL, FALSE),
  ('Магомадов Ахмед Висханович',         '+7 (928) 100-01-09', 'Грозный, ул. Идрисова, 14',             NULL, FALSE),
  ('Алиев Аслан Магомедович',            '+7 (928) 100-01-10', 'Грозный, ул. Анисимова, 31',            NULL, FALSE),
  ('Гадаев Беслан Сулиманович',          '+7 (928) 100-01-11', 'Грозный, ул. Висаитова, 8',             NULL, FALSE),
  ('Битиев Ислам Ахмедович',             '+7 (928) 100-01-12', 'Грозный, пр. Кадырова, 22',             NULL, FALSE),
  ('Ярагиев Хусейн Лом-Алиевич',         '+7 (928) 100-01-13', 'Грозный, ул. Лорсанова, 41',            NULL, FALSE),
  ('Закаев Лом-Али Зелимович',           '+7 (928) 100-01-14', 'Грозный, пр. Путина, 89',               NULL, FALSE),
  ('Эльбиев Турпал Шамилевич',           '+7 (928) 100-01-15', 'Грозный, ул. Анисимова, 7',             NULL, FALSE),
  ('Сатуев Зелим Висханович',            '+7 (928) 100-01-16', 'Грозный, ул. Маяковского, 18',          NULL, FALSE),
  ('Минцаев Анзор Бесланович',           '+7 (928) 100-01-17', 'Грозный, ул. Идрисова, 56',             NULL, FALSE),
  ('Музаев Юсуп Идрисович',              '+7 (928) 100-01-18', 'Грозный, ул. Висаитова, 12',            NULL, FALSE),
  ('Юсупов Магомед Сатуевич',            '+7 (928) 100-01-19', 'Курчалой, ул. Кадырова, 6',             NULL, FALSE),
  ('Идрисов Ахмед Хасанович',            '+7 (928) 100-01-20', 'Грозный, пр. Путина, 42',               NULL, FALSE),
  ('Юнусов Рамзан Магомедович',          '+7 (928) 100-01-21', 'Гудермес, ул. Кадырова, 12',            NULL, FALSE),
  ('Махмадов Шамиль Юнусович',           '+7 (928) 100-01-22', 'Гудермес, ул. Шейха Мансура, 7',        NULL, FALSE),
  ('Хасанов Ислам Турпалович',           '+7 (928) 100-01-23', 'Гудермес, ул. Кадырова, 28',            NULL, FALSE),
  ('Назаров Анзор Хусейнович',           '+7 (928) 100-01-24', 'Гудермес, ул. Шейха Мансура, 19',       NULL, FALSE),
  ('Бакаев Тимур Асланович',             '+7 (928) 100-01-25', 'Гудермес, ул. Кадырова, 44',            NULL, FALSE),
  ('Юсаев Висхан Рамзанович',            '+7 (928) 100-01-26', 'Аргун, ул. Кадырова, 31',               NULL, FALSE),
  ('Истамулов Ибрагим Магомедович',      '+7 (928) 100-01-27', 'Аргун, ул. Бачаева, 19',                NULL, FALSE),
  ('Чимаев Хамзат Алимович',             '+7 (928) 100-01-28', 'Аргун, ул. Кадырова, 8',                NULL, FALSE),
  ('Кантаев Аслан Магомадович',          '+7 (928) 100-01-29', 'Аргун, ул. Бачаева, 47',                NULL, FALSE),
  ('Темирсултанов Адам Идрисович',       '+7 (928) 100-01-30', 'Шали, ул. Кадырова, 14',                NULL, FALSE),
  ('Цокаев Магомед Тимурович',           '+7 (928) 100-01-31', 'Шали, ул. Шейха Мансура, 8',            NULL, FALSE),
  ('Магомаев Беслан Адамович',           '+7 (928) 100-01-32', 'Шали, ул. Кадырова, 33',                NULL, FALSE),
  ('Эпиев Ибрагим Сулиманович',          '+7 (928) 100-01-33', 'Шали, ул. Шейха Мансура, 21',           NULL, FALSE),
  ('Темирханов Хусейн Лом-Алиевич',      '+7 (928) 100-01-34', 'Урус-Мартан, ул. Хамзатова, 22',        NULL, FALSE),

  -- Женщины (35-45)
  ('Дудаева Малика Руслановна',          '+7 (928) 100-01-35', 'Урус-Мартан, ул. Хамзатова, 11',        NULL, FALSE),
  ('Ахмадова Хеда Висаитовна',           '+7 (928) 100-01-36', 'Урус-Мартан, ул. Хамзатова, 56',        NULL, FALSE),
  ('Кадырова Раяна Сулимановна',         '+7 (928) 100-01-37', 'Грозный, пр. Кадырова, 78',             NULL, FALSE),
  ('Висаитова Аиша Ахмедовна',           '+7 (928) 100-01-38', 'Грозный, ул. Маяковского, 91',          NULL, FALSE),
  ('Эльдиева Залина Магомедовна',        '+7 (928) 100-01-39', 'Грозный, ул. Идрисова, 27',             NULL, FALSE),
  ('Бекмурзаева Луиза Хасановна',        '+7 (928) 100-01-40', 'Грозный, ул. Висаитова, 33',            NULL, FALSE),
  ('Дашаева Мадина Руслановна',          '+7 (928) 100-01-41', 'Грозный, ул. Лорсанова, 18',            NULL, FALSE),
  ('Тагаева Лиза Ибрагимовна',           '+7 (928) 100-01-42', 'Грозный, пр. Путина, 64',               NULL, FALSE),
  ('Магомадова Хава Висхановна',         '+7 (928) 100-01-43', 'Грозный, ул. Анисимова, 55',            NULL, FALSE),
  ('Хатуева Тамила Магомедовна',         '+7 (928) 100-01-44', 'Аргун, ул. Кадырова, 67',               NULL, FALSE),
  ('Истамулова Хадижа Магомедовна',      '+7 (928) 100-01-45', 'Курчалой, ул. Кадырова, 18',            NULL, FALSE)
ON CONFLICT (phone) DO NOTHING;


COMMIT;

-- ============================================================
-- ПРОВЕРОЧНЫЕ ЗАПРОСЫ (запустить после COMMIT отдельно)
-- ============================================================

-- 1. Сводный count по всем seed-таблицам
SELECT 'tariffs'             AS table_name, COUNT(*) AS n FROM tariffs            WHERE id IN ('t_basic','t_promo','t_ijara')
UNION ALL SELECT 'cashes',              COUNT(*) FROM cashes               WHERE name IN ('Касса Грозный (центр)','Касса Аргун')
UNION ALL SELECT 'cash_articles',       COUNT(*) FROM cash_articles        WHERE id LIKE 'a_%'
UNION ALL SELECT 'product_categories',  COUNT(*) FROM product_categories   WHERE id LIKE 'cat_%'
UNION ALL SELECT 'products',            COUNT(*) FROM products             WHERE id LIKE 'prod_%'
UNION ALL SELECT 'partners',            COUNT(*) FROM partners
UNION ALL SELECT 'clients',             COUNT(*) FROM clients
UNION ALL SELECT 'partner_aliases',     COUNT(*) FROM partner_aliases;

-- Ожидаем (минимум): tariffs=3, cashes>=2, cash_articles>=10, product_categories=6,
--                   products=15, partners>=10, clients>=45, partner_aliases=0.

-- 2. Проверка schema migration (Section A)
SELECT 'partners.tariff_id' AS col,
       (SELECT data_type FROM information_schema.columns
        WHERE table_name='partners' AND column_name='tariff_id') AS data_type
UNION ALL
SELECT 'partner_aliases.old_name',
       (SELECT data_type FROM information_schema.columns
        WHERE table_name='partner_aliases' AND column_name='old_name');
-- Ожидаем: оба type=text, не NULL.

-- 3. Партнёры с городами (для визуальной проверки)
SELECT name, address, category, color, commission
FROM partners
ORDER BY name;

-- 4. Раскладка клиентов по городам
SELECT
  CASE
    WHEN address LIKE 'Грозный%'        THEN 'Грозный'
    WHEN address LIKE 'Гудермес%'       THEN 'Гудермес'
    WHEN address LIKE 'Аргун%'          THEN 'Аргун'
    WHEN address LIKE 'Шали%'           THEN 'Шали'
    WHEN address LIKE 'Урус-Мартан%'    THEN 'Урус-Мартан'
    WHEN address LIKE 'Курчалой%'       THEN 'Курчалой'
    ELSE 'Другое'
  END AS city,
  COUNT(*) AS n
FROM clients
WHERE phone LIKE '+7 (928) 100-01-%'
GROUP BY 1
ORDER BY n DESC;

-- 5. Realtime publication: partner_aliases в списке?
SELECT tablename FROM pg_publication_tables
WHERE pubname='supabase_realtime' AND tablename='partner_aliases';
-- Ожидаем: 1 строка.
