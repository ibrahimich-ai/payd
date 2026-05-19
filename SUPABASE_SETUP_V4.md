# Inbox · Запуск (Миграция V4)

Пошаговая инструкция: применить миграцию, задеплоить функции,
подключить WhatsApp через Green API и Telegram-бот, открыть с телефона.

---

## 1. Применить миграцию в Supabase

1. Открой [Supabase Dashboard](https://supabase.com/dashboard) → проект
2. Слева **SQL Editor** → **New query**
3. Скопируй содержимое `SUPABASE_MIGRATION_V4.sql` и вставь
4. Нажми **Run** (или `Cmd/Ctrl+Enter`)
5. Внизу должен показаться список из 5 строк: `channels`, `lead_columns`,
   `conversations`, `messages`, `conversation_notes` (с количеством строк
   `lead_columns = 6`, остальные `0`)

Если ошибка `relation already exists` — миграция уже применена, можно
смело идти дальше. Миграция идемпотентна.

---

## 2. Задеплоить Edge Functions

Нужен установленный [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# один раз: войти и привязать проект
supabase login
supabase link --project-ref ehxfjvcyqvpjtahkmncf

# деплой
supabase functions deploy inbox-webhook --no-verify-jwt
supabase functions deploy inbox-send
```

`--no-verify-jwt` нужен только для `inbox-webhook` — туда стучатся
внешние сервисы (Green API, Telegram), у которых нет нашего JWT.
Защита идёт через `webhook_secret` в URL.

После деплоя проверь:
```bash
curl https://ehxfjvcyqvpjtahkmncf.supabase.co/functions/v1/inbox-webhook?provider=green_api&secret=test
# ожидаем 404 channel not found — это значит функция жива
```

---

## 3. Опубликовать сайт на GitHub Pages

Это нужно чтобы открывать платформу с телефона.

1. В репозитории на GitHub → **Settings** → **Pages**
2. **Source**: GitHub Actions
3. После пуша в `main` (или ручного запуска `Deploy to GitHub Pages` в
   Actions) сайт будет доступен по адресу:
   ```
   https://ibrahimich-ai.github.io/payd/
   ```
4. Открыть с телефона: `https://ibrahimich-ai.github.io/payd/inbox.html`

Workflow уже в `.github/workflows/pages.yml`, ничего настраивать не надо.

---

## 4. Подключить WhatsApp через Green API

1. Зарегистрироваться на [green-api.com](https://green-api.com)
2. Создать **Developer**-инстанс (бесплатный)
3. В ЛК Green API скопировать `idInstance` и `apiTokenInstance`
4. На телефоне с бизнес-номером: **WhatsApp** → **Настройки** →
   **Привязанные устройства** → отсканировать QR из ЛК Green API
5. Открыть платформу → `settings.html` → секция **«Каналы общения»**
6. **+ Подключить WhatsApp (Green API)** → ввести имя канала,
   `idInstance`, `apiTokenInstance`
7. После создания — нажать **Webhook URL** → URL скопируется в буфер
8. В ЛК Green API → **Настройки инстанса** → **URL для отправки
   уведомлений (Webhooks)** → вставить URL
9. В тех же настройках включить типы уведомлений:
   `incomingMessageReceived`, `outgoingMessageStatus`,
   `outgoingAPIMessageStatus`
10. Нажать **Тест** в платформе — должен показать `authorized`

---

## 5. Подключить Telegram-бот

1. В Telegram написать [@BotFather](https://t.me/BotFather) →
   `/newbot` → выбрать имя → получить **HTTP API token**
2. Открыть `settings.html` → **+ Подключить Telegram-бот** →
   вставить токен
3. Нажать **Webhook URL** → URL в буфере
4. Прописать webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL_ИЗ_БУФЕРА>"
   ```
   Должно вернуться `{"ok":true,"result":true}`
5. Нажать **Тест** в платформе → должен показать username бота

---

## 6. Проверить с телефона

1. Открыть на телефоне `https://ibrahimich-ai.github.io/payd/inbox.html`
2. На другом устройстве отправить сообщение на WhatsApp бизнес-номера
   или написать боту в Telegram
3. В платформе на телефоне в течение секунды должен появиться диалог
   в колонке «Новый»
4. Тапнуть диалог → ответить → сообщение приходит клиенту

---

## Типичные проблемы

| Симптом | Причина | Что делать |
|---------|---------|------------|
| Диалоги не появляются | Webhook URL не прописан в Green API | Проверь Webhooks-настройки в ЛК Green API |
| `channel not found` в логах | `webhook_secret` в URL не совпадает с БД | Скопируй URL из settings.html ещё раз |
| Сообщения отправляются как `failed` | `idInstance/apiTokenInstance` неверные | Сравни с ЛК Green API, нажми **Настроить** |
| Telegram не получает webhook | URL не зарегистрирован | `curl .../setWebhook?url=...` |
| RLS-ошибка в браузере | Не залогинен в Supabase Auth | Открой `index.html` и залогинься |
| На телефоне белый экран | CORS из-за file:// | Открывай только через GitHub Pages URL, не локальный файл |

---

## Полезные ссылки

- [Green API — формат webhook'ов](https://green-api.com/docs/api/receiving/notifications-format/)
- [Green API — отправка сообщений](https://green-api.com/docs/api/sending/SendMessage/)
- [Telegram Bot API — Update](https://core.telegram.org/bots/api#update)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
