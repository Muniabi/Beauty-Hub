# 09 — Consistency check and open questions

Цепочка: **Product 24 → UX → UI (P-1 approved, P-2/P-3 ready) → Architecture impl → DB → API → Roadmap**.

## Согласовано (противоречий нет)

- Монолит Next + Postgres; Telegram дистрибуция.
- Типы Space/Event/Vacancy; 1:1 details tables.
- Статусы draft/pending/published/rejected/expired/archived.
- Auth только Telegram; contact после login; `next` сохраняется.
- Opt-in notify default OFF; канал только published.
- Search SQL, type обязателен, default Кабинеты.
- Admin до Telegram.
- `contact_clicked` = proxy.
- Нет matching, Mini App, избранного, смешанной ленты «Все».

## Выравнивания (impl следует более новому канону)

| Тема | Было | Берём |
| --- | --- | --- |
| Desktop header типы | 24 §3.4 ссылки Кабинеты/… | **P-1 APPROVED:** Home/Search/Create/Profile, типы на Search |
| Vacancy занятость | 09 `employment_note` text | **24 + UX:** enum `EmploymentFormat` + note если other |
| Public REST | 10 полный `/api/v1` | Контракт полей/ошибок тот же; UI через Server Actions |
| Session store | 08 Redis если p95 | Cookie + DB user.status; Redis не в E1 |
| ORM | не заморожен | Prisma (техвыбор) |
| Figma P-2/P-3 | U2 frames | **Пропуск:** UX/UI md достаточно |

## Не блокируют планирование и E1

1. **Хостинг-вендор (DEC-01)** — PaaS vs VPS. Нужен до staging deploy, не до `npm run dev`.
2. **Юридические тексты (DEC-02)** — блокер prod Login / E8, не E1–E3.
3. **Sentry** — опционально после staging.
4. **Повторный пост в канал** после edit published→pending→approve: impl по умолчанию **новый пост** (проще). Можно позже «не постить если косметика».

## Риски

- Нет кода в репо: E1 — зелёное поле, риск «переизобрести стек» — снимается фиксацией 01.
- Telegram Login без юр. страниц на prod.
- Модерация руками: очередь вырастет — процесс, не архитектура.
- In-process jobs: потеря notify при крэше — retry таблица `notification`.

---

## IMPLEMENTATION READY

Планирование завершено. Блокирующих продуктовых вопросов **нет**. Figma не gate.

| | |
| --- | --- |
| **Architecture** | Next.js modular monolith, RSC + Server Actions, jobs in-process |
| **Stack** | TS, Tailwind, shadcn, Zod, Prisma, PostgreSQL, S3-compatible / local, Telegram Bot |
| **Database** | Listing + 3 details; catalogs seed; analytics_event; no Redis/ES |
| **API** | Actions для UI; HTTP для Login, webhook, cron |
| **Auth** | Telegram Widget, `next`, onboarding, admin = DB role |
| **Modules** | auth, profiles, catalogs, listings, search, moderation, contact, telegram, notifications, analytics, jobs |
| **Roadmap** | E1→E8 как [08](08-roadmap.md); первый код = E1 Foundation |
| **Unresolved** | hosting vendor, legal copy, Sentry — не блокер E1 |
| **Risks** | см. выше |

Следующий шаг: **Epic E1 Foundation** (каркас приложения, не P-3, не U2).
