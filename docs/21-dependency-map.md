# 21 — Dependency Map (карта зависимостей)

**Связано:** [20](20-roadmap-backlog.md) · [22](22-execution-order.md) · [08](08-system-architecture.md)

Исходная цепочка:

```text
Authentication (аутентификация)
 ↓
Profile (профиль)
 ↓
Listings (объявления)
 ↓
Search (поиск)
 ↓
Search Intent (поисковое намерение)
 ↓
Matching (подбор)
 ↓
Notifications (уведомления)
 ↓
Telegram
```

**Пересмотр:** Notifications по **типу** не требуют Search Intent. Telegram Login нужен рано (auth). Канал зависит от Moderation, не от Matching. Search Intent — после беты.

---

## Скорректированная карта

### Технические зависимости

```text
Hosting + PostgreSQL + Storage
 ↓
CI + миграции справочников (Location, Specialization)
 ↓
Auth (Telegram Login) ──────┐
 ↓                          │
Profile + RBAC              │
 ↓                          │
Listings + Media            │
 ↓                          │
Moderation / Admin          │
 ↓                          │
Search + Filters + Contact  │
 ↓                          │
NotificationPreference      │
 + TelegramAccount ←────────┘ (часто тот же Login)
 ↓
Jobs: notify + channel post
 ↓
Expire job
```

```text
Search Intent  →  Matching v1  →  точечные DM
        ↑
   только после беты
```

### Продуктовые зависимости

- Публичный запуск → seed объявлений (операции) + D-02.
- Канал интересен → регулярные published.
- Matching ценен → шум или запрос «скажите когда появится» + ненулевой supply.
- Radar-lite → плотность, иначе вред.

### Операционные зависимости

- Approve в SLA → назначенный модератор (D-05).
- Seed → Community-время, не код.
- Интервью → доступ к респондентам.

---

## Critical Path MVP (критический путь)

Инженерный (блокирует проверку гипотезы на софте):

```text
Auth → Profile → Listing create → Admin approve → Public search → Contact
                                                              ↓
                                              Telegram type notifications
```

Параллельно после Listing create: reports, media, expire.

Операционный критический путь (часто длиннее инженерного):

```text
Интервью → договорённости seed → реальные карточки на модерации → бета-пользователи
```

Без операционного пути инженерный MVP проверяет только «сайт открывается».

---

## Ручной процесс вместо автоматизации (ускорение валидации)

| Место | Автомат позже | Ручной сейчас |
| --- | --- | --- |
| Discovery supply | Формы сайта | Notion + пост в канал основателя |
| Модерация ML | — | Человек в админке (и останется человеком) |
| Matching | Search Intent | Подписка на три типа |
| Дайджест | Job | Ручной пост «сегодня 3 кабинета» |
| Аналитика BI | PostHog | SQL / таблица events + таблица Google Sheet опросов соединений |
| Канал publisher | Bot post | Админ копирует ссылку (fallback при сбое API) |
| Онбординг салона | Self-serve | Основатель заполняет карточку за салон с разрешения (conciege) |

Concierge-заполнение карточек **разрешён** для seed: не ждать, пока салон освоит форму. Это не замена P0, а разгон беты.

---

## Точки, где нельзя заменить ручным надолго

- Поиск и фильтры (иначе снова чат).
- Статусы expired (иначе недоверие).
- Проверка Telegram Login (безопасность).
- Дедуп уведомлений (репутация бота).

---

## Типы зависимостей на одном взгляде

```text
[Тех] Auth ──[Тех] Listing ──[Тех] Search
                 │
                 ├──[Тех] Admin approve ──[Тех] TG notify
                 │
                 └──[Опер] Модератор часы
[Опер] Seed ──────────────────────────────► ценность беты
[Прод] Интервью ── stop/go ──► имеет ли смысл Auth вообще
```
