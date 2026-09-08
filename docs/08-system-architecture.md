# 08 — System Architecture (системная архитектура)

**Связано:** [09 — Database](09-database-architecture.md) · [10 — API](10-api-specification.md) · [11 — Telegram](11-telegram-architecture.md) · [15 — CI/CD](15-cicd-devops.md)

Масштаб: один город, небольшая команда, неизвестная нагрузка. **Не** микросервисы.

Стек: `ASSUMPTION` — Next.js (App Router) + TypeScript + PostgreSQL + S3-совместимое хранилище + Telegram Bot API. Репозиторий пуст; выбор можно сменить до Этапа 1, зафиксировав новый ADR.

---

## Контекст

Нужно: веб, API, фоновая публикация в Telegram, загрузка фото, админка, аналитика событий. Не нужно: шина событий, search cluster, Kubernetes.

---

## Общая схема (ASCII)

```text
                    Internet
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
   Web (Next.js)              Telegram
   pages + server actions      Bot + Channel
         │                           │
         └─────────────┬─────────────┘
                       ▼
              Application process
              (modular monolith)
                       │
     ┌─────────┬───────┼────────┬──────────┐
     ▼         ▼       ▼        ▼          ▼
   Auth    Listings  Search  Notify     Admin
   Profile           (SQL)   Telegram   Moderation
     │         │       │        │          │
     └─────────┴───────┴────────┴──────────┘
                       ▼
              PostgreSQL
                       +
              Object Storage (фото)
```

```text
User (пользователь)
 ↓
Web / Telegram (веб-платформа / Telegram)
 ↓
Application (приложение)
 ↓
Modules (модули)
 ↓
Database (база данных)
```

---

## Components (компоненты) и responsibilities (ответственность)

| Модуль | Ответственность | Граница |
| --- | --- | --- |
| Auth | Сессия, Telegram Login verify, RBAC | Не знает листинги |
| Profiles | Профиль, роли, справочники user-level | |
| Listings | CRUD, статусы, истечение | Не шлёт Telegram напрямую |
| Search | Запросы списков, фильтры | Читает published |
| Media | Presign/upload policy, типы файлов | |
| Notifications | Создание Notification, дедуп | Вызывает Telegram gateway |
| Telegram | Webhook, sendMessage, channel post | Единственная точка Bot API |
| Moderation | Approve/reject, reports | Пишет AuditLog |
| Admin | UI staff | Те же модули, другой authz |
| Analytics | Insert events | Без бизнес-решений |
| Jobs | Cron: expire, retry notify | Процесс того же деплоя MVP |

---

## Communication (взаимодействие)

Синхронно: HTTP(S) браузер ↔ Next.js Route Handlers / Server Actions.  
Telegram: HTTPS webhook → Telegram module.  
Межмодульно: вызовы приложения in-process (не REST между модулями).  
После approve: Listings публикует доменное событие in-process → Notifications + Telegram channel.

---

## Background jobs (фоновые задачи)

MVP: тот же процесс, `node-cron` или системный cron на HTTP `/internal/jobs/*` с секретом. Не Redis.

Задачи: expire listings, retry failed notifications, (опционально) агрегаты.

**Пересмотр:** если sendMessage начинает тормозить approve-request — вынести очередь (BullMQ + Redis). Сигнал: p95 approve > 2s из-за Telegram.

---

## Search (поиск)

PostgreSQL: индексы по `type, city_id, district_id, status, published_at`, GIN по specialization IDs, опционально `tsvector` заголовка.

Не Elasticsearch. Пересмотр: >10k активных объявлений и деградация запросов (маловероятно в одном городе).

---

## Analytics (аналитика)

Таблица `analytics_events` в PostgreSQL (DEC-15). PostHog не в MVP.

---

## Monitoring (мониторинг)

MVP: uptime check URL, логи stdout, error tracker (Sentry — опционально, не обязателен до беты). Метрики: error rate, latency, telegram send failures.

---

## Scalability (масштабирование)

Вертикаль одного инстанса + managed PostgreSQL достаточно до тысяч MAU. Горизонталь Next.js stateless при sticky-free сессиях (JWT/cookie stateless или DB sessions).

```text
Stage 1: Next.js + PostgreSQL + Storage + Telegram
Stage 2: + Redis + worker (уведомления)
Stage 3: вынос API только при второй команде/нагрузке
Stage 4: микросервисы — не планировать
```

---

## Failure points (точки отказа)

| Точка | Следствие | Fallback |
| --- | --- | --- |
| PostgreSQL | Полный отказ | Backup restore; не multi-region в MVP |
| Object storage | Нет новых фото | Форма без фото или retry |
| Telegram API | Нет уведомлений и канала | Сайт живой; retry job |
| Next.js host | Полный отказ | Healthcheck + re-deploy |
| Единый процесс jobs | Задержка expire | Ручное снятие модератором |

---

## Architecture Decision Records

### ADR-001 Modular Monolith (модульный монолит)

- **context:** маленькая команда, неясный PMF, исходник требовал «как big tech» без 15 сервисов.
- **decision:** один деплой, модули по доменам (папки/пакеты), без отдельных БД.
- **alternatives:** микросервисы; serverless набор функций без границ; отдельный backend с нуля.
- **rationale:** скорость изменений, транзакции listing+status, меньше ops.
- **consequences:** риск «большого комка» — сдерживать границами модулей. Вынести модуль позже можно.
- **validation plan:** ревью границ при каждом новом домене; запрет циклических импортов Listings↔Telegram.
- **revisit:** две команды или независимый scaling уведомлений.

### ADR-002 Database (база данных)

- **context:** реляционные объявления, статусы, фильтры, отчёты.
- **decision:** PostgreSQL как единственная СУБД MVP.
- **alternatives:** SQLite (мало для файлов/конкуренции); MongoDB (фильтры и связи хуже); Firebase (vendor lock, слабый admin).
- **rationale:** SQL-фильтры, транзакции модерации, FTS.
- **consequences:** нужен хостинг Postgres, бэкапы.
- **validation:** миграции с первого дня; explain на списках.
- **revisit:** не раньше проблем I/O.

### ADR-003 Telegram-first (сначала Telegram)

- **context:** привычка мастеров; исходник; риск трёх клиентов.
- **decision:** Telegram = Login + подписки по типу + канал + deep link. Система записи = веб. Не Mini App. Не полный CRUD в боте.
- **alternatives:** только веб; только бот; Mini App как UI.
- **rationale:** проверка гипотезы доставки без удвоения UX форм.
- **consequences:** зависимость от Telegram Login (D-04); веб обязан работать без бота.
- **validation:** доля `telegram_connected`, доставляемость, работа сайта при сбое send.
- **revisit:** массовый отказ Login; или наоборот спрос на Mini App после PMF.

### ADR-004 Matching algorithm (алгоритм подбора)

- **context:** исходник предлагал scoring; пользователь планирования отложил после беты.
- **decision:** в MVP нет scoring. P1: rule-based фильтр Search Intent (равенство типа, района, специализации, цена ≤). Проценты совместимости не показывать.
- **alternatives:** LLM; коллабфильтрация; Tinder-swipe.
- **rationale:** нет данных; риск пустых матчей; сложность.
- **consequences:** уведомления P0 грубее (весь тип по городу) — риск шума. Смягчение: только три типа, не «все сообщения чата».
- **validation:** жалобы на шум → ускорить P1 intent; игнор уведомлений → не строить сложный match.
- **revisit:** после беты по критериям [05](05-mvp-scope.md).

### ADR-005 Search architecture (архитектура поиска)

- **context:** фильтры по справочникам, сотни карточек.
- **decision:** SQL + индексы, без OpenSearch.
- **alternatives:** Elasticsearch сразу; клиентская фильтрация JSON.
- **rationale:** объём данных города; ops-стоимость ES не оправдана.
- **consequences:** сложный relevance не цель.
- **validation:** p95 списка < 300 мс на staging с тестовым объёмом 1–2k.
- **revisit:** полнотекст по описаниям не справляется; тогда отдельный индекс.

---

## Зависимости внешние

Telegram, DNS/TLS, storage, (опционально) Sentry. Нет платежного провайдера.
