# 03 — API and Server Actions

Канон: [10](../10-api-specification.md).  
**Не плодить REST ради REST.** Браузер: Server Actions + RSC. HTTP Route Handlers: Telegram Login POST, webhook, internal jobs, presign upload.

Контракт 10 остаётся каноном ошибок и полей. Реализация UI может не вызывать `/api/v1/listings` из браузера, если тот же `listings.search()` используется в RSC. Для тестов и явного JSON — тонкие handlers, делегирующие в модули.

## 1. Общие ошибки

`{ error: { code, message } }` + 400/401/403/404/409/429/500.  
Zod → 400 VALIDATION. Чужой ресурс → 403. Нет сессии → 401. Blocked user → 403.

## 2. Auth

| Действие | Как | Input | Authz | Output | Errors |
| --- | --- | --- | --- | --- | --- |
| Telegram Login | `POST /api/v1/auth/telegram` | поля виджета | нет | Set-Cookie, `{ profile_completed }` | 401 hash/auth_date |
| Logout | Server Action `logout()` | — | сессия | redirect `/` | — |
| Me | RSC `getSessionUser()` | — | сессия | user+profile | null если гость |

После login: redirect `safeNext(next)` или `/onboarding/role?next=` если !completed.

## 3. Profile

| Действие | Как | Input | Authz | Output |
| --- | --- | --- | --- | --- |
| Сохранить онбординг/профиль | SA `updateProfile` | name, role (только пока !completed), district, spec, telegram, phone?, instagram? | свой user; role нельзя сменить на admin | profile; событие `profile_completed` один раз |
| Аватар | SA + presign | file meta | свой | key |
| Удалить аккаунт | SA `deleteAccount` confirm | — | свой | 204, purge PII |

Роль после completed: смена — **не в MVP** (онбординг один раз), кроме явного Product later.

## 4. Catalogs

`GET` RSC: districts Rostov, specializations active. Публично.

## 5. Listings

| Действие | Как | Input | Authz | Output | Errors |
| --- | --- | --- | --- | --- | --- |
| Поиск | RSC `/search` → `searchListings` | type, district, spec, q, price, dates, direction, limit, offset | нет | `{ items, total }` только published+live | 400 type |
| Карточка | RSC | id | нет | без contact; 404 чужой draft/pending | 404 |
| Контакт | SA `getContact(listingId)` | id | сессия, listing published | `{ telegram, phone? }` + `contact_clicked` | 401, 404, 429 |
| Создать | SA `createListing` | type + поля + spec ids + media + `saveDraft?` | completed, not blocked | 201 draft или pending | 400, 403 |
| Черновик→на проверку | SA `submitListing` | id | автор, draft/rejected | pending | 400 валидация |
| Править | SA `updateListing` | id + поля | автор | published→pending (DEC-21) | 403, 409 archived |
| Архив | SA `archiveListing` | id | автор или admin | archived | — |
| Медиа | presign + SA attach/delete | keys | автор, лимит 6, MIME | — | 400, 415 |

Submit create: если все обязательные и не draft — сразу `pending` + `listing_created`. Draft не в очереди модерации.

## 6. Moderation (admin)

| Действие | Как | Input | Authz | Output |
| --- | --- | --- | --- | --- |
| Очередь | RSC | status, offset | admin | rows FIFO |
| Approve | SA `approveListing` | id | admin | published; идемпотентно если уже published; jobs notify |
| Reject | SA `rejectListing` | id, reason min 1 | admin | rejected; 400 без reason |
| Unpublish | SA `unpublishListing` | id | admin | archived |
| Reports list/detail | RSC | status | admin | — |
| Resolve report | SA | id | admin | resolved, listing **не** меняется |

## 7. Reports (user)

SA `submitReport` — auth, reason enum, не своё объявление, 429 5/час.

## 8. Notifications

SA get/put три булева (сайт источник правды). Бот пишет те же строки.

## 9. Telegram HTTP

| Route | Method | Auth |
| --- | --- | --- |
| `/api/telegram/webhook` | POST | `X-Telegram-Bot-Api-Secret-Token` |
| `/internal/jobs/expire-listings` | POST | `CRON_SECRET` |
| `/internal/jobs/retry-notifications` | POST | `CRON_SECRET` |

Нет `POST /telegram/broadcast` публично.

## 10. Analytics

SA `track(name, props)` с сервера предпочтительно. Клиентский beacon только для `filter_applied` если RSC не видит клик чипа — иначе писать с сервера при search.

Не класть PII в props.
