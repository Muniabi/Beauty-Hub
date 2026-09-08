# 06 — Moderation, reports, Telegram

Канон: DEC-11, 12, 22 · [ux/04](../ux/04-moderation-and-admin.md) · [ui/15](../ui/15-p3-moderation.md) · [11](../11-telegram-architecture.md).

## 1. Moderation

Очередь: `pending`, FIFO `created_at`. UI: Queue + Reports (Users/Stats — не MVP).

**Approve:** confirm dialog (P-3) → `published`, `published_at=now()`, `expires_at` = now+**30d** for space/vacancy (DEC-20); event скрывается из поиска после `starts_at` (конец календарного дня), `ModerationAction`, `listing_approved`, enqueue notify + channel job.

**Reject:** причина обязательна → `rejected`, `rejection_reason`, `listing_rejected`, **без** Telegram публикации.

**Unpublish:** `archived` (или явный статус — 09 использует archived). Канал не удаляем автоматически (MVP).

Идемпотентность approve повторно: no-op + тот же ответ.

Контакт автора в staff-колонке детали, не в публичной карточке.

## 2. Reports

User: причина enum + comment optional.  
Admin resolve: только `resolved`, listing не трогать (24). Unpublish — отдельное действие.

## 3. Telegram — что да / что нет

Telegram = **дистрибуция**, не второй клиент.

**Делаем:** Login Widget; bot webhook (start, help, настройки opt-in, deep link listing); пост в канал после **published**; DM opt-in по типу (default **все OFF**); ссылки на сайт `https://…/listings/{id}?utm_source=telegram`.

**Не делаем:** CRUD объявлений в боте; чат мастер↔салон; Mini App; дублировать поиск как основное приложение.

### Login

Тот же бот. Verify hash на сервере. Не доверять клиенту `id` без hash.

### Channel

Один пост на approve (и на re-approve после edit). Текст: title, тип, район, цена, ссылка. Без телефона в канале.

### Notifications

Сайт — источник правды трёх флагов. Бот sync.  
События в TG: новое **published** своего типа, если opt-in.  
Не слать: draft, pending, reject (reject — только UI сайта), каждый чих поиска.

`bot_blocked`: skip DM, не спамить.

### Deep links

`https://t.me/<bot>?start=lst_<uuid>` → сообщение со ссылкой на карточку сайта. Не открывать Mini App.

### Webhook security

Secret token header. Не логировать полный update с user PII сверх нужного.

Jobs: expire listings; retry `notification.status=failed` с backoff (DEC-23 in-process).
