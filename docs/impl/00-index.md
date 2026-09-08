# Implementation Planning — Beauty Hub

**Статус:** план для кода. Не заменяет [24](../24-implementation-spec.md).  
**Дата:** 2026-09-06  
**U2:** Figma не gate. P-1 APPROVED, P-2/P-3 UX/UI Ready. Верстка по `docs/ui/*` + токены U1.

При конфликте: **24 → UX/UI утверждённые → этот пакет impl → 08–15**.

Код приложения в корне репозитория ещё не начат (только `docs/`). Стек ниже — фиксация ASSUMPTION из 08/24, не смена продукта.

| Документ | Содержание |
| --- | --- |
| [01-architecture.md](01-architecture.md) | Монолит, модули, стек, поток данных |
| [02-database.md](02-database.md) | PostgreSQL, enums, индексы |
| [03-api.md](03-api.md) | Server Actions + Route Handlers |
| [04-auth.md](04-auth.md) | Telegram Login, `next`, права |
| [05-listings.md](05-listings.md) | Жизненный цикл, поиск, контакт, фото |
| [06-moderation-telegram.md](06-moderation-telegram.md) | Админ, жалобы, бот, канал |
| [07-cross-cutting.md](07-cross-cutting.md) | Security, analytics, тесты, DevOps |
| [08-roadmap.md](08-roadmap.md) | Epic → Feature → Story |
| [09-consistency.md](09-consistency.md) | Противоречия, вопросы, готовность |

Не входит: Matching, Radar, Mini App, Elasticsearch, K8s, микросервисы.
