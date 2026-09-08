# 02 — Database

Канон: [09](../09-database-architecture.md), DEC-14, seed [24 §4.1–4.2](../24-implementation-spec.md). Prisma в `prisma/schema.prisma`. UUID `gen_random_uuid()`.

## 1. Модель типов объявлений

**Не** JSONB details и не STI без таблиц.  
`Listing` (общее) + **1:1** `SpaceDetails` | `EventDetails` | `VacancyDetails` по `type`.  
`type` неизменен после create. Ровно одна details-строка, согласованная с type (проверять в сервисе + partial unique не обязателен).

## 2. Enums

| Enum | Значения |
| --- | --- |
| `UserRole` | `master` `space_owner` `organizer` `admin` |
| `UserStatus` | `active` `blocked` `deleted` |
| `LocationLevel` | `country` `region` `city` `district` |
| `ListingType` | `space` `event` `vacancy` |
| `ListingStatus` | `draft` `pending` `published` `rejected` `expired` `archived` |
| `PricePeriod` | `month` `shift` `hour` `event_ticket` `other` |
| `WorkspaceKind` | `cabinet` `chair` `coworking_slot` `other` |
| `VacancyDirection` | `looking_for_master` `looking_for_job` |
| `EmploymentFormat` | `rent` `hire` `percent` `other` |
| `ReportReason` | `fraud` `spam` `wrong_info` `prohibited` `outdated` |
| `ReportStatus` | `open` `resolved` |
| `ModerationActionType` | `approve` `reject` `unpublish` |
| `NotifyChannel` | `telegram_dm` `telegram_channel` |
| `NotifyStatus` | `pending` `sent` `failed` `skipped` |

`EmploymentFormat` — выравнивание 09 (`employment_note` text) с UX/24 (select). Поле `employment_note` nullable только если `other`.

## 3. Таблицы (MVP)

### location

`id`, `parent_id?`, `level`, `slug`, `name`, `is_active`  
unique `(level, slug)`, index `parent_id`  
district ⇒ parent city. Seed: RU / ЮФО / Ростов-на-Дону + 10 районов §4.2.

### specialization

`id`, `slug` unique, `name`, `sort_order`, `is_active`  
Seed: barber, hair, nail, brow, lashes, makeup, cosmetology.

### user

`id`, `role` (default не admin), `status` default `active`, `created_at`, `last_login_at?`  
admin только seed/SQL, не из онбординга.  
index `status`. Soft: `status=deleted`, PII затереть (не физический DELETE user сразу — AuditLog).

### profile

`user_id` PK/FK, `display_name`, `bio?`, `district_location_id?`, `avatar_object_key?`, `contact_telegram`, `contact_phone?`, `instagram?`, `specialization_id?`  
`profile_completed` = роль на user + непустое имя + `contact_telegram` (24). Не колонка-дубль: считать в коде или generated stored — **считать в коде** проще.

### telegram_account

`user_id` unique, `telegram_user_id` unique bigint, `username?`, `connected_at`, `bot_blocked` default false.

### session (опционально)

Если cookie только signed JWT — таблицы нет, block проверяется по `user.status`.  
**Выбор:** signed cookie + проверка status на каждый запрос. Таблица session **не** в первой миграции.

### listing

`id`, `author_id`, `type`, `status`, `title`, `description`, `location_id`, `price_amount?` numeric, `price_period?`, `expires_at?`, `published_at?`, `rejection_reason?`, `created_at`, `updated_at`  
indexes: `(status, type, published_at desc)`, `location_id`, `author_id`, `(expires_at)` where published.

Public read: `status=published` AND (`expires_at` is null OR `expires_at` > now()) AND event `starts_at` still valid (join).

### listing_media

`id`, `listing_id`, `object_key`, `sort_order`, `created_at`  
max 6 на listing в сервисе.

### space_details

`listing_id` PK, `area_m2?`, `workspace_kind?`

### event_details

`listing_id` PK, `starts_at` timestamptz not null, `ends_at?`, `address_text?`, `capacity?`, `external_url?`

### vacancy_details

`listing_id` PK, `direction` not null, `employment_format?`, `employment_note?`

### listing_specialization

`(listing_id, specialization_id)` PK, index `specialization_id`.

### notification_preference

`user_id` PK, `notify_space` `notify_event` `notify_vacancy` default **false**, `updated_at`.

### notification

`id`, `user_id?` (null = channel post), `listing_id`, `channel`, `status`, `dedup_key` unique, `error?`, `created_at`, `sent_at?`

### report

`id`, `reporter_id`, `listing_id`, `reason`, `comment?`, `status` default open, `created_at`  
нельзя reporter = author (сервис).

### moderation_action

`id`, `listing_id`, `actor_id`, `action`, `reason?`, `created_at`  
append-only.

### audit_log

`id`, `actor_id?`, `action` text, `entity_type`, `entity_id`, `payload_json` (без секретов), `created_at`

### analytics_event

`id`, `name`, `user_id?`, `session_id?`, `properties_json`, `created_at`  
без phone/username в properties.

**Нет в MVP:** SearchIntent, Match, Favorite, Collaboration.

## 4. Contact events

Отдельная таблица **не нужна**. `contact_clicked` → `analytics_event`. Rate limit по user+listing в коде (память/счётчик опционально позже).

## 5. Soft delete

User: `deleted`. Listing: `archived` / `expired`, не DELETE (медиа ключи можно чистить job). Reports не удалять.

## 6. Миграции E1

1. enums + location + specialization + seed.  
2. user, profile, telegram_account.  
3. listing* + media + details + listing_specialization.  
4. notification*, report, moderation_action, audit_log, analytics_event.
