# 18 — Metrics / North Star (метрики и главная метрика)

**Связано:** [14](14-analytics.md) · [16](16-launch-plan.md) · [04](04-prd.md)

Не вводить fake benchmarks. Все target: `TBD — establish baseline during beta`, метод: две недели закрытой беты → медиана/неделя → цель = не хуже + качественный порог «есть соединения».

---

## North Star

**Successful Connections / Week** (`HYPOTHESIS`).

Операционализация: см. [14](14-analytics.md). Отчёты разделять:

- Прокси: `contact_clicked` unique listing-user / week.
- Подтверждённые: ручной счётчик в таблице ops.

Не стимулировать: фейковые кнопки контакта, обязательный клик, накрутка регистраций, спам уведомлений «чтобы opened вырос».

---

## Input metrics (входные)

Рычаги, на которые влияем напрямую:

- Число seed-касаний салонов.
- Часы модерации.
- Published listings / week.
- Opt-in Telegram по типам.
- Качество карточки (фото, цена, район) — ручной score.

## Output metrics (выходные)

- Прокси-соединения.
- listing_viewed.
- telegram CTR.
- WAU.

## Guardrail metrics (защитные)

| Метрика | Плохой сигнал | Почему вредно оптимизировать North Star без неё |
| --- | --- | --- |
| Reports / published | Рост | Мошенничество, мусор |
| Reject rate | →100% или →0% без правил | Либо спам, либо модерация спит |
| Bot blocked + /stop | Рост | Спам уведомлений |
| notification_sent / user / day | Слишком высоко | Шум |
| Time-to-approve | Растёт | Supply уходит |
| % регистраций без профиля | Высокий | Мёртвые аккаунты |

---

## Funnel (воронка)

```text
Visit (визит)
 ↓
Registration (регистрация)
 ↓
Profile (профиль)
 ↓
Search (поиск)
 ↓
Interaction (просмотр карточки)
 ↓
Connection (клик контакта — прокси)
 ↓
Successful Outcome (подтверждение в бете)
 ↓
Retention (удержание)
```

| Стадия | Metric | Target | Interpretation | Failure signal |
| --- | --- | --- | --- | --- |
| Visit | сессии / просмотры списков | TBD | Есть ли канал привлечения | 0 визитов при живом канале — ссылки битые |
| Registration | `user_registered` | TBD | Telegram Login работает | Отказы Login (качественно) |
| Profile | `profile_completed` / registered | TBD | Онбординг | Большой отвал → урезать поля |
| Search | `search_performed` / WAU | TBD | Пользуются витриной | Регистрация ради бонуса/путаницы |
| Interaction | `listing_viewed` | TBD | Есть что смотреть | Пустой каталог |
| Connection | `contact_clicked` | TBD | Прокси ценности | Просмотры без кликов |
| Successful Outcome | ручной | TBD | PMF | Клики без сделок — доверие/актуальность |
| Retention | WAU / MAU, D7 | TBD | Привычка | Разовые визиты после уведомления-шума |

---

## Согласованность с продуктом

Matching метрики (`match_created`) не входят в воронку MVP.

Не использовать DAU как главную: продукт может быть episodic (ищу кабинет раз в квартал). **Удержание** важнее смотреть на supply (повторные публикации) и на мастеров с включёнными уведомлениями, не на ежедневный заход на Home.

---

## Дашборд минимума (админка)

1. Published by type (live).  
2. Pending queue length.  
3. contact_clicked 7d.  
4. listing_viewed 7d.  
5. notification_sent / failed 7d.  
6. new users 7d.  
7. reports open.  

Этого достаточно, чтобы понять «жив / не жив».
