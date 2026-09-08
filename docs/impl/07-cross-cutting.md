# 07 — Security, analytics, testing, DevOps

## 1. Security checklist

Канон [12](../12-security-plan.md).

| Тема | MVP |
| --- | --- |
| Auth | HMAC Telegram; короткий TTL `auth_date`; httpOnly session |
| Authorization | проверки в модулях, не только UI |
| Validation | Zod всех входов |
| XSS | React default escape; не `dangerouslySetInnerHTML` для user HTML |
| CSRF | SameSite cookie + origin check на mutations; Server Actions |
| Rate limit | login, contact, report, upload (in-memory / DB later) |
| Upload | MIME, size, decode, UUID keys |
| Telegram | webhook secret; не доверять unsigned widget |
| Admin | role в БД; `/admin` 403; не в онбординге |
| Secrets | env only; `.env` gitignore |
| PII | не в analytics props; logs без phone |
| Abuse | reports; block user status |
| Headers | HSTS prod, nosniff |

## 2. Analytics MVP

Таблица `analytics_event`. Не платформа.

Минимум (запрос + 14/24):

| Event | Когда |
| --- | --- |
| `page_view` | RSC layout ключевых страниц (path без query PII) |
| `search` / `search_performed` | search с type |
| `listing_view` / `listing_viewed` | карточка |
| `login_started` | открыт `/login` |
| `login_completed` / `user_registered` | успешный Login (registered только первый раз) |
| `listing_created` | create |
| `listing_submitted` | draft→pending или create pending |
| `listing_approved` / `listing_rejected` | admin |
| `contact_clicked` | успешный getContact |
| `report_created` / `report_submitted` | report |

`profile_completed`, `notification_sent` — тоже из 14, оставить.

North Star: Successful Connections/Week — **гипотеза**; в коде только proxy `contact_clicked`.

## 3. Testing

[13](../13-qa-test-strategy.md).

- **Unit:** Zod schemas, `safeNext`, lifecycle transitions, hash verify (mock).
- **Integration:** Prisma + test Postgres (или transaction rollback): create→pending→approve→search sees it; reject not in search.
- **E2E Playwright:**  
  1. guest → listing → login (mock Telegram) → contact; `next` сохранён.  
  2. create → pending → admin approve → published в каталоге.  
  3. report → admin resolve.
- Authz: guest не contact; user не approve; admin 403 для не-admin.
- Validation: Space без фото не pending.

CI: lint + unit на PR; e2e на main/staging.

## 4. DevOps (минимум)

[15](../15-cicd-devops.md). Не enterprise.

| | |
| --- | --- |
| Envs | `local` / `staging` / `production` |
| DB | managed Postgres; `prisma migrate` |
| Storage | S3 API; local disk в dev |
| Env vars | `DATABASE_URL`, `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_LOGIN_BOT`, `TELEGRAM_WEBHOOK_SECRET`, `CRON_SECRET`, `S3_*`, `NEXT_PUBLIC_APP_URL` |
| CI | GitHub Actions: typecheck, test, migrate staging |
| Backups | managed daily Postgres |
| Logs | stdout |
| Monitor | uptime ping `/health`; Sentry optional |
| Legal | тексты `/legal` блокер **prod login** (DEC-02), не блокер E1 |

Вендор хостинга — не заморожен (DEC-01). E1: `npm run dev` + Docker Postgres опционально.
