---
name: audit-db
description: Аудит работы с данными через db.js. Проверяет правильность использования PaydDB — чтение заявок через findByIdOrNumber, запись аудита через offline-outbox, рендер через templates.render, переходы через workflows. Ловит прямые записи в localStorage в обход PaydDB. Обязательно используй, когда речь о db.js, слое данных, localStorage, аудите, workflow или перед коммитом изменений в работе с данными.
context: fork
agent: Explore
---

# Аудит слоя данных (db.js / PaydDB)

Проверь, что весь код работает с данными через `PaydDB`, а не напрямую.

## Что искать
- `localStorage.setItem` / `localStorage.getItem` в обход `PaydDB` (особенно для бизнес-сущностей)
- Поиск заявки по id вручную вместо `PaydDB.applications.findByIdOrNumber`
- Запись в журнал аудита в обход `PaydDB.audit` (должна идти через outbox-буфер с offline-поддержкой)
- Ручной рендер шаблонов вместо `PaydDB.templates.render`
- Смена статусов/этапов в обход `PaydDB.workflows`

## Отчёт
Файл, строка, что не так, корректный вызов PaydDB на замену. В конце: чисто / список по приоритету. Только отчёт, без правок.
