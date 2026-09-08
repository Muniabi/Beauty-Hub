# 20 — Roadmap + Backlog (дорожная карта и бэклог)

**Связано:** [05](05-mvp-scope.md) · [06](06-user-stories.md) · [21](21-dependency-map.md) · [22](22-execution-order.md) · [24](24-implementation-spec.md)

Порядок исходника (Foundation → MVP → Telegram → Beta → Matching) **пересмотрен**: модерация обязана идти вместе с объявлениями. Matching — после беты. **U0 UX/UI стартует сразу** (DEC-17).

## Roadmap (дорожная карта)

```text
U0 UX/UI + D0 Discovery (параллельно)
 ↓
Foundation
 ↓
Auth + Profiles
 ↓
Listings + Moderation + Admin
 ↓
Search + Filters + Contact
 ↓
Telegram
 ↓
Beta
 ↓
Matching (по сигналу)
```

Исходный порядок «весь MVP core, потом Telegram» частично верен, но Admin нельзя оставлять «на потом после Telegram»: канал публикует только `published`.

### U0 — UX/UI

- **objective:** макеты и прототип P-1…P-3  
- **deliverables:** [24 §3.14](24-implementation-spec.md)  
- **dependencies:** этот пакет документации  
- **exit:** инвентарь экранов свёрстан в Figma (или эквивалент)

### Discovery

- **objective:** боль, каналы, seed-договорённости  
- **deliverables:** заметки интервью, таблица конкурентов, go/stop  
- **dependencies:** доступ к мастерам  
- **exit:** [16](16-launch-plan.md) Phase 0  

### Foundation

- **objective:** репозиторий, CI, БД, storage, каркас модулей  
- **deliverables:** пустое приложение, миграции справочников, деплой staging  
- **dependencies:** D-01 хостинг можно отложить до первого деплоя  
- **exit:** hello-world на staging, pipeline lint/test/build  

### Auth + Profiles

- **objective:** идентичность  
- **deliverables:** US-A-*, US-P-*, US-SP-01  
- **dependencies:** Foundation, Telegram bot token (для Login)  
- **exit:** CUJ-1, CUJ-2  

### Listings + Moderation

- **objective:** система записи объявлений  
- **deliverables:** три типа, фото, статусы, админ approve/reject, жалобы  
- **dependencies:** Profiles, storage  
- **exit:** CUJ-3, CUJ-9, CUJ-10 без Telegram  

### Search + Filters

- **objective:** находить published  
- **deliverables:** списки, фильтры, карточка, contact  
- **dependencies:** Listings published  
- **exit:** CUJ-4, 5, 6  

### Telegram

- **objective:** доставка по типу + канал  
- **deliverables:** webhook, preferences, notify job, channel post  
- **dependencies:** approve flow  
- **exit:** CUJ-7  

### Beta

- **objective:** реальное использование  
- **deliverables:** seed на проде, метрики, список правок  
- **dependencies:** P0 инженерный + D-02 + D-05 + seed  
- **exit:** [16](16-launch-plan.md) Phase 2  

### Matching

- **objective:** Search Intent, меньше шума  
- **deliverables:** US-SS-01, US-SI-01, US-MCH-01  
- **dependencies:** сигнал беты [05](05-mvp-scope.md)  
- **exit:** уведомления по фильтрам, `match_created`  

### Public Launch / Growth

См. [16](16-launch-plan.md), [17](17-growth-strategy.md).

---

## Почему Telegram не «ещё раньше»

Гипотеза Telegram-first касается **привычки доставки**, не порядка инженерии. Без listing+moderation бот пустой. Concierge-канал в Discovery — операционный, без кода.

## Почему Matching не в Beta-гейте

Пустые матчи хуже грубых уведомлений по типу. Сначала доказать, что карточки и клики вообще есть.

---

## Приоритизация (качественная, не ложный RICE)

Шкала Value/Complexity: H / M / L. Оценки `ASSUMPTION` без данных беты. Изменят приоритет: интервью (события vs кабинеты), отказ от Telegram Login, очередь спама.

---

## Сводная таблица бэклога

| ID | Epic | Feature | Story | Priority | Value | Complexity | Dependency | Phase |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BH-001 | AUTH | Telegram Login | US-A-01 | P0 | H | M | Foundation, TG token | Auth |
| BH-002 | AUTH | Logout | US-A-02 | P0 | M | L | US-A-01 | Auth |
| BH-003 | PROFILE | Онбординг роли | US-P-01 | P0 | H | L | US-A-01 | Auth |
| BH-004 | PROFILE | Редактирование | US-P-02 | P0 | M | L | US-P-01 | Auth |
| BH-005 | PROFILE | Аватар | US-P-03 | P0 | L | M | Storage | Auth |
| BH-006 | SPEC | Справочник | US-SP-01 | P0 | H | L | Seed DB | Foundation |
| BH-007 | LIST | Просмотр карточки | US-L-01 | P0 | H | L | Listings | Search |
| BH-008 | LIST | Создание | US-L-02 | P0 | H | H | Profile, media | Listings |
| BH-009 | LIST | Архив автором | US-L-03 | P0 | M | L | US-L-02 | Listings |
| BH-010 | LIST | Истечение | US-L-04 | P0 | H | M | Job runner | Listings |
| BH-011 | SPACE | Фильтр кабинетов | US-SPCE-01 | P0 | H | M | Search | Search |
| BH-012 | EVENT | Создание МК | US-E-01 | P0 | H | M | US-L-02 | Listings |
| BH-013 | EVENT | Внешняя ссылка | US-E-02 | P0 | M | L | US-E-01 | Listings |
| BH-014 | VAC | Ищу мастера | US-V-01 | P0 | H | M | US-L-02 | Listings |
| BH-015 | VAC | Ищу работу | US-V-02 | P0 | M | L | US-V-01 | Listings |
| BH-016 | SEARCH | Поиск по типу | US-S-01 | P0 | H | M | Published data | Search |
| BH-017 | SEARCH | Текст заголовка | US-S-02 | P0 | M | M | FTS/ILIKE | Search |
| BH-018 | FILTER | Комбо фильтров | US-F-01 | P0 | H | M | US-S-01 | Search |
| BH-019 | LIST | Контакт API | CUJ-6 / FR-12 | P0 | H | L | Auth | Search |
| BH-020 | NOTIF | DM по типу | US-N-01 | P0 | H | H | Approve, TG | Telegram |
| BH-021 | NOTIF | Дедуп | US-N-02 | P0 | H | M | US-N-01 | Telegram |
| BH-022 | TG | Привязка /start | US-T-01 | P0 | H | M | Login | Telegram |
| BH-023 | TG | Настройки типов | US-T-02 | P0 | H | L | US-T-01 | Telegram |
| BH-024 | TG | Пост в канал | US-T-03 | P0 | M | M | Approve | Telegram |
| BH-025 | REP | Жалоба | US-R-01 | P0 | H | L | Auth, listing | Listings |
| BH-026 | MOD | Approve | US-M-01 | P0 | H | M | Admin auth | Listings |
| BH-027 | MOD | Reject | US-M-02 | P0 | H | L | US-M-01 | Listings |
| BH-028 | ADMIN | ACL /admin | US-AD-01 | P0 | H | L | Roles | Listings |
| BH-029 | ADMIN | Очередь и юзеры | US-AD-02 | P0 | H | M | US-AD-01 | Listings |
| BH-030 | ANL | События | US-AN-01 | P0 | H | L | DB | Foundation |
| BH-031 | LEGAL | Privacy/terms | FR-22 | P0 | H | L | D-02 тексты | Beta |
| BH-032 | LEGAL | Удаление аккаунта | FR-23 | P0 | H | M | User | Auth/Beta |
| BH-033 | UX | Empty/loading/error | [07](07-ux-architecture.md) | P0 | H | M | Списки | Search |
| BH-034 | OPS | Cron expire/retry | [08](08-system-architecture.md) | P0 | H | M | Jobs | Listings |
| BH-035 | SAVED | Saved search | US-SS-01 | P1 | H | M | Search, TG | Matching |
| BH-036 | INTENT | Search Intent | US-SI-01 | P1 | H | M | US-SS-01 | Matching |
| BH-037 | MATCH | Уведомление по intent | US-MCH-01 | P1 | H | H | US-SI-01 | Matching |
| BH-038 | FAV | Избранное | US-FV-01 | P1 | L | L | Listings | Growth |
| BH-039 | UX | Radar-lite | F-P1-03 | P1 | M | L | Плотность | Growth |
| BH-040 | TG | Дайджест | F-P1-04 | P1 | M | M | Шум беты | Matching/Growth |
| BH-041 | AUTH | Phone login | US-A-03 | P1 | M | M | Отказ TG Login | Growth |
| BH-042 | SPEC | Админ справочник | US-SP-02 | P1 | L | L | Admin | Growth |
| BH-043 | MASTERS | Каталог мастеров | FR-19 | P1 | ? | M | Интервью | Future |
| BH-044 | LIST | Model/collab типы | FR-20 | P2 | ? | M | Интервью | Future |

Value `?` = нет валидации, не поднимать без интервью.

Исследовательские (не разработка): интервью, аудит каналов, seed — Phase Discovery, без story ID в инженерии.

---

## Пример декомпозиции EPIC Telegram (как в ТЗ)

```text
EPIC: Telegram
  Feature: Notifications
    Story US-N-01: как мастер хочу DM о новых событиях, если подписан
      Tasks:
        - Спроектировать NotificationPreference
        - Модель Notification + dedup_key
        - Триггер после approve
        - Очередь/job отправки
        - Telegram sender
        - Retry + bot_blocked
        - analytics notification_sent
        - тесты подписка вкл/выкл и дедуп
```

Каждая Task относится к US-N-01; история — к гипотезе JTBD-06.
