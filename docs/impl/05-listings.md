# 05 — Listings, search, contact, uploads

Канон: DEC-09, 16–22 · [ux/02](../ux/02-listings-and-search.md) · [ux/03](../ux/03-create-flow.md) · [ui/14](../ui/14-p2-create.md) · [10](../10-api-specification.md).

## 1. Lifecycle (state machine)

```text
draft ──submit (valid)──► pending ──approve──► published
  ▲                         │                    │
  └── reject (reason) ◄─────┘                    ├── expire job ──► expired
                                                 └── archive (author/admin) ──► archived
```

- Create: `draft` если «Сохранить черновик», иначе сразу `pending` при полной валидации.
- `rejected` → автор правит → снова `pending`.
- Edit **published** → `pending` (DEC-21). С каталога снимается до approve. Канал: **не** править старый пост; после повторного approve — новый пост (или не дублировать если контент тот же — Product later: всегда новый post проще).
- `expired`: не в каталоге; автор видит «срок истёк». Реактивация **не в MVP** (24). Space/Vacancy: `expires_at` = **+30 суток** с publish (DEC-20). Event: из поиска после конца календарного дня `starts_at`.
- `archived`: не в каталоге; автор/админ.
- Public catalog: `published` + not expired + event date still valid.

**Кто что видит**

| Статус | Автор (карточка/профиль) | Каталог | Модератор |
| --- | --- | --- | --- |
| draft | да | нет | нет |
| pending | да + «На проверке» | нет | очередь + деталь |
| published | да | да | по id, не очередь |
| rejected | да + причина | нет | история, не очередь |
| expired | да | нет | да |
| archived | да | нет | да |

Telegram канал / opt-in DM: **только переход в published** (DEC-22). Не draft/pending/rejected.

После reject: пользователь правит и отправляет снова; админ не обязан «разрешать повтор».

## 2. Create (P-2)

`/create` — один экран трёх типов. Формы `/create/space|event|vacancy`.  
Space: ≥1 фото. Event/Vacancy: фото 0–6.  
Превью = гостевая карточка без контакта.  
После submit: `/listings/[id]/pending`.

## 3. Search (MVP, только SQL)

- Обязательный `type` (чипы). Default **space** (Кабинеты). Нет смешанной ленты «Все».
- `q` опционально: `ILIKE` title/description, `pg_trgm` при необходимости.
- Фильтры: район (`location_id` district), specialization (join), price min/max (space/vacancy), event date range, vacancy `direction`.
- Sort: `published_at DESC` (default).
- Pagination: `limit` 20, `offset`.
- Expired / not published: исключить в WHERE.
- Empty: тексты P-1 (нет результатов / нет объявлений).

Индексы: см. [02](02-database.md). Не Elasticsearch.

## 4. Contact

```text
guest → listing → «Войти, чтобы написать» → Telegram Login
      → onboarding если нужно → тот же listing
      → «Написать в Telegram» → t.me / tg:// + contact_clicked
```

`contact_clicked` — **прокси**, не доказательство диалога. Писать analytics на сервере при успешной выдаче контакта, не на hover.

Гость не видит @/телефон в HTML (DEC-07).

## 5. Images

- JPEG/PNG/WebP, 1–6 файлов, ≤5 MB, decode на сервере (проверка не SVG/HTML).
- Flow: клиент → presign (или upload route) → object store → attach `object_key`.
- Dev: `uploads/` локально, gitignore.
- Сжатие: опционально sharp при ingest (max edge ~1600px) — не блокер первой версии если лимит 5MB.
- Delete: автор убирает из listing; orphan GC later.
- Security: не исполнять файлы, Content-Type allowlist, random key, не публиковать bucket listing без signed or public-read только `/media/...` через app proxy если нужно скрыть прямые URL. MVP: public-read objects с непрозрачным UUID key.

Фото обязательны только Space (≥1).
