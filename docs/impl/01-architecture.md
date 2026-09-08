# 01 — Architecture and stack

Канон: [08](../08-system-architecture.md) ADR-001…005, [24](../24-implementation-spec.md) DEC-01, 14, 15, 23, 24.

## 1. Принцип

Один процесс Next.js, одна PostgreSQL, S3-совместимое хранилище, Telegram Bot API.  
**Простота → надёжность → поддержка.** Нет микросервисов, Redis, Elasticsearch, Kubernetes.

## 2. Frontend

- **Next.js App Router** (RSC по умолчанию).
- Маршруты = экраны spec §3.5 (`/`, `/search`, `/listings/[id]`, `/login`, `/onboarding/*`, `/create/*`, `/profile`, `/admin/*`, `/legal/*`).
- UI: токены U1 в CSS variables + **Tailwind** + **shadcn/ui** (DEC-24). Компоненты подгоняются под макеты, не наоборот.
- Формы: React + Server Actions; валидация **Zod** на сервере (и зеркало на клиенте для UX).
- Клиентский state: минимум (чипы поиска в URL `searchParams`). Нет Redux.
- Server state: RSC + `revalidatePath` / `revalidateTag`. Нет React Query в MVP, пока не появится частый клиентский refetch.

Навигация как **P-1 APPROVED** (DEC-10): Home / Search / Create / Profile. Desktop header тот же смысл, не отдельный «Кабинеты/События/Вакансии» как три приложения — типы на Search чипами. (Расхождение 24 §3.4 vs U1 — см. [09](09-consistency.md).)

## 3. Backend

Тот же Next.js: Server Actions, Route Handlers, RSC.  
Домен в `src/modules/*` — чистые функции + Prisma. UI и webhook не содержат правил статусов.

**Server:** сессия, Zod, Prisma, запись analytics, jobs.  
**Client:** вёрстка, `next` в ссылках логина, Telegram Widget, клик контакта.

## 4. Modular monolith

```text
src/
  app/                 # маршруты, layouts, Server Actions тонкие
  modules/
    auth/
    profiles/
    catalogs/          # Location, Specialization
    listings/          # CRUD, media, lifecycle
    search/            # только published-запросы (читает listings)
    moderation/        # approve/reject/unpublish, reports
    contact/           # выдача контакта + contact_clicked
    telegram/          # webhook, send, channel; не знает формы create
    notifications/     # preferences, enqueue DM
    analytics/         # insert event
    jobs/              # expire, retry notify
  lib/                 # db, env, session, storage
```

Границы (из 08): Listings **не** вызывает Bot API. После approve — in-process `onListingPublished()` → notifications + telegram. Запрет циклического импорта `listings` ↔ `telegram`.

**Объединения модулей:**

| Идея | Решение |
| --- | --- |
| Users + Profiles | Один модуль `profiles` (User+Profile+TelegramAccount). Auth отдельно (сессия, verify hash). |
| Search vs Listings | Search — тонкий read-API «только published». Логика фильтров не копируется в create. |
| Moderation vs Reports | Один модуль `moderation` (очередь, item, reports). Мало кода, общая authz admin. |
| Notifications vs Telegram | Notifications = «кому и зачем»; Telegram = «как отправить». |

Admin — не отдельный деплой: `app/admin/*` + `moderation` + `auth.requireAdmin()`.

## 5. Data flow

```text
Browser → RSC / Server Action → module → Prisma → PostgreSQL
                              ↘ storage (presign)
Telegram → POST /api/telegram/webhook → telegram module
Approve → listing.status=published → notifications.enqueue → job send
         → telegram.postChannel (job, не в HTTP approve если медленно)
```

Approve в HTTP: смена статуса + ModerationAction + analytics в одной транзакции. Send Telegram — job (DEC-23, тот же процесс). Если p95 approve > 2s из-за TG — тогда Redis (08), не сейчас.

## 6. Routing (приложение)

| Путь | Auth |
| --- | --- |
| `/`, `/search`, `/listings/[id]`, `/legal/*` | публично |
| `/login?next=` | гость |
| `/onboarding/*` | сессия, !profile_completed |
| `/create`, `/create/[type]`, `/profile`, `/settings` | сессия + completed (create) |
| `/admin/*` | role=admin |
| `/api/v1/auth/telegram` | нет (hash) |
| `/api/telegram/webhook` | secret |
| `/internal/jobs/*` | CRON_SECRET |

`next` — только относительный путь своего origin. См. [04](04-auth.md).

## 7. Stack (фиксация для E1)

Репозиторий пуст — берём ASSUMPTION 08/24, не выдумываем другой фреймворк.

| Слой | Выбор | Почему |
| --- | --- | --- |
| Runtime | Node 22, Next.js 15 App Router | Один процесс, RSC |
| Язык | TypeScript strict | 24 |
| UI | Tailwind 4 + shadcn | DEC-24 |
| Формы | Server Actions + Zod | меньше REST ради REST |
| Валидация | Zod shared schemas | 12 |
| State | URL + RSC | MVP |
| БД | PostgreSQL 16 | ADR-002 |
| ORM | **Prisma** | миграции с дня 1; не в 24 — техвыбор |
| Auth | Telegram Login Widget + httpOnly session cookie (jose/iron) | DEC-04 |
| Файлы | S3-совместимый API; **local disk** в development | DEC-01, 19 |
| Логи | stdout JSON | 15 |
| Ошибки | опционально Sentry после staging | не блокер E1 |
| Тесты | Vitest + Playwright | 13 |
| Jobs | `node-cron` или HTTP `/internal/jobs` | DEC-23 |

Не используем: Nest отдельным сервисом, GraphQL, tRPC как обязательный слой, Zustand глобально.

## 8. Внешние интеграции

- Telegram Login Widget + Bot API + Channel.
- Object storage (Timeweb S3 / Cloudflare R2 / AWS — **вендор не заморожен**, интерфейс `Storage.put`).
- SMTP нет в MVP.

## 9. Hosting

DEC-01: один процесс + managed Postgres + S3. Конкретный PaaS/VPS — **не блокирует local E1**. Staging/prod — вопрос к Product перед первым деплоем (не блокирует план и каркас репо).
