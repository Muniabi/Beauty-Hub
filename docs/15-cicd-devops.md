# 15 — CI/CD & DevOps (непрерывная интеграция, доставка и эксплуатация)

**Связано:** [08](08-system-architecture.md) · [13](13-qa-test-strategy.md)

Масштаб MVP: один репозиторий, без Kubernetes, без mesh. Сложность ops должна быть меньше сложности продукта.

---

## Environments (окружения)

| Окружение | Зачем MVP | Кто | Проверка | Fallback | Пересмотр |
| --- | --- | --- | --- | --- | --- |
| Local | Разработка | Dev | `npm test` / аналог | — | — |
| Staging | Прогон как прод, тестовый бот | Dev | Smoke [13] | Откат деплоя staging | Если нет времени — не пропускать, уменьшить частоту |
| Production | Пользователи | Tech Lead | Uptime, errors | Rollback | — |

Environment `development` на общем сервере **не обязателен** для 1–2 человек. Рекомендация: Local + Staging + Production.

Production не место для отладки фич.

---

## Repository (репозиторий)

Один git-репозиторий монолита. `docs/` уже здесь. Не монорепо сервисов.

Секреты не коммитить. `.env.example` без значений.

---

## Branching strategy (стратегия ветвления)

```text
main          ← production
feature/*     ← PR
fix/*
```

Без обязательного `develop` для маленькой команды (лишняя ветка). `ASSUMPTION`.

PR обязателен. Запрет прямого push в `main` (настройка GitHub/GitLab) — желательно.

---

## Pull requests / code review

- Минимум 1 ревью, если есть второй человек; иначе self-review чеклист: безопасность upload, статусы listing, нет секретов.
- Не `--no-verify`.
- Маленькие PR по story.

---

## CI (непрерывная интеграция)

```text
Commit
 ↓
Lint
 ↓
Typecheck
 ↓
Tests (unit + integration)
 ↓
Build
```

Зачем: не деплоить сломанную типизацию. Ответственный: Tech Lead. Проверка: CI red блокирует merge. Fallback: hotfix с последующим тестом, не привычка. Пересмотр: слишком долгий CI → урезать E2E в CI, оставить на staging.

E2E в CI: опционально nightly, не обязательно на каждый commit MVP.

---

## CD (непрерывная доставка)

```text
Merge main
 ↓
Deploy Staging
 ↓
Smoke Tests
 ↓
Ручной promote Production
```

Автопрод на каждый merge **не рекомендуется** до стабильной беты. Зачем ручной promote: модерация миграций и Telegram.

Ответственный: Tech Lead. Fallback: предыдущий docker image / предыдущий release. Пересмотр: автопрод когда smoke стабилен и миграции обратные.

---

## Secrets

- Hosting secret store / env.
- Staging и prod разные Telegram tokens и DB.
- Проверка: деплой без секрета падает явно.
- Fallback: не хардкод в коде.
- Пересмотр: утечка → ротация.

## Migrations

- Только вперёд в CI с бэкапом prod.
- Запрет разрушающих без плана.
- Проверка: migrate на staging копии.
- Fallback: restore backup.
- Пересмотр: expand/contract когда появятся нулевые даунтайм нужды.

## Backups

- Ежедневный dump PostgreSQL + retention (например 7–14 дней) `ASSUMPTION`.
- Проверка: restore на staging раз до публичного запуска и далее ежеквартально.
- Fallback: ручной dump перед рискованной миграцией.
- Object storage versioning желательно.

## Rollback

- Приложение: предыдущий релиз.
- Миграции: не всегда обратимы — поэтому опасные изменения двухшагово.
- Telegram: код бота откатывается вместе с приложением.

## Monitoring / logging / alerting

| Сигнал | Зачем MVP | Кто | Проверка | Fallback |
| --- | --- | --- | --- | --- |
| Uptime HTTP | Сайт жив | Tech | Внешний ping | Рестарт |
| Error tracker / logs | Исключения | Tech | Тестовая ошибка staging | SSH logs |
| Telegram send failure rate | Доставка | Tech | Failed notifications | Ручной пост в канал |
| Disk / DB size | Не упасть | Tech | Хостинг метрики | Чистка |

Не ставить полный APM до боли. Алерт: сайт 5xx, диск, падение job expire.

---

## Pipeline (конвейер)

```text
Commit
 ↓
Lint
 ↓
Typecheck
 ↓
Tests
 ↓
Build
 ↓
Deploy Staging
 ↓
Smoke Tests
 ↓
Production (ручной)
```

## Хостинг (DEC-01)

Рамка: один процесс приложения + managed PostgreSQL + S3-совместимое хранилище. Конкретный вендор (PaaS или VPS) выбирается в Foundation. Не Kubernetes.

## Ownership (сводка)

При совмещении ролей: один Technical Lead отвечает за CI, секреты, бэкапы, инциденты. Product не деплоит в prod.
