# 13 — P-1 Visual Review (U2 Pixel UI)

**Этап:** U2 Pixel UI Design — P-1.  
**Pre-approval audit (2026-09-06): `APPROVED`.** Код не писался. Следующий этап: [P-2 Create](14-p2-create.md) (кадры Figma ещё не собраны — лимит MCP). P-3 не начат.  
**Канон:** [01-ui-foundation.md](01-ui-foundation.md) · [00-visual-direction.md](00-visual-direction.md) · [05-prototype-p1.md](05-prototype-p1.md) · U0/U1 утверждены.

---

## Figma

| | |
| --- | --- |
| Файл | [Beauty Hub — Pixel UI](https://www.figma.com/design/dDbdGIcFAmXhlOxKS6MuVc) |
| Команда Figma | My works (`team::1389174866215423522`) |
| Страница | **U2 — P1 Pixel UI** |
| Page id | `0:1` |

**Основной prototype flow (mobile P-1):**  
[P-1 Mobile · Guest → Contact](https://www.figma.com/proto/dDbdGIcFAmXhlOxKS6MuVc/Beauty-Hub---Pixel-UI?page-id=0-1&node-id=13-112&starting-point-node-id=13-112&scaling=scale-down)

Стартовый кадр: `P1 / Home / Mobile / 375` (`13:112`).

**Desktop flow:**  
[P-1 Desktop · Guest → Contact](https://www.figma.com/proto/dDbdGIcFAmXhlOxKS6MuVc/Beauty-Hub---Pixel-UI?page-id=0-1&node-id=17-268&starting-point-node-id=17-268&scaling=scale-down)

Стартовый кадр: `P1 / Home / Desktop / 1280` (`17:268`).

Файл новый (дубликатов Beauty Hub не было). Сообщество Material 3 / iOS kits в аккаунте **не использовалось** — визуал только из U1.

---

## Структура страницы

1. **Section 1 — Foundations** — цвета, типографика, spacing, radii, атомы.  
2. **Section 2 — ListingCard** — варианты + edge cases.  
3. **Section 3 — P-1 Mobile** — экраны 375.  
4. **Section 4 — P-1 Desktop** — экраны 1280.  
5. **Section 5 — Prototype Flow** — карта переходов и правило `next`.

---

## Созданные frames

### Mobile 375 (обязательный набор)

| Frame | Node |
| --- | --- |
| `P1 / Home / Mobile / 375` | `13:112` |
| `P1 / Search Space / Mobile / 375` | `13:178` |
| `P1 / Listing Guest / Mobile / 375` | `14:207` |
| `P1 / Login / Mobile / 375` | `14:303` |
| `P1 / Login error / Mobile / 375` | `14:314` |
| `P1 / Onboarding Role / Mobile / 375` | `15:241` |
| `P1 / Onboarding Profile / Mobile / 375` | `15:263` |
| `P1 / Onboarding Notifications / Mobile / 375` | `15:283` |
| `P1 / Listing Authenticated / Mobile / 375` | `14:255` |

Дополнительный кадр (не продукт, заглушка виджета):

| Frame | Зачем |
| --- | --- |
| `P1 / Telegram Login / Mobile / 375` | Промежуточный кадр вместо реального Telegram Login. `next` тот же. |

### Desktop 1280

| Frame | Node |
| --- | --- |
| `P1 / Home / Desktop / 1280` | `17:268` |
| `P1 / Search Space / Desktop / 1280` | `17:335` |
| `P1 / Listing Guest / Desktop / 1280` | `18:374` |
| `P1 / Login / Desktop / 1280` | `18:462` |
| `P1 / Listing Authenticated / Desktop / 1280` | `18:418` |

### Onboarding desktop

**Не делался.** Для проверки P-1 достаточно mobile: роль → профиль → уведомления. Повторный пользователь на desktop в прототипе идёт Login → Listing Authenticated (онбординг пропускается). Это соответствует «onboarding можно начать с mobile».

---

## Компоненты

Переиспользуемые, Auto Layout, варианты состояний:

| Компонент | Назначение |
| --- | --- |
| `TypeBadge` | Space / Event / Vacancy, нейтральный `surfaceMuted` |
| `SpecChip` | Default / Muted (`+N`) |
| `SearchTypeChip` | Selected True/False |
| `Button` | Primary, Secondary, Telegram, Text × Mobile/Desktop × Default/Disabled |
| `ErrorMessage` | Текст ошибки `danger` |
| `Input` | Default / Focus / Error × Mobile/Desktop |
| `Select` | Mobile / Desktop |
| `Header` | Mobile 52 / Desktop 64 |
| `TabBar` | Active Главная / Поиск |
| `OnboardingProgress` | 3 сегмента, caption шага |
| `ListingCard` | Viewport × Type × Media × State (Hover только desktop Space) |
| `SearchField` | Иконка + placeholder «Название» |
| `ListingCard/Skeleton` | Loading для списка |
| `EmptyState` | Пустой каталог (на экранах P-1 happy path не стоит) |

Медиа-блок живёт **внутри** `ListingCard` и gallery на details (геометрия 4:3, `surfaceMuted`, без стоковых лиц). Отдельный published `MediaBlock` не выносился — тот же паттерн.

---

## Prototype flow

Канонический listing id: `lst_p1_cabinet_sadovaya`  
`next=/listings/lst_p1_cabinet_sadovaya` подписан на Login и onboarding.

**Mobile**

```
Home → (плитка Кабинеты / «Все») → Search Space
     → карточка → Listing Guest
     → «Войти, чтобы написать» → Login
     → ← назад → Listing Guest (не Home)
     → Telegram Login (заглушка) → Onboarding Role → Profile → Notifications
     → Сохранить / Настроить позже → Listing Authenticated (тот же id)
     → CTA «Написать в Telegram»
```

Login error: слот Telegram ведёт на ту же заглушку (next тот же). «Попробовать снова» → Login. Назад → Listing Guest.

**Desktop**

```
Home → Search → Listing Guest → Login → Listing Authenticated
```

Онбординг на desktop в прототипе не показан (см. выше).

После авторизации пользователь **не** попадает на Home и **не** ищет объявление заново. Authenticated listing — отдельный кадр того же экрана с другим CTA, не новый listing.

---

## Принятые решения (не новые функции)

1. Файл в команде **My works**; при необходимости файл можно перенести.  
2. Starter plan = **1 mode** у variables. Mobile/desktop sizes — отдельные переменные (`size/button-mobile` = 48, `size/button-desktop` = 44), не Light/Dark и не режимы viewport. Значения из U1, имена с дефисом: точка в имени Figma variable запрещена.  
3. Шрифт **Manrope** (Regular / Medium / SemiBold / Bold) — доступен, Inter не подмешивался.  
4. Фото на карточках — геометрическая плашка (кабинет), не стоковые улыбки.  
5. Цена на details: `type.accentMeta` с локальным 18/24, без нового текстового стиля в библиотеке (см. UI approval).  
6. Toggle онбординга: track 48×28, `radius.control` 10 — не pill 999px.  
7. Иконки таббара — линейные квадраты 24, не Lucide-набор.  
8. Filter sheet mobile **не макетился** — happy path P-1 его не открывает.

---

## Visual hierarchy (проверка)

| Вопрос | Оценка | Комментарий |
| --- | --- | --- |
| Что замечает первым? | Home: заголовок + плитки. Search: карточка (фото → бейдж → цена). | На Home 812 плитки занимают первый экран; «Новые» почти под fold (P1). |
| Назначение страницы | Да | Home = вход в типы. Search = «Кабинеты». Listing = одно объявление + CTA. Login = Telegram. |
| Главное действие | Да | Плитки / карточка / одна primary CTA. |
| Карточка не перегружена | Да | Нет автора, сердца, CTA в списке. |
| Цена/дата заметны | Да | `accentMeta` Bold 16, цвет text, не teal. |
| Куда нажать для контакта | Да | Гость: «Войти, чтобы написать». Auth: «Написать в Telegram». |
| Конкуренция Header / фильтры / карточки / CTA | Search: приемлемо | Sticky чипы+поиск на surface. CTA только на details. |
| Mobile плотность | Спорно | Home плотный сверху, карточки обрезаны. Search — одна карточка в кадре 812, вторая уходит в скролл. |
| Desktop пустой? | Нет по спеке | Hero + столбик плиток 320. Search: sidebar 240 + 2 колонки. Нужна живая сверка (скриншоты desktop не сняты). |

Антиреференсы: нет stories, жёлтого Avito-CTA, синего LinkedIn, графиков SaaS, розового spa.

Сканирование 2–3 сек на ListingCard (по скриншоту набора): фото → «Кабинет» → район → цена жирным. Hierarchy U1 соблюдена.

---

## Соответствие U0/U1

| Тема | Статус |
| --- | --- |
| Нет Favorites / Featured / Radar / «Все» типов | Да |
| Контакт после login, `next` живёт через onboarding | Да в прототипе и подписях |
| Nav Home / Search / Create / Profile | Да |
| Карточка вертикальная, 343 / 4:3 | Да (mobile 343×258 media, card height 394 при 1 строке title) |
| Search 1280: sidebar + 2 колонки | Да |
| Login полная страница, desktop колонка 400 | Да, не модалка |
| Telegram Login — серый слот, не фейковый чат | Да |
| Онбординг: роль 72h, тогглы default off, skip | Да |

---

## Figma quality

| Критерий | Оценка |
| --- | --- |
| Auto Layout | Экраны и компоненты на auto-layout; gallery details — frame с абсолютными плашками внутри (фотоколлаж). |
| Variables | Color / Spacing / Radius / Size, scopes заданы, WEB `var(--…)`. |
| Text styles | 13 стилей `type/*` по U1. |
| Variants | Button, Input, ListingCard, chips, Header, TabBar связаны. |
| Instance overrides | Title/District/Accent/Label через TEXT properties. |

---

## Проблемы

См. **Pre-approval audit** ниже. Старые P0 про неснятые скриншоты сняты: структура, тексты и reactions всех обязательных кадров прочитаны из файла; Home / Search / Listing Guest / Listing Auth / ListingCard проскриншочены.

### P0

Нет открытых P0. Login error «Попробовать снова» и Назад подключены в этом аудите (`14:325` → Login, `14:316` → Listing Guest).

### P1 — желательно

1. Home 375×812: «Новые кабинеты» почти под fold.  
2. Иконки TabBar — геометрические заглушки.  
3. TabBar на details Active=Поиск, а не «не active».  
4. Вторая карточка Search и лишние плитки Home desktop не соединены в prototype.  
5. Desktop header underline всегда «Главная».  
6. Desktop Login без явного Назад (happy path идёт в Telegram → listing).  
7. Guest видит «Пожаловаться» — U0 прячет до входа; U1 04 рисует строку. Не чинилось молча.  
8. Listing Auth mobile: Назад не соединён.

### P2 — не требует изменения для P-1

1. Нет filter sheet — happy path P-1 его не открывает.  
2. Онбординг только 375.  
3. `type.priceDetails` не заведён; на details стоит override 18/24.  
4. Файл в My works.  
5. Плитки Home как главный жест vs карточки на первом экране — уже решение U1.  
6. Нет 768, нет реальных фото, нет Event/Vacancy desktop variants, F9 «открылся Telegram» не обязателен.

---

## Противоречия спека ↔ макет (не чинились молча)

| Тема | Спека | Макет | Предложение |
| --- | --- | --- | --- |
| Цена на details | 18/24 Bold ([04](04-listing-details.md)) | `type.accentMeta` 16/22 + override 18/24 | Либо завести `type.priceDetails` после approval, либо оставить override. |
| Имена size tokens | `size.button` mobile/desktop как одно имя | `size/button-mobile` из-за 1 mode и запрета `.` в имени | В коде мапить на `size.button`. |
| Filter sheet | Описан в U1 Search | Нет кадра | Не нужен для P-1 happy path; сделать после approval P-1 или вместе с P-2. |
| Onboarding 1280 | «можно mobile only» | Только 375 | Оставить. Повторный desktop user → listing. |

Новых **цветовых** токенов нет.

---

## Вопросы (закрыты аудитом как не-блокер)

1. Home fold / плитки vs карточки — P1/P2, не держит approval.  
2. `type.priceDetails` — P2.  
3. Геометрические фото — достаточно для P-1.  
4. Онбординг mobile-only — достаточно для P-1.  
5. Иконки таббара — P1, можно в P-2 или в коде.  
6. My works — P2.

---

## Pre-approval audit (2026-09-06)

**Статус:** `APPROVED` — нет BLOCKER и нет открытых P0.

Проверено по файлу (тексты, размеры, reactions) + скриншоты Home/Search/Listing Guest/Listing Auth/ListingCard. Login / Onboarding / Desktop: структура и copy из Plugin API; пиксельный скриншот этих кадров в этой сессии упёрся в лимит Figma MCP — выдуманных пикселей нет.

### next / prototype

| Шаг | Результат |
| --- | --- |
| Home → Search (плитка Кабинеты, «Все») | Да |
| Search card → Listing Guest | Да |
| Guest CTA → Login | Да |
| Login ← → тот же Listing Guest, не Home | Да |
| Login Telegram → заглушка → Role → Profile → Notify | Да |
| `next=/listings/lst_p1_cabinet_sadovaya` на Login и onboarding | Да |
| Save / «Настроить позже» → Listing Authenticated, тот же кабинет | Да |
| CTA guest vs auth | «Войти, чтобы написать» → «Написать в Telegram» |
| Desktop: Home → Search → Guest → Login → Auth listing | Да (онбординг пропущен, как повторный user) |
| Login error retry/back | Исправлено в этом аудите |

### Классификация открытых вопросов

| Вопрос | Класс | Почему |
| --- | --- | --- |
| Home 375: «Новые» под fold | P1 | Плитки — главный жест U1; P-1 не ломается |
| Плитки vs карточки | P2 | Уже решение U0/U1 |
| Placeholder icons | P1 | Полировка, не scope-break |
| «Попробовать снова» | закрыто | Соединено на Login |
| Нет filter sheet | P2 | Happy path P-1 не открывает фильтры |
| `type.priceDetails` 18/24 | P2 | Визуал 18/24 есть override; токен можно завести в коде |
| Онбординг только mobile | P2 | Разрешено U2 для проверки P-1 |
| Файл в My works | P2 | Операционное, не продукт |

### MVP scope

Нет Favorites / Featured / Radar / чипа типов «Все» / social / Mini App. «Все» на Home — ссылка секции «Новые кабинеты». «Все районы» / «Все направления» — опции фильтров.

### Accessibility

Кнопки 48 mobile / 44 desktop, back 44, плитки/роли 72, tabbar 56, input/search 48. Touch min 44 соблюдён на проверенных контролах.

### Решение

P-1 визуально утверждён для перехода к **P-2/P-3 Pixel UI Design**. Не Implementation Planning. Не код.
