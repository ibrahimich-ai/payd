# AUDIT — Payd

Аудит всех `.html` и `.js` файлов в корне проекта.
Дата: 2026-05-07.

Приоритеты:
- **1** — критично: фейковый логин, демо/мок на бизнес-пути, отсутствие snapshot/audit, фейковые финансовые данные.
- **2** — важно: моки в карточках, прямые вызовы Supabase из HTML минуя `db.js`, неработающие кнопки на критическом пути.
- **3** — некритично: дубли кода/разметки, мелкие косяки, верстка, мёртвые ссылки.

---

## Сводная таблица проблем

| Файл | Строка | Проблема | Приоритет | Что делать |
|------|--------|----------|-----------|------------|
| **data.js** | 1–858 | 16 демо-заявок (№142–153, 138–141) с реальными ФИ (Даурбекова, Магомедов и т.д.), фейковыми паспортами; экспорт `window.APPLICATIONS`, `window.DEFAULT_APP_ID = '142'` | 1 | Постепенно убрать. Каждое использование заменить на `PaydDB.list('applications')` |
| **app.js** | 782–821 | Кнопки SMS/Звонок/Рассылка/Одобрить/Отклонить/Запросить документы — только `toast()`, без записи в БД | 2 | Привязать к `PaydDB.upsert(...)` или `PaydDB.insert('sms_log', ...)` |
| **app.js** | 799 | Хардкод "Будет отправлено 23 SMS" | 3 | Считать число получателей динамически |
| **app.js** | 925 | "Платёж принят" — toast без связи с кассой/платёжкой | 2 | Запись в `PaydDB.insert('payments'/'cash_ops', ...)` |
| **app.js** | 1495 | Placeholder-имя "Иванов Иван Иванович" в мини-калькуляторе | 3 | Убрать или сделать пустым |
| **app.js** | 1521–1543 | Заявка из мини-калькулятора создаётся в localStorage, не в БД | 2 | После localStorage — `await PaydDB.upsert('applications', app)` |
| **db.js** | — | Файл чистый, замечаний нет | — | OK |
| **reports-data.js** | 62 | Прямой `PaydDB.cloud.sb()?.from('application_history')` без обёртки | 2 | Создать `PaydDB.audit.history()` |
| **index.html** | — | Аутентификация через `PaydDB.cloud.signIn()` + Supabase Auth — корректно | — | OK |
| **index.html** | 247, 272 | Ссылки "Забыли пароль?" и "Связаться с поддержкой" — `href="#"` без логики | 3 | Реализовать восстановление через Supabase Auth |
| **dashboard.html** | 79 | Хардкод имени "Ибрагим" вместо текущего пользователя | 3 | Грузить из profiles |
| **dashboard.html** | 221 | Загрузка `reports-data.js` (нужна проверка на хардкоды) | 2 | Заменить на `PaydDB.list(...)` |
| **partner.html** | 164, 247 | Прямые `sb.from('partner_payouts')` минуя db.js | 2 | Завернуть в `PaydDB.list/upsert` |
| **kassir.html** | 136, 289, 295, 302, 313, 345 | Прямые вызовы `sb.from(...)` минуя `db.js` | 2 | Завернуть все операции в `PaydDB.*` |
| **kassir.html** | 1015 | Комментарий упоминает "APPLICATIONS in data.js" | 2 | Убедиться, что код использует `PaydDB.list('applications')` |
| **sb.html** | 310 | Прямой `sb.from('profiles')` для определения роли | 2 | `PaydDB.getUserRole()` |
| **lk-client.html** | 171 | Хардкод имени "Луиза Саид-Усмановна" + фейковая задолженность/история на главном экране ЛК | 1 | Грузить данные текущего залогиненного клиента |
| **lk-client.html** | 233 | Хардкод тестовой заявки №0000000142 на главном экране ЛК | 1 | Грузить активные заявки текущего клиента из БД |
| **lk-client.html** | 373–375 | Кнопка "Оплатить" — только toast, без процессинга платежа | 2 | Реализовать платёжный поток или явная заглушка |
| **tablet-client.html** | 602–627 | `alert(...)` для валидации формы | 3 | Заменить на `PaydApp.toast()` |
| **tablet-client.html** | 632 | Номер заявки через `Math.random()` вместо БД | 2 | Получать номер из Supabase |
| **zayavka.html** | 937 | `<script src="data.js"></script>` подключает мок | 1 | Удалить импорт |
| **zayavka.html** | 1068–1077 | Fallback на `window.APPLICATIONS[_appId]` и хардкод id `'142'` | 1 | Убрать fallback на demo data |
| **zayavka.html** | 978–1059 | `buildAppFromCalc()` НЕ заполняет snapshot-поля | 1 | Добавить `snapshot_price`, `snapshot_markup_percent`, `snapshot_duration_months` |
| **zayavka.html** | 1804–1920 | `pushHistory()` — только localStorage, нет записи в `application_stage_history` | 1 | `PaydDB.insert('application_stage_history', ...)` |
| **zayavka.html** | 1827–1828 | Прямой `sb.from('application_history').select()` | 2 | `db.js: getApplicationHistory(appId)` |
| **zayavka.html** | 1923 | `PaydDB?.audit?.log?()` без гарантии реализации | 2 | Реализовать `audit.log` в `db.js` |
| **zayavka.html** | 2094 | `confirm()` для приёма платежа | 3 | Заменить на модальный диалог |
| **zayavka.html** | 2250 | `prompt()` для причины отказа | 3 | Заменить на модальный диалог |
| **zayavka.html** | 2288–2299 | SMS — `prompt()`, сохранение только в DOM | 2 | `PaydDB.insert('sms_log', ...)` |
| **zayavka-new.html** | 638, 640–641, 984–989 | snapshot не попадает в финальный объект перед `upsert` | 1 | Добавить полные snapshot-поля |
| **zayavka-new.html** | — | Не создаётся `application_stage_history` при создании заявки | 1 | `PaydDB.insert('application_stage_history', {stage:'created'})` |
| **zayavka-new.html** | 1019 | Прямой `sb.from('payments').insert(...)` | 2 | `db.js: createPaymentSchedule(...)` |
| **zayavka-new.html** | 1024 | `PaydDB.audit?.log?()` без гарантии | 2 | Реализовать |
| **zayavka-new.html** | 955 | Хардкод `commission: 4` | 3 | Брать из тарифа |
| **zayavka-new.html** | recalc | Тариф без ставки на срок → молча `markupPct = 0` | 2 | Валидация |
| **audit.html** | 111–370 | LEGACY MOCK ROWS с id=142 | 3 | Удалить |
| **audit.html** | 373 | Подключение `reports-data.js` для журнала | 2 | `PaydDB.list('audit_log')` |
| **audit.html** | 106–108 | `data-live="list:audit:events"` без обработчика | 2 | Реализовать `loadAuditLog()` |
| **audit.html** | 50, 54, 58 | Кнопки "Live", "Экспорт CSV", "Отчёт ЦБ" — без обработчиков | 2 | Привязать функции |
| **zhurnal.html** | 175–182 | `statusBadge()` без гарантии полей `rejected/sbPassed/contractSigned` | 2 | Уточнить схему |
| **zhurnal.html** | 188 | `PaydDB.list('applications')` корректно | — | OK |
| **template.html** | 234–250 | `TEMPLATES` хардкод | 2 | `PaydDB.list('contract_templates')` |
| **template.html** | 234–400 | "Сохранить шаблон" не привязана к функции | 1 | `saveTemplate()` |
| **template.html** | 98 | "Тест на клиенте" — `data-no-handler="true"` | 2 | Реализовать |
| **template.html** | 102 | "Дублировать" без обработчика | 2 | Реализовать |
| **template.html** | 168 | "+" для переменной — без логики | 2 | Реализовать |
| **template.html** | 355–375 | Хардкод истории версий | 3 | `PaydDB.list('contract_template_versions')` |
| **products.html** | 264–356 | Товары/категории только в localStorage | 1 | `PaydDB.list/upsert('products' / 'product_categories')` |
| **products.html** | 171–174 | Хардкод статусов товара в `<select>` | 1 | Таблица `product_statuses` |
| **products.html** | 28–56 | Карточки разной высоты | 3 | min-height/выравнивание |
| **products.html** | 900–1040 | Seed-шаблоны (iPhone/Samsung/ноутбуки) хардкодом | 2 | Перенести в Supabase или удалить |
| **clients.html** | 159–167 | Клиенты только в localStorage | 1 | `PaydDB.list/upsert('clients')` |
| **clients.html** | 203–220 | Слияние localStorage + applications → дубли | 2 | Единый источник в Supabase |
| **client.html** | 238–242 | Чтение клиента из localStorage | 1 | Из таблицы `clients` |
| **client.html** | 245–250 | Слияние локальных + applications | 2 | FK на клиента |
| **client.html** | 387–390 | Сохранение правки только в localStorage | 1 | `PaydDB.upsert('clients', ...)` |
| **employees.html** | 142–148 | Прямой `sb.from('profiles').select('*')` | 1 | `PaydDB.list('profiles')` |
| **employees.html** | 244–246 | Сохранение через `sb.from('profiles').update(...)` | 1 | `PaydDB.upsert('profiles', ...)` |
| **employees.html** | 90–97 | Хардкод ролей в `<select>` | 2 | Таблица `roles` |
| **partners.html** | 149–173 | Партнёры только в localStorage | 1 | Таблица `partners` через `db.js` |
| **partners.html** | 332–356 | Создание партнёра — только в localStorage | 1 | `PaydDB.upsert('partners', ...)` |
| **partners.html** | 259–263 | Хардкод категорий | 2 | Таблица `partner_categories` |
| **partners.html** | 277–279 | Хардкод статусов | 2 | Таблица `partner_statuses` |
| **partners.html** | 479 | Статистика на лету из applications | 2 | OK для текущего объёма |
| **promo.html** | 131–139 | Прямой `sb.from('promo_campaigns')` | 1 | `PaydDB.list('promo_campaigns')` |
| **promo.html** | 87–91 | Хардкод типов акций | 2 | Таблица `promo_types` |
| **struktura.html** | 502–504 | Хардкод `?id=142` | 2 | Реальный пример или удалить |
| **settings.html** | — | Не охвачено в этом проходе | 2 | Отдельный аудит |
| **contract.html** | 103, 214 | Прямые `sb.from('contracts')` | 2 | `db.js: getContractById, updateContractStatus` |
| **contract.html** | 118–196 | Договор без snapshot-полей | 1 | Добавить колонки + заполнять при создании |
| **contract.html** | 42–45 | "Печать" — только `window.print()` | 3 | Опциональный html2pdf |
| **contracts.html** | 101–103 | Прямые `sb.from('contracts').select/order` | 2 | `db.js: listContracts(...)` |
| **finance.html** | 97–136 | 12 элементов `data-live="kpi:..."` со заглушками "0 ₽" — фейк на проде без обработчика | 1 | Реальный обработчик `data-live` через SUM/COUNT по таблицам |
| **finance.html** | 197 | `reports-data.js` подключён, но не используется | 1 | Удалить либо реализовать |
| **finance.html** | 77–88 | Кнопки без обработчиков | 2 | disabled/обработчик |
| **reports.html** | 84–135 | Чарты и KPI через `data-live` без обработчика | 1 | Реализовать рендер |
| **reports.html** | 63–70 | Кнопки без обработчиков | 2 | disabled/обработчик |
| **reports.html** | 296 | `reports-data.js` подключён, использование не очевидно | 3 | Проверить |
| **calculator.html** | 1371–1411 | snapshot расчёта не сохраняется в БД | 2 | `applications.calc_snapshot` JSONB |
| **calculator.html** | 914–916 | `href="#"` для footer-ссылок | 3 | Реальные пути или удалить |
| **integration-1c.html** | 156, 162, 166, 171 | KPI захардкожены ("47 документов" и т.д.) | 1 | Реальные `COUNT(*)` из `sync_log` |
| **integration-1c.html** | 568–622 | Журнал с фейковыми ФИ (Даурбекова, Хасиев) и номерами ПКО | 1 | Из `sync_log` динамически |
| **integration-1c.html** | 815 | Mock в toast "384 товара, 1 248 контрагентов" | 2 | Реальные счётчики |
| **integration-1c.html** | 139, 212, 226–227, 404, 409 | Хардкод URL `http://1c.payd.local`, фейковые партнёры | 2 | Конфиг → таблица `1c_settings` |
| **integration-1c.html** | 249–254, 313, 337, 365, 454, 776 | 7 кнопок без обработчиков | 2 | Привязать или disabled |
| **ОБЩЕЕ** | многие файлы | Дублирование header/sidebar/проверки роли | 3 | Централизовать в `app.js: mountShell()` |
| **ОБЩЕЕ** | многие файлы | localStorage как primary для справочников | 1 | Перевести primary на Supabase |
| **ОБЩЕЕ** | zayavka.html, zayavka-new.html, kassir.html, partner.html, sb.html, employees.html, contract.html, contracts.html, promo.html, audit.html | Прямые `sb.from(...)` минуя `db.js` | 2 | Завернуть в `PaydDB.*` |

---

## Топ-7 приоритетных действий

1. **Snapshot и stage-history в заявках/договорах** — `zayavka.html`, `zayavka-new.html`, `contract.html`. Нарушение правил #3, #4.
2. **Удалить fallback на `data.js`/`window.APPLICATIONS`** в `zayavka.html`, после чего убрать `data.js`.
3. **Перевести справочники на Supabase**: `products`, `clients`, `partners`.
4. **Заменить фейковые данные**: `finance.html`, `reports.html`, `integration-1c.html`.
5. **Обернуть прямые `sb.from(...)` в `PaydDB.*`** во всех HTML.
6. **lk-client.html** — заменить хардкод "Луиза Саид-Усмановна" + №142 на данные текущего пользователя.
7. **Реализовать `audit.log` в `db.js`** — правило #4.
