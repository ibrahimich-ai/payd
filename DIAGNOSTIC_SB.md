# Диагностика: цепочка одобрения СБ не работает

Дата: 2026-05-07. Анализ только текущего состояния кода. Никакие правки не делались.

## TL;DR (3 строки)

После клика «Одобрить» в СБ пишется `workflows.step=2`, но `manager.html` ждёт `step≥3` для колонки «Договор», а `zayavka.html` для статуса использует `sbPassed` (camelCase), хотя `sb.html` пишет `sb_passed` (snake_case). Плюс счётчик «Одобрено сегодня» пуст, потому что `PaydDB.audit.log` молча не пишет, если `_isOnline=false`. История этапов (`application_stage_history`) вообще не реализована.

---

## ЗАДАЧА 1 — ДИАГНОСТИКА

### A. Действие «Одобрить» в СБ

| Что | Где | Значение |
|-----|-----|----------|
| Кнопка | [sb.html:227](sb.html#L227) | `<button class="btn primary" data-act="approve" data-no-handler="true">✓ Одобрить</button>` |
| Обработчик | [sb.html:230](sb.html#L230) | `addEventListener('click', () => decide(a, true))` |
| Функция | [sb.html:241–259](sb.html#L241) | `async function decide(a, approve)` |
| Что пишет в `workflows` | [sb.html:243, 246](sb.html#L243) | `PaydDB.upsert('workflows', { app_id: a.id, sb_passed: approve, sb_score: 0, rejected: !approve, step: approve ? 2 : 0 })` |
| Поля workflows | — | `sb_passed=true`, `sb_score=0`, `rejected=false`, `step=2` |
| `applications` обновляется? | [sb.html:247–251](sb.html#L247) | **НЕТ при одобрении**. Только при отклонении: `if (!approve) PaydDB.upsert('applications', { ...a, rejected: true })` |
| `application_stage_history` | — | **НЕ ПИШЕТСЯ**. Никаких вызовов в файле нет |
| `application_history` (audit) | [sb.html:252](sb.html#L252) | `await PaydDB.audit.log(a.id, action)` — где `action = approve ? 'sb.approved' : 'sb.rejected'` |
| `scoring_checks` | — | **НЕТ.** Таблица не упоминается ни в коде, ни в схеме |
| Прямые вызовы Supabase | [sb.html:114, 119](sb.html#L114) | `PaydDB.cloud.sb()` + `sb.from('application_history').select(...)` для счётчиков |

### B. Действие «Отклонить»

| Что | Где | Значение |
|-----|-----|----------|
| Кнопка | [sb.html:226](sb.html#L226) | `<button class="btn danger" data-act="reject" data-no-handler="true">✕ Отклонить</button>` |
| Обработчик | [sb.html:231](sb.html#L231) | `addEventListener('click', () => decide(a, false))` |
| `workflows` | [sb.html:243, 246](sb.html#L243) | `{ sb_passed: false, sb_score: 0, rejected: true, step: 0 }` |
| `applications` | [sb.html:249–250](sb.html#L249) | `PaydDB.upsert('applications', { ...a, rejected: true })` ✓ |
| `application_history` | [sb.html:252](sb.html#L252) | `audit.log(a.id, 'sb.rejected')` |

### C. Счётчики в СБ

| KPI | Где | Источник |
|-----|-----|----------|
| «В очереди» | [sb.html:140](sb.html#L140), функция [`getQueue` 128–135](sb.html#L128) | `apps.filter(!a.rejected && !a.closed && (!wf || wf.sb_passed !== true))` |
| «Одобрено сегодня» | [sb.html:141](sb.html#L141) | `history.filter(h => h.action === 'sb.approved').length` |
| «Отклонено сегодня» | [sb.html:142](sb.html#L142) | `history.filter(h => h.action === 'sb.rejected').length` |
| «Принято решений» | [sb.html:143](sb.html#L143) | `history.filter(h => h.action?.startsWith('sb.')).length` |
| Источник `history` | [sb.html:119](sb.html#L119) | `sb.from('application_history').select('*').gte('ts', начало_сегодня)` — **прямой Supabase, минуя db.js** |
| Фильтр по «сегодня» | [sb.html:119](sb.html#L119) | `gte('ts', new Date(new Date().setHours(0,0,0,0)).toISOString())` — поле `ts` |

### D. CRM-колонки в `manager.html`

| Что | Где | Логика |
|-----|-----|--------|
| Загрузка | [manager.html:111–120](manager.html#L111) | `PaydDB.list('applications')` + `PaydDB.list('workflows')` |
| Распределение | [manager.html:122–131](manager.html#L122) | `classifyApp(a)` |
| «Закрыто/отказ» | стр. 123 | `a.rejected \|\| a.closed` |
| «Новые» | стр. 125, 130 | нет workflow, или fallthrough |
| «Активные» | стр. 126 | `wf.sb_passed && wf.step >= 4` |
| **«Договор»** | **стр. 127** | **`wf.sb_passed && wf.step >= 3`** ← обрати внимание на 3 |
| «На СБ» | стр. 128 | `!wf.sb_passed && !wf.rejected` |
| Realtime | [manager.html:196–199](manager.html#L196) | `PaydDB.subscribe('applications'/'workflows', load)` |

### E. Карточка заявки `zayavka.html`

| Что | Где | Логика |
|-----|-----|--------|
| Подключение `data.js` | [zayavka.html:937](zayavka.html#L937) | `<script src="data.js"></script>` (всё ещё подключен — это уже отмечено в AUDIT.md, приоритет 1) |
| Fallback на `window.APPLICATIONS` | [zayavka.html:1068–1077](zayavka.html#L1068) | если в localStorage заявки нет, берёт из мока `data.js` |
| Поток wf | [zayavka.html:1574–1602](zayavka.html#L1574) | `WF_KEY = 'payd.zayavka.wf.v1'` — **тот же ключ, что у `workflows` в COLLECTIONS** ([db.js:41](db.js#L41)) |
| Чтение wf | [zayavka.html:1595–1602](zayavka.html#L1595) | `step: _savedWf?.step ?? (_app.progressStep \|\| 1)`, `sbPassed: _savedWf?.sbPassed ?? !!_app.sbPassed`, `sbScore: _savedWf?.sbScore ?? (_app.sbScore \|\| 0)` |
| Запись wf | [zayavka.html:1576–1591](zayavka.html#L1576) | сохраняет в WF_KEY поля `{ app_id, step, sbPassed, sbScore, rejected, completed, type }` — **camelCase** |
| Бейдж статуса | [zayavka.html:1624–1670](zayavka.html#L1624) функция `applyWorkflow()` | `key = flow.keys[wf.step - 1]`; `stylesByKey[key]` → `{ t: 'НОВАЯ' \| 'НА ПРОВЕРКЕ' \| 'ДОГОВОР' \| ... }` |
| Прогресс % | [zayavka.html:1701](zayavka.html#L1701) | `(wf.step / totalSteps) * 100` |
| Текущий этап (текст) | [zayavka.html:1704](zayavka.html#L1704) | `flow.labels[wf.step - 1]` (для «Товар со склада»: `['Создано', 'Обработка', 'Договор', 'Первый взнос', 'Выдача']`) |
| Уровень риска | [zayavka.html:425–432, 1214–1228](zayavka.html#L425) | `wf.sbScore` + `_app.sbScoreLabel` |
| История изменений | [zayavka.html:1818–1882](zayavka.html#L1818) функция `loadRealHistory()` | `sb.from('application_history').select('*').eq('app_id', _appId).order('ts', desc)` — **прямой Supabase** |
| Запись своего audit | [zayavka.html:1923](zayavka.html#L1923) | `PaydDB.audit.log(_appId, action, meta)` (только при действиях из самой карточки) |

### F. Инфраструктура в `db.js`

| Сущность | Состояние |
|----------|-----------|
| Коллекция `applications` | ✓ есть [db.js:40](db.js#L40), `pk: 'id'` |
| Коллекция `workflows` | ✓ есть [db.js:41](db.js#L41), таблица `application_workflows`, `pk: 'app_id'`, `type: 'map'` |
| Коллекция `application_history` | ✗ **НЕТ в COLLECTIONS** (но Supabase-таблица существует — пишется напрямую через `audit.log`) |
| Коллекция `application_stage_history` | ✗ **НЕТ ни в коде, ни в COLLECTIONS** |
| Коллекция `audit_log` | ✗ **НЕТ** |
| Коллекция `scoring_checks` | ✗ **НЕТ** |
| `ALLOWED_COLUMNS.applications` | [db.js:402](db.js#L402) — нет полей `sb_passed`, `rejected`, `sb_score`, `status`, `stage`, `step` |
| `ALLOWED_COLUMNS.workflows` | [db.js:403](db.js#L403) — `['app_id','step','sb_passed','sb_score','rejected','completed','type','updated_at']` (snake_case) |
| `auditLog` | [db.js:702–718](db.js#L702) — пишет в `application_history` напрямую через Supabase, **`if (!_isOnline) return;`** на стр. 704 — в офлайне молча выходит |
| `denormalizeFromCloud` для workflows | [db.js:555–559](db.js#L555) — конвертирует snake→camel (`sbPassed = sb_passed`), но **только при загрузке из облака**, не при чтении из localStorage |
| `normalizeForCloud` для workflows | [db.js:440–446](db.js#L440) — конвертирует camel→snake. Но в localStorage `upsert` сохраняет объект «как есть»: [db.js:134–155](db.js#L134) |
| Realtime subscribe | [db.js:263–280](db.js#L263) — для всех коллекций с `def.table`, включая `workflows` |

---

## ЗАДАЧА 2 — РАЗРЫВЫ

| # | Что должно быть | Что есть сейчас | Где разрыв |
|---|-----------------|-----------------|------------|
| 1 | После одобрения СБ заявка должна попасть в колонку «Договор» CRM | `manager.html` требует `wf.step ≥ 3`, а `sb.html` ставит `step = 2` | [sb.html:243](sb.html#L243) пишет `step: 2` vs [manager.html:127](manager.html#L127) условие `wf.step >= 3` |
| 2 | На карточке заявки после одобрения статус «ДОГОВОР» (или хотя бы «НА ПРОВЕРКЕ») | Остаётся «НОВАЯ» (если карточка открыта в другой вкладке без realtime) | `applyWorkflow()` берёт key через `flow.keys[wf.step-1]`. При step=1 → 'created' → «НОВАЯ». При step=2 (что пишет SB) → 'review' → «НА ПРОВЕРКЕ». «ДОГОВОР» появится только при step=3 ([zayavka.html:1604–1670](zayavka.html#L1604)) |
| 3 | После одобрения `wf.sbPassed=true` в карточке → бейдж риска «Низкий/Средний/Высокий» | Остаётся «Не проверена», 0/100 | **camelCase ↔ snake_case mismatch:** sb.html пишет `sb_passed`/`sb_score` ([sb.html:243](sb.html#L243)), zayavka.html читает `sbPassed`/`sbScore` ([zayavka.html:1597–1598](zayavka.html#L1597)). В localStorage оба ключа сосуществуют, но readers видят undefined |
| 4 | После одобрения вкладка «История» в карточке показывает «Проверка СБ пройдена» | Пусто | `audit.log(a.id, 'sb.approved')` [sb.html:252](sb.html#L252) → `application_history.insert(...)` в [db.js:709–714](db.js#L709). НО: **функция выходит, если `_isOnline=false`** ([db.js:704](db.js#L704)). Если в момент клика Supabase-сессия не успела восстановиться или нет интернета — запись не делается, ошибки не выводится |
| 5 | Счётчик «Одобрено сегодня» в СБ показывает 1 после клика | Показывает 0 | Тот же корень что и #4: запись в `application_history` не была сделана, `sb.from('application_history').gte('ts', сегодня)` возвращает пусто |
| 6 | При смене этапа должна появляться запись в `application_stage_history` | Таблицы и кода вообще нет | Правило #4 в `CLAUDE.md` нарушается. AUDIT.md (приоритет 1) — уже отмечено |
| 7 | Поле `sb_passed`/`step` должно быть видно манагерам при `PaydDB.list('workflows')` | Видно — синк работает | OK. Но в `denormalizeFromCloud` оно мапится на camelCase, а sb.html пишет snake-case → при backgroundPull из БД и localStorage поля возвращаются под `sbPassed`. Сейчас всё работает как лотерея — какой колл-сайт писал последним, его регистр и побеждает |
| 8 | `getQueue()` в СБ снимает заявку из очереди после одобрения | Снимает, если `wf.sb_passed === true` | Работает, но через snake-кейс. Совпадает с тем, что пишет `decide()` |

---

## ЗАДАЧА 3 — ПЛАН ИСПРАВЛЕНИЯ

### 3.1 Поля в БД (НЕ создавать миграции, только список)

**Уже существуют, ничего не нужно:**
- `applications`: `id`, `number`, `client_*`, `amount`, `down_payment`, `term`, `monthly`, `manager_id`, `ts`, `created_at`, `updated_at` ([db.js:402](db.js#L402))
- `application_workflows` (collection `workflows`): `app_id`, `step`, `sb_passed`, `sb_score`, `rejected`, `completed`, `type`, `updated_at` ([db.js:403](db.js#L403))
- `application_history`: `app_id`, `action`, `by_user`, `meta`, `ts` (используется через прямой Supabase в `auditLog`)

**Нужны для полной реализации правил CLAUDE.md, но НЕ блокируют этот фикс:**
- `application_stage_history` — таблица не существует. Можно жить через `application_history` с `action='stage.changed'` + `meta={from:..., to:...}`. **Делать миграцию не сейчас** — отметим в плане Этапа 2.
- `scoring_checks` — не нужна для этого фикса.

### 3.2 Что добавить в `db.js`

| Функция | Зачем | Где |
|---------|-------|-----|
| `PaydDB.workflows.advance(appId, toStep, extraFields)` | Обновляет workflow с **унификацией кейса** (всегда snake_case в localStorage и облаке). Внутри: `upsert('workflows', { app_id, step, sb_passed, sb_score, rejected, completed, type })`. После — пинает `notify('workflows')` для realtime ререндера | новый блок около [db.js:702](db.js#L702) |
| `PaydDB.audit.log` — поправить | Сейчас `if (!_isOnline) return;` молча. Нужно либо буферизировать в localStorage до восстановления связи, либо хотя бы **показывать предупреждение в консоли**. Минимально: лог в очередь `payd.audit.outbox.v1`, флаш при `cloudConnect` | [db.js:702–718](db.js#L702) |
| `denormalizeFromCloud` для localStorage upsert | Когда HTML пишет camelCase, db.js должен сам переводить в snake_case при `saveLocal`, а при `loadLocal` — обратно. Сейчас перевод только в `normalizeForCloud`/`denormalizeFromCloud` (только для облака) | [db.js:415–576](db.js#L415) — добавить аналог для локального стораджа |

### 3.3 Файлы для правки и порядок

```
1. db.js                    ← фундамент: унификация регистра + outbox для audit
2. sb.html                  ← decide(): step:2 → step:3 при approve, использовать только snake_case
3. zayavka.html             ← workflow load/save: использовать snake_case ИЛИ
                              использовать новый PaydDB.workflows.* API
4. (опц.) manager.html      ← если решим, что СБ-одобрение даёт «Договор», а не «На договор»,
                              условие step >= 3 уже верное и не правится
5. AUDIT.md                 ← снять пункты, что закрыты этой задачей
```

**Минимальный фикс (без правок db.js — быстро, но не идеально):**

```
A. sb.html:243              step: approve ? 3 : 0       (было 2)
B. sb.html:243              переименовать sb_passed → sbPassed, sb_score → sbScore
                            (привести к camelCase, как в zayavka.html)
C. manager.html:126-128     wf.sbPassed (camel) вместо wf.sb_passed (snake)
D. db.js — оставить как есть, пусть осадок snake/camel живёт пока
```

Это закроет баги #1–3 и #5. Бaги #4 и #7 (audit offline + грязная конвертация) останутся, но их можно делать вторым шагом.

**Правильный фикс:** см. 3.2 — централизовать через db.js функции. Дольше, но избавляет от дублирующихся преобразований и регистров в каждом потребителе.

### 3.4 Как проверять после каждого шага

| Шаг | Проверка |
|-----|----------|
| После A | В DevTools localStorage `payd.zayavka.wf.v1` для нашей заявки → `step: 3`. Открыть `manager.html` → заявка в колонке «Договор» |
| После B (camel) | В localStorage поля `sbPassed: true`, `sbScore: 0`. Открыть `zayavka.html?id=...` → бейдж статуса не «НОВАЯ», прогресс ≠ 1 из 5 |
| После C | manager.html `classifyApp` правильно читает `wf.sbPassed` |
| Audit log | В `application_history` Supabase появляется новая строка с `action='sb.approved'` и сегодняшним `ts`. Счётчик в SB-странице обновляется |
| Realtime | Открыть в двух вкладках manager.html и sb.html → одобрить в SB → колонка в manager переедет без перезагрузки страницы (через `subscribe`/`storage` event) |

---

## Открытые вопросы (требуют решения до правок)

1. **Какой контракт регистра?** snake_case (как в БД) или camelCase (как в zayavka)? Я бы выбрал **snake_case везде в localStorage и БД**, конвертацию делать только на UI-границе. Это избавит от рулетки.
2. **`application_stage_history`** — реализуем сейчас (отдельным шагом) или относим в Этап 2?
3. **Что значит `step` после одобрения СБ?** «Сейчас на этапе 3 = ДОГОВОР» или «Завершён этап 2 = ОБРАБОТКА (СБ)»? У текущего кода: step = индекс ТЕКУЩЕГО этапа (1-based). Поэтому при переходе СБ→договор должно быть `step = contractStep` (3 для большинства типов, 6 для «Товар от партнёра»). Сейчас захардкожено `step:2` — это **неправильно для всех типов**.
4. **Тип заявки** — `flow.contractStep` зависит от `wf.type`. SB не знает тип, но он есть в `applications.type`. Надо при `decide()` читать тип и выставлять `step = STAGE_FLOWS[type].contractStep`.

После твоего «ОК» по этим вопросам — берусь за код.
