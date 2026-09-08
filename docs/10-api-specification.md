# 10 — API Specification (спецификация API)

**Связано:** [04](04-prd.md) · [06](06-user-stories.md) · [09](09-database-architecture.md) · [14](14-analytics.md)

Стиль: REST JSON. Код реализации не приводится. Эндпоинты только для прошедших проверку необходимости; Future — одной строкой.

Базовый path: `/api/v1`. Пагинация: `cursor` или `page`+`limit` (max 50). Рекомендация: `limit` + `offset` для MVP простоты, осознать неэффективность позже.

Идемпотентность: POST создания listing — не идемпотентен; POST moderation и send notification — да, по id. Повторы Telegram webhook — см. [11](11-telegram-architecture.md).

Ошибки: `{ "error": { "code": "VALIDATION", "message": "..." } }` + HTTP 400/401/403/404/409/429/500.

Auth: session cookie httpOnly после Telegram Login. Заголовок не обязателен для браузера. Staff: тот же механизм, `role=admin`.

Rate limit (`ASSUMPTION`): аноним GET 60/мин/IP; POST login 10/мин; create listing 10/час/user; reports 5/час; webhook Telegram — verify secret, не публичный лимит как у пользователей.

---

## Соглашения авторизации

| Класс | Правило |
| --- | --- |
| Public GET списки/карточки | Без auth |
| Контакт, create, report, me | Auth |
| Admin | role admin |
| Internal jobs | секрет заголовка, не из браузера |

---

## /auth

### POST `/api/v1/auth/telegram`

- **purpose:** обмен данных Telegram Login Widget на сессию
- **auth:** нет
- **MVP**
- **request:** поля виджета `id, first_name, username, photo_url, auth_date, hash` как у Telegram
- **validation:** проверка hash по bot token, `auth_date` свежести
- **response:** `201/200` `{ user, profile_completed }` + Set-Cookie
- **errors:** 401 невалидный hash
- **идемпотентность:** повтор — та же сессия
- **rate limit:** строгий
- **story:** US-A-01
- **analytics:** `user_registered` если новый

### POST `/api/v1/auth/logout`

- **purpose:** выход
- **auth:** да
- **MVP**
- **request:** пусто
- **response:** 204
- **story:** US-A-02

### GET `/api/v1/auth/me`

- **purpose:** текущий пользователь
- **auth:** да
- **response:** user + profile
- **errors:** 401

Future: `POST /auth/phone` — не специфицировать подробно.

---

## /users и /profiles

### GET `/api/v1/profiles/me`

- **auth:** да · **MVP** · как me расширенный

### PATCH `/api/v1/profiles/me`

- **purpose:** онбординг и правка
- **auth:** да
- **request:** `display_name, role, district_id, specialization_id, bio, contact_telegram, contact_phone, instagram`
- **validation:** role enum `master|space_owner|organizer` (без `admin` из публичного API); name length; phone format мягкий
- **response:** profile
- **errors:** 400
- **story:** US-P-01, US-P-02
- **analytics:** `profile_completed` при первом выполнении обязательных полей

### POST `/api/v1/profiles/me/avatar`

- **purpose:** загрузка (multipart или presign)
- **auth:** да
- **validation:** MIME jpeg/png/webp, размер `ASSUMPTION` 5MB
- **errors:** 400, 415
- **story:** US-P-03

### DELETE `/api/v1/users/me`

- **purpose:** удаление аккаунта BH-FR-23
- **auth:** да
- **response:** 204
- **analytics:** не хранить PII после purge

Публичный `GET /users/:id` каталога мастеров — **Future**, не делать.

---

## /listings

### GET `/api/v1/listings`

- **purpose:** поиск/списки
- **auth:** нет
- **query:** `type`, `district_id`, `specialization_id`, `price_min`, `price_max`, `starts_after`, `starts_before`, `direction` (vacancy), `q`, `limit`, `offset`
- **response:** `{ items, total }` только `published` и не expired
- **validation:** type enum
- **story:** US-S-01, US-F-01
- **analytics:** `search_performed` если есть q или любой фильтр; `filter_applied` при изменении фильтров (клиент может слать beacon)

### GET `/api/v1/listings/:id`

- **auth:** нет
- **response:** карточка без контактных полей (`contact_hidden: true`)
- **errors:** 404 для чужих draft
- **story:** US-L-01
- **analytics:** `listing_viewed`

### GET `/api/v1/listings/:id/contact`

- **purpose:** выдать контакт
- **auth:** да
- **response:** telegram, phone
- **errors:** 401, 404
- **rate limit:** да (скрейп)
- **story:** CUJ-6
- **analytics:** `contact_clicked`

### POST `/api/v1/listings`

- **purpose:** создать draft/pending
- **auth:** да, профиль completed
- **request:** `type` + общие поля + details по типу + `specialization_ids[]` + media keys
- **validation:** по BH-FR-06/07/08; event `starts_at` в будущем
- **response:** 201 listing status pending (или draft если `save_draft`)
- **errors:** 400, 403 blocked user
- **story:** US-L-02
- **analytics:** `listing_created`

### PATCH `/api/v1/listings/:id`

- **auth:** автор
- **правило:** published после правки → снова pending `ASSUMPTION` (антимошенничество смены цены)
- **errors:** 403, 409 если archived

### POST `/api/v1/listings/:id/archive`

- **auth:** автор или admin
- **идемпотентность:** повтор archive = 200
- **story:** US-L-03

### POST `/api/v1/listings/:id/media` / DELETE media

- upload constraints как avatar

---

## /spaces /events /vacancies

Не дублировать REST-коллекции, если GET `/listings?type=` покрывает. **Рекомендация:** не делать отдельные ресурсы, чтобы не разъехались фильтры.

Опциональные алиасы:

- `GET /api/v1/spaces` → listings type=space **Future alias only**

В MVP достаточно `/listings`.

---

## /search

`GET /api/v1/search` — алиас listings. **Не делать второй движок.** Если нужен для семантики — тот же handler.

---

## /matches

Все **Future/P1**:

- `POST /api/v1/search-intents`
- `GET /api/v1/matches`

Не проектировать request/response до этапа Matching.

---

## /notifications

### GET `/api/v1/notifications/preferences`

- **auth:** да · **MVP**
- **response:** три булева
- **story:** US-T-02

### PUT `/api/v1/notifications/preferences`

- **auth:** да
- **request:** `{ notify_space, notify_event, notify_vacancy }`
- **идемпотентность:** PUT
- **analytics:** нет обязательного события; опционально `notification_prefs_updated`

Inbox уведомлений на сайте — **Won't** в MVP (канал = Telegram).

---

## /telegram

### POST `/api/v1/telegram/webhook`

- **purpose:** входящие апдейты бота
- **auth:** secret token Telegram
- **MVP**
- **request:** Update JSON
- **validation:** header secret
- **response:** 200 быстро
- **errors:** 401
- **идемпотентность:** update_id дедуп
- **story:** US-T-01

### GET `/api/v1/telegram/connect-link` (optional)

- **purpose:** одноразовый deep link если Login не связал
- **auth:** да
- **MVP** только если Login недостаточен

Публичный `POST /telegram/broadcast` — **нет** (только jobs/admin).

---

## /reports

### POST `/api/v1/reports`

- **auth:** да
- **request:** `{ listing_id, reason, comment? }`
- **validation:** reason enum, не репортить своё — 400
- **response:** 201
- **errors:** 429
- **story:** US-R-01

---

## /admin

Префикс `/api/v1/admin`, только admin.

### GET `/api/v1/admin/listings?status=pending`

- очередь модерации

### POST `/api/v1/admin/listings/:id/approve`

- **идемпотентность:** повтор approve published = 200
- **story:** US-M-01
- побочный эффект: notify + channel (асинхронно)

### POST `/api/v1/admin/listings/:id/reject`

- **request:** `{ reason }`
- **story:** US-M-02

### GET `/api/v1/admin/reports`

### POST `/api/v1/admin/reports/:id/resolve`

### GET `/api/v1/admin/users`

### POST `/api/v1/admin/users/:id/block`

### GET `/api/v1/admin/stats` — простые counts P0

Нет публичного graph API.

---

## Внутренние

### POST `/internal/jobs/expire-listings`

### POST `/internal/jobs/retry-notifications`

Секрет. Не в OpenAPI публичном.

---

## Справочники

### GET `/api/v1/specializations` public

### GET `/api/v1/locations?city=rostov-on-don` public districts

---

## Не включать

- чат/сообщения
- платежи
- `/masters` индекс
- `/brands`
- `/feed`
- `/lessons`
