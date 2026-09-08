# 22 — Execution Order (порядок реализации)

**Связано:** [20](20-roadmap-backlog.md) · [21](21-dependency-map.md) · [16](16-launch-plan.md) · **канон:** [24 §8](24-implementation-spec.md)

Спринты ниже — **относительные этапы**, не календарь и не размер команды. Длительность не обещать.

**Заморожено DEC-17:** UX/UI (U0) стартует сразу. Foundation (E1) можно параллельно с Discovery. **Закрытая бета (E8)** по-прежнему требует seed, модератора и минимум legal (D-02).

---

## Что строить первым (итог)

```text
U0  UX/UI макеты                    ← сразу
D0  Интервью + seed                 ← параллельно
E1  Foundation
E2  Auth + профиль
E3  Объявления
E4  Админ + модерация               ← до Telegram
E5  Поиск, фильтры, контакт
E6  Telegram канал + подписки
E7  Hardening
E8  Закрытая бета
E9  Matching v1 (по сигналу)
```

Отличие от черновика исходника: Admin раньше Telegram; Matching после беты; дизайн не блокируется интервью; бета блокируется seed.

---

## Sprint U0 — UX/UI

По [24 §3](24-implementation-spec.md): токены, ListingCard, P-1 поиск+логин+контакт, P-2 создание Space, админка утилитарно, тексты бота.

- **Готовность:** DoD UX в §3.14 спецификации 24.

---

## Sprint 0 — Discovery (параллельно U0)

Исследование, не репозиторий продукта.

- Интервью, аудит каналов, seed-список, D-02/D-05 план, concierge-канал по желанию.
- **Готовность:** go / pivot / stop записан. Не блокирует U0. Блокирует E8.

---

## Sprint 1 — Foundation (фундамент)

- Репозиторий, модульные границы, PostgreSQL, миграции Location/Specialization, object storage stub, CI lint/typecheck/test, staging hello, таблица analytics_events.
- **Готовность:** деплой staging, seed справочников.

---

## Sprint 2 — Auth + Profiles

- BH-001…006, BH-032 можно здесь или перед бетой.
- Telegram Login, сессии, роли, профиль, аватар.
- **Готовность:** CUJ-1, CUJ-2.

---

## Sprint 3 — Listings + Media + статусы

- BH-008…010, BH-012…015, создание трёх типов, draft/pending.
- Ещё нет публичного поиска — можно превью автора.
- **Готовность:** автор создаёт pending.

---

## Sprint 4 — Admin + Reports + Approve

- BH-025…029, переход published, аудит.
- **Готовность:** CUJ-9, CUJ-10 (без обязательного TG).

Спринты 3–4 можно слить, если один поток разработки.

---

## Sprint 5 — Search + Filters + Contact + UX списков

- BH-007, BH-011, BH-016…019, BH-033, публичные /spaces /events /jobs, empty states.
- **Готовность:** CUJ-4, 5, 6.

---

## Sprint 6 — Telegram

- BH-020…024, webhook, opt-in, канал, retry.
- **Готовность:** CUJ-7, сайт жив при выключенном боте.

---

## Sprint 7 — Hardening + Legal + Beta

- BH-031, бэкапы, smoke, expire job BH-034 если не сделан, политика ПДн.
- Наполнение seed на prod.
- **Готовность:** чеклист [13](13-qa-test-strategy.md) + [16](16-launch-plan.md) Phase 2.

---

## Sprint 8 — Matching (условный)

- BH-035…037, BH-040 по сигналу шума.
- **Не начинать**, если бета не дала published и прокси-клики.
- **Готовность:** DM по фильтрам, тесты матча.

---

## После

Public launch, P1 favorites/radar, рост. Не второй город.

---

## Critical path: зачем каждый шаг

| Шаг | Почему на critical path | Вход | Выход | Проверка готовности | Fallback |
| --- | --- | --- | --- | --- | --- |
| U0 UX/UI | Иначе вёрстка наугад | Спека 24 | Макеты P-1…P-3 | DoD §3.14 | Верстать строго по §3 без Figma |
| D0 Discovery | Иначе бета на ложной боли | Исходник | go/stop | 8 интервью | Concierge |
| E1 Foundation | Некуда писать модули | Спека 24 | Staging | CI green | Локально только — хуже |
| Auth+Profile | Публикация и контакт | Staging | Сессия | CUJ-1/2 | Отложить публичный контакт |
| Listings | Нет объекта ценности | Профиль | Pending карточки | Форма+БД | Notion concierge |
| Admin | Иначе мусор или вечный pending | Pending | Published | CUJ-10 | SQL вручную (плохо, коротко) |
| Search+Contact | Спрос не может найти | Published | Клики | CUJ-4/6 | Канал со ссылками-костылями |
| Telegram | Гипотеза доставки | Published | DM/канал | CUJ-7 | Только канал ручной |
| Beta | PMF не доказать на staging | P0+seed | Данные | [16] Phase 2 | Продлить бету, не Match |
| Matching | Шум/запрос точности | Сигнал беты | Intent DM | Тесты P1 | Остаться на типах |

---

## Compact backlog (исполнение)

Полная таблица: [20](20-roadmap-backlog.md). Канон этапов: [24 §8](24-implementation-spec.md). Порядок кода: BH-001 → … Foundation, Auth, Listings, **Admin**, Search, Telegram, Beta, Matching.
