# Payd — Roadmap

Дорожная карта работ по проекту. Дата: 2026-05-08.

## Статус

- ✅ **Этап 1** — уборка фейковых демо-дефолтов (см. [DEMO_DEFAULTS.md](DEMO_DEFAULTS.md), волны 1.1–1.4 + критичные фиксы цепочки СБ).
- 🔄 **Этап 2** — миграции БД и расширения функционала (текущий список ниже).

---

## Этап 2 — миграции БД и улучшения

### Soft delete заявок

**Задача.** Сейчас удаление заявки в `zhurnal.html` — hard delete с каскадом по `payments / partner_reservations / contracts(draft) / workflows`. `application_history` сохраняется как audit trail. Откат удаления невозможен — данные потеряны навсегда.

**Что сделать:**
1. Миграция БД: добавить колонку `applications.deleted_at TIMESTAMPTZ NULL` + индекс по ней.
2. В `db.js` — `applicationsDelete` поменять с физического `remove` на `upsert({ deleted_at: now })`. Зависимые таблицы тоже либо мягко (deleted_at), либо оставить hard.
3. Во всех читающих файлах (`zhurnal.html`, `manager.html`, `sb.html`, `kassir.html`, `lk-client.html`, etc.) — фильтр `WHERE deleted_at IS NULL` в `PaydDB.list/get` (потребует поддержку фильтра в `db.js`).
4. UI — раздел «Корзина» с возможностью восстановить (`deleted_at = null`) или окончательно удалить через 30 дней (cron-задача).

**Зачем:** обратимость случайного удаления, требование Этапа 2.

**Зависимости:** требует Supabase migration. Триггер для автоудаления через 30 дней — отдельной задачей.

---

### Idempotency key для applications (cross-device)

**Задача.** В Wave «защита от дублей» добавлен `idempotency_key` на стороне фронта. Поле передаётся в `PaydDB.applications.create`, проверяется в `localStorage`. Из-за того, что колонка отсутствует в БД, `normalizeForCloud` отфильтровывает её — защита работает только в одной вкладке/устройстве.

**Что сделать:**
1. Миграция БД: `ALTER TABLE applications ADD COLUMN idempotency_key TEXT UNIQUE`.
2. В `db.js` — добавить `idempotency_key` в `ALLOWED_COLUMNS.applications`.
3. Опционально — в `applicationsCreate` при `error.code === '23505'` (unique violation) перейти на чтение существующей записи и вернуть её.

**Зачем:** защита от дублей при двойном клике в разных вкладках / на разных устройствах.

---

### Settings → templates rendering (`payd.settings.company.v1`)

**Задача.** В `db.js` есть `PaydDB.templates.loadCompany()` — читает реквизиты из `localStorage['payd.settings.company.v1']`. В `template.html`, `contract.html`, `zayavka.html.fillTemplate` company-маркеры (`{{company.name}}`, `{{company.inn}}`, `{{company.legal_address}}`, `{{company.phone}}`, `{{company.director_name}}`, `{{company.city}}`) подставляются как `—` потому что settings никуда их не сохраняет.

**Что сделать:**
1. В `settings.html` — при сохранении формы реквизитов компании класть JSON в `localStorage['payd.settings.company.v1']`.
2. Опционально — таблица `company_settings` в Supabase (миграция) + `PaydDB.templates.loadCompany()` читает из обоих источников.

**Зачем:** в готовых договорах появятся реальные реквизиты компании.

---

### Интеграция contract.html с PaydDB.templates.render

**Задача.** Сейчас `contract.html` использует свой inline template literal с гибридным рендером (JS-interp + `{{маркеры}}`). В `template.html` живут полноценные шаблоны 6 типов (standard/murabaha/guarantee/act/partner/notice).

**Что сделать:**
1. Вынести `TEMPLATES` объект из `template.html` в `db.js` как `PaydDB.templates.byKey(key)` или отдельный модуль.
2. В `contract.html` — выбирать шаблон по `contract.type`, рендерить через `PaydDB.templates.render(tpl.content, ctx)` с `ctx = await PaydDB.templates.contextFromApp(app.id)`.
3. Убрать inline template literal в `contract.html` целиком.

**Зачем:** одна правда о договорах, шаблоны редактируются в одном месте.

---

### Сохранение шаблонов в БД (contract_templates)

**Задача.** Сейчас `template.html` редактирует `TEMPLATES` объект локально (без сохранения). История версий не работает.

**Что сделать:**
1. Миграция: `contract_templates(id, key, name, content, version, created_at)` + `contract_template_versions(id, template_id, content, version, created_by, created_at)`.
2. В `template.html` — кнопка «Сохранить шаблон» пишет в `contract_templates` через `PaydDB.upsert`, при изменениях создаёт версию.
3. История версий справа в UI — читает `contract_template_versions`.

---

### `application_stage_history` таблица

**Задача.** Сейчас события «смена этапа» пишутся в `application_history` с `action='stage.changed'`. В CLAUDE.md правило #4 требует отдельную таблицу `application_stage_history`.

**Что сделать:**
1. Миграция: `application_stage_history(id, app_id, stage, ts, by_user, meta)`.
2. В `db.js` — `PaydDB.workflows.advance` пишет дополнительно в эту таблицу.
3. В `zayavka.html` вкладка «История» — добавить отдельный блок «Этапы сделки» из новой таблицы (рядом с общим audit-логом).

---

### Справочники в БД (правило #2 CLAUDE.md)

**Задача.** Партнёры (`partners.html`), клиенты (`clients.html`), товары (`products.html`) хранятся **только в localStorage** — нарушение правила #2.

**Что сделать:**
1. Миграции таблиц `partners / clients / products / product_categories / partner_categories / partner_statuses / promo_types / roles / product_statuses` (некоторые уже есть в COLLECTIONS).
2. Переписать страницы на `PaydDB.list/upsert` вместо direct localStorage.
3. Хардкоды `<select><option>` (роли, категории, типы) грузить из БД.

---

### Прямые `sb.from(...)` минуя `db.js`

**Задача.** В нескольких файлах (`zayavka-new.html`, `kassa.html`, `kassir.html`, `partner.html`, `sb.html`, `employees.html`, `contract.html`, `contracts.html`, `promo.html`, `audit.html`) есть прямые вызовы Supabase минуя `PaydDB.*`. Нарушение правила #1.

**Что сделать:**
1. Обернуть в `PaydDB.*` методы (по списку из AUDIT.md → ОБЩЕЕ).
2. После — добавить ESLint-правило / pre-commit hook, запрещающий `sb.from\(` в HTML/JS-файлах вне `db.js`.

---

### Реализация `data-live` обработчика (finance + reports + audit + dashboard)

**Задача.** Многие KPI и графики используют атрибут `data-live="kpi:..."`, но обработчика, который их рендерит, нет в `app.js`. Сейчас в `finance.html` и `reports.html` обработчики реализованы локально внутри файлов.

**Что сделать:**
1. Вынести `data-live`-роутер в `app.js` (`PaydApp.live.register('kpi:...', async () => ...)`).
2. Универсальный механизм подписки → обновляет все элементы с одинаковым ключом разом.

---

### Удаление `data.js` целиком

**Задача.** `data.js` всё ещё в репозитории (файл из 858 строк с демо-данными). После Wave 1 фиксов он не подключается ни одним HTML, но физически лежит в корне.

**Что сделать:**
1. Финальный `grep -rn 'data\.js'` → проверить что нет даже комментариев со ссылками.
2. `git rm data.js`.
3. Обновить AUDIT.md — отметить как закрытый пункт.

---

### Прочее

- Удаление в карточке заявки (`zayavka.html`) — пока только из журнала.
- Массовое удаление (выделить несколько → удалить все).
- Восстановление удалённых (после soft delete).
- RLS на Supabase для всех таблиц с PII (currently anon key has full access).
- Полная миграция реквизитов компании из `settings.html` в Supabase `company_settings`.
- Migration: `cashes/cash_ops` — RLS, политики доступа.
- Тестирование (нет тестов, есть только смок-тесты вручную).

---

## Этап 3 — финансовая логика и отчётность

(планируется после Этапа 2)

- Реальный скоринг СБ (вместо `wf.sb_score = 0`).
- Расчёт остатка долга по графику платежей в `lk-client.html`.
- Сводные финансовые отчёты с реальными агрегациями.
- Экспорт в 1С (сейчас всё disabled).
- Интеграция эквайринга для онлайн-оплат через ЛК.
