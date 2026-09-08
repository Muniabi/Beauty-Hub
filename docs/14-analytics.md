# 14 — Analytics Specification (спецификация аналитики)

**Связано:** [04](04-prd.md) · [18](18-metrics.md) · [06](06-user-stories.md)

Цель аналитики — отличить **реальную ценность** (соединения сторон) от поверхностной активности (регистрации, просмотры).

---

## North Star Metric (главная метрика)

Предложенная в исходнике: **Successful Connections / Week**.

**Проверка альтернатив:**

| Кандидат | Плюс | Минус |
| --- | --- | --- |
| Registrations | Легко | Легко накрутить, не ценность |
| Published listings | Supply | Без спроса мёртвый инвентарь |
| WAU | Привычка | Можно читать пустую главную |
| contact_clicked | Близко к действию | Кликнул ≠ договорились; скрейп |
| Successful Connections | Совпадает с JTBD | Трудно верифицировать автоматически |

**Решение пакета:** North Star = Successful Connections / Week как `HYPOTHESIS`.

**Определение успеха в бете (операционное):**

1. Прокси: `contact_clicked` (и `external_link_clicked` для событий).
2. Подтверждение: ручной опрос раз в неделю N авторов «была ли договорённость?» или опциональная кнопка «Мы связались» на карточке автора (P1, не строить в P0 без нужды).
3. Не называть `contact_clicked` успешным результатом в отчётах для принятия PMF — только «прокси интереса».

Автоматический confirmation — Future.

Guardrail: не оптимизировать клики ценой показа фейковых контактов и спама уведомлений.

---

## Слои метрик

Цели: `TBD — establish baseline during beta`.

### Product

- Прокси-соединения / нед.
- Доля карточек с ≥1 contact_clicked.

### Acquisition

- Визиты, `user_registered`, источники UTM, Telegram joins канала (вручную из TG stats). CAC — не считать без бюджета.

### Activation

- `profile_completed` / registered.
- Первый `search_performed`.
- Первый `listing_created` (supply).

### Engagement

- WAU/MAU (определение: событие не-bounce).
- listings viewed / user.
- notification click-through (UTM).

### Retention

- D7 возврат. Baseline TBD. Сегмент master vs supply.

### Marketplace

- published count by type.
- time-to-approve (ops).
- contact_clicked / listing_viewed.

### Telegram

- `telegram_connected` / users.
- `notification_sent` vs failed.
- opt-in rates по типам.
- bot_blocked.

### Revenue

MVP: 0. Не строить дашборд выручки. Заметка Future: promoted listings.

---

## Event taxonomy (таксономия событий)

Общие правила: `user_id` внутренний; **не** класть phone, telegram username, email в properties. Источник: `source` = `web|telegram`.

| event name | trigger | properties | purpose |
| --- | --- | --- | --- |
| `user_registered` | Первый успешный Login | `role` если уже известна | Acquisition |
| `profile_completed` | Первый раз обязательные поля валидны | `role` | Activation |
| `listing_created` | POST listing | `type`, `status` | Supply |
| `listing_viewed` | GET карточки | `listing_id`, `type`, `source` | Funnel |
| `search_performed` | GET list с q или заход в раздел | `type`, `has_query` | Intent |
| `filter_applied` | Применение фильтра (клиент или API с filter flags) | `filters` ключи без значений PII | UX фильтров |
| `match_created` | P1 создание Match | `listing_id` | Matching — не слать в MVP |
| `contact_clicked` | Успешный GET contact | `listing_id`, `type`, `target=telegram\|phone` | Прокси соединения |
| `event_registered` | **Не использовать в MVP** внутренней записи. Заменить: `external_link_clicked` | `listing_id` | События |
| `notification_sent` | sendMessage OK | `listing_id`, `channel=dm\|channel` | Telegram health |
| `notification_opened` | Заход на карточку с `utm_source=telegram` | `listing_id` | CTR; не путать с read receipt |
| `telegram_connected` | Связка TelegramAccount | — | Adoption бота |
| `listing_approved` | Admin approve | `listing_id`, `type` | Ops |
| `report_submitted` | POST report | `reason` | Guardrail |

`filter_applied` можно не дублировать каждый чих: достаточно при изменении набора фильтров.

---

## Как отличить ценность от шума

| Сигнал | Интерпретация |
| --- | --- |
| Много `user_registered`, мало `profile_completed` | Онбординг тяжёлый или нет причины |
| Много `listing_viewed`, мало `contact_clicked` | Карточки неубедительны / контакт спрятан слишком / нет доверия |
| Много `contact_clicked`, ручной опрос «не ответили» | Мусорные контакты / неактуально |
| Много `notification_sent`, мало `notification_opened` | Шум, плохой текст, или не открывают TG |
| Рост канала без `listing_viewed` с source=telegram | Канал как медиа, не как продукт |

Дашборд MVP: 8–10 чисел в админке, не «enterprise analytics».
