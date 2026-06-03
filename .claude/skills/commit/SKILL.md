---
name: commit
description: Делает git add + commit + push по правилу «одна задача за раз». Запускается вручную командой /commit.
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git status *) Bash(git diff *) Bash(git commit *) Bash(git push *) Bash(git log *)
---

# Коммит одной задачи

Зафиксируй текущую завершённую задачу. Текст после /commit — основа описания, если задан: $ARGUMENTS

## Шаги
1. `git status` и `git diff` — покажи, что меняется. Если в diff намешаны несвязанные изменения — предупреди и спроси, прежде чем коммитить всё разом.
2. Собери осмысленное сообщение коммита на русском: что сделано и зачем. Если задан $ARGUMENTS — используй как основу.
3. `git add` нужных файлов → `git commit` → `git push`.
4. Покажи итог: хеш коммита и что запушено.

Не добавляй ничего сверх текущей задачи.
