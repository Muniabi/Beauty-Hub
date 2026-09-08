# 06 — User Stories + Acceptance Criteria (пользовательские истории и критерии приёмки)

**Связано:** [04 — PRD](04-prd.md) · [05 — MVP Scope](05-mvp-scope.md) · [13 — QA](13-qa-test-strategy.md) · [14 — Analytics](14-analytics.md) · [20 — Backlog](20-roadmap-backlog.md)

Иерархия: Epic → Feature → User Story → Acceptance Criteria → Task.

Истории **вне MVP** помечены `P1`/`P2`/`Future`. Задачи (Task) в этом файле — на уровне проверки, детальный breakdown в [20](20-roadmap-backlog.md).

Формат AC:

```text
Given (Дано)
When (Когда)
Then (Тогда)
```

---

## EPIC-AUTH — Authentication (аутентификация)

### Feature: Telegram Login

**US-A-01** — Регистрация через Telegram  
Связь: BH-FR-01 · событие `user_registered` · тест CUJ-1

> As a мастер или владелец объявления (как пользователь),  
> I want войти через Telegram (я хочу),  
> So that не создавать отдельный пароль и сразу связать уведомления (чтобы).

```text
Given я открыл экран входа
When я успешно авторизовался через Telegram Login
Then создаётся или находится User, выставляется сессия,
     пишется событие user_registered (только при первом создании)
```

Негатив: отказ Telegram → сообщение ошибки, сайт гостевой режим доступен.

**US-A-02** — Выход

> As a пользователь, I want выйти, So that сессия на чужом телефоне не осталась.

```text
Given я авторизован
When нажимаю «Выйти»
Then cookie сессии сбрасывается, контакт на карточках снова скрыт
```

**US-A-03** Future/P1 — Вход по телефону: не в MVP.

---

## EPIC-PROFILE — User Profiles (профили)

### Feature: Онбординг роли и профиля

**US-P-01** — Выбор роли и обязательные поля  
BH-FR-02, BH-FR-03 · `profile_completed` · CUJ-2

> As a новый пользователь, I want указать роль и имя с контактом, So that система понимает, что я создаю и как со мной связаться.

```text
Given я вошёл впервые
When я выбираю роль master | space_owner | organizer
     и сохраняю имя и контакт Telegram
Then профиль валиден для публикации (для supply) и для контакта
     событие profile_completed когда обязательные поля заполнены
```

**US-P-02** — Редактирование профиля

```text
Given я авторизован
When меняю район или специализацию и сохраняю
Then публичные поля карточек, которые наследуют контакт, остаются согласованными
```

**US-P-03** — Загрузка фото профиля

```text
Given я на экране профиля
When загружаю изображение допустимого типа и размера
Then оно показывается; при недопустимом файле — ошибка без падения
```

См. ограничения в [12](12-security-plan.md).

---

## EPIC-SPEC — Specializations (специализации)

**US-SP-01** — Выбор специализации из справочника  
BH-FR-04

> As a мастер, I want выбрать направление из списка, So that меня находят фильтры и карточки событий.

```text
Given справочник из 7 значений MVP
When я выбираю nail
Then значение сохраняется, свободного текста нет
```

**US-SP-02** Admin — добавить значение справочника: P1 (в MVP хватает seed в миграции).

---

## EPIC-LIST — Listings (объявления)

Общие правила: черновик, отправка на модерацию, автор видит свои статусы.

**US-L-01** — Просмотр карточки  
BH-FR-11 · `listing_viewed` · CUJ-3

```text
Given существует published Space
When гость открывает URL карточки
Then видны заголовок, район, цена, специализации, фото, статус актуальности
     контакт скрыт до входа (DEC-03)
```

**US-L-02** — Создание объявления  
BH-FR-06/07/08 · `listing_created` · CUJ-3

> As a владелец помещения, I want создать объявление кабинета, So that мастера его найдут.

```text
Given профиль с именем и контактом
When я заполняю обязательные поля Space и отправляю
Then статус pending, объявление не в публичном поиске
     событие listing_created
```

Негатив: нет обязательных полей → 400/валидация формы, без создания.

**US-L-03** — Снять / архивировать своё объявление

```text
Given я автор published карточки
When архивирую
Then карточка исчезает из поиска, в канале не требуется удалять исторические посты
     (ASSUMPTION: не редактируем историю канала)
```

**US-L-04** — Истечение

```text
Given дата истечения наступила
When отрабатывает daily job
Then статус expired, нет в поиске
```

---

## EPIC-SPACE — Spaces (помещения)

**US-SPCE-01** — Фильтр кабинетов  
BH-FR-10 · `filter_applied` · CUJ-5

> As a мастер, I want фильтровать кабинеты по району и цене, So that не смотреть нерелевантное.

```text
Given несколько published Space в разных районах
When я ставлю район Ворошиловский и цену до 20000
Then в списке только подходящие; пустой список показывает empty state
     с предложением подписаться в Telegram
```

---

## EPIC-EVENT — Events (мероприятия)

**US-E-01** — Создать мастер-класс  
BH-FR-07

```text
Given роль organizer или любая supply-роль (ASSUMPTION: организатор может быть и мастер)
When создаю Event с датой в будущем и специализацией
Then pending → после approve виден в Events и фильтре по дате
```

**US-E-02** — Внешняя ссылка регистрации

```text
Given у Event заполнен external_url
When пользователь нажимает «Регистрация»
Then открывается внешний URL, пишется external_link_clicked
     (если события нет в [14], учитывать как contact_clicked с property target=external)
```

Нет истории «оплатить билет».

---

## EPIC-VAC — Vacancies (вакансии)

**US-V-01** — Салон ищет мастера  
BH-FR-08

```text
Given роль salon_owner
When создаёт vacancy direction=looking_for_master и специализацию barber
Then после publish карточка в Jobs с фильтрами
```

**US-V-02** — Мастер ищет работу

```text
Given роль master
When создаёт vacancy direction=looking_for_job
Then карточка видна в том же разделе с фильтром направления
```

---

## EPIC-SEARCH — Search (поиск)

**US-S-01** — Поиск по типу  
BH-FR-10 · `search_performed` · CUJ-4

> As a мастер, I want выбрать «кабинеты», So that не смешивать события с арендой.

```text
Given published объекты трёх типов
When выбираю тип space
Then список только space
```

**US-S-02** — Текстовый поиск по заголовку

```text
Given карточка «Кабинет на Северном»
When ввожу «север»
Then карточка находится либо пустой empty state
```

Точность FTS: лучшее усилие PostgreSQL, не Elasticsearch.

---

## EPIC-FILTER — Filters (фильтры)

**US-F-01** — Комбинация фильтров · `filter_applied`

```text
Given набор карточек
When применяю специализацию nail и район
Then AND-логика; сброс фильтров возвращает полный список типа
```

---

## EPIC-SAVED — Saved Searches (сохранённые поиски)

**US-SS-01** P1 — Сохранить фильтры  
BH-FR-18 · `HYPOTHESIS`

> As a мастер, I want сохранить «кабинет, nail, до 20к», So that мне писали, когда появится.

Не реализуется в MVP. AC появятся в итерации Matching.

**US-SS-02** Future — список сохранённых поисков.

---

## EPIC-INTENT — Search Intent (поисковое намерение)

**US-SI-01** P1 — Создать намерение (может совпадать с saved search).  
Связь matching: [08 ADR-004](08-system-architecture.md).

---

## EPIC-MATCH — Matching (подбор)

**US-MCH-01** P1 — Получить уведомление по намерению, не по всем кабинетам города.

MVP: **не делать**. Заглушек «0 совпадений для вас» на главной не делать — вредно при пустом supply.

---

## EPIC-NOTIF — Notifications (уведомления)

**US-N-01** — Уведомление по типу  
BH-FR-13 · `notification_sent` · CUJ-7

> As a мастер, I want получить сообщение о новом событии, если подписан на события, So that не дежурить на сайте.

```text
Given пользователь tied Telegram, подписка event = true, space = false
When модератор публикует Event
Then уходит одно сообщение со ссылкой на карточку
     при публикации Space сообщение этому пользователю не уходит
```

**US-N-02** — Идемпотентность

```text
Given повторная доставка webhook/job для того же listing_id и user_id
When job выполняется дважды
Then пользователь не получает два одинаковых «новое объявление» (дедуп ключ)
```

---

## EPIC-TG — Telegram

**US-T-01** — /start и привязка · `telegram_connected` · CUJ-7

```text
Given я авторизован на сайте (или прохожу deep link с токеном)
When пишу боту /start и подтверждаю привязку
Then TelegramAccount связан с User, настройки трёх типов доступны
```

Точный UX привязки: [11](11-telegram-architecture.md). Telegram Login сразу создаёт `TelegramAccount` (DEC-13). Бот — подписки и сообщения.

**US-T-02** — Настройки подписок в боте или на сайте (достаточно одного места в MVP: сайт Settings + бот дублирует кнопки).

```text
Given связанные аккаунты
When снимаю галочку «вакансии»
Then новые vacancy не приходят
```

**US-T-03** — Канал публикует после approve  
BH-FR-14

```text
Given listing перешёл в published
When срабатывает publisher
Then в канале пост с заголовком, районом, ценой/датой и URL сайта
```

Сбой Telegram API: listing остаётся published на сайте (NFR-10).

**US-T-04** Won't — полный мастер создания объявления в боте.

---

## EPIC-FAV — Favorites (избранное)

**US-FV-01** P1 — Добавить в избранное.

Не в MVP.

---

## EPIC-REP — Reports (жалобы)

**US-R-01** — Пожаловаться  
BH-FR-15 · CUJ-9

> As a пользователь, I want отметить мошенничество, So that карточку сняли.

```text
Given published карточка
When авторизованный пользователь отправляет report с причиной
Then запись в админке, карточка пока видна до решения модератора
     (не скрываем автоматически — антиабьюз жалоб)
```

---

## EPIC-MOD — Moderation (модерация)

**US-M-01** — Approve  
BH-FR-16 · CUJ-10

```text
Given listing pending
When admin approve
Then status published, появляется в поиске, триггер канала и уведомлений по типу
```

**US-M-02** — Reject

```text
Given pending или published
When admin reject с причиной
Then не в поиске, автор видит статус rejected
```

---

## EPIC-ADMIN — Admin (администрирование)

**US-AD-01** — Доступ только staff

```text
Given пользователь без роли admin
When открывает /admin
Then 403
```

**US-AD-02** — Список пользователей и объявлений (чтение + модерация). Аналитика в админке — простые счётчики, не BI.

---

## EPIC-ANL — Analytics (аналитика)

**US-AN-01** — События пишутся без PII в свойствах сверх необходимого  
BH-FR-21

```text
Given пользователь выполнил поиск
When запрос успешен
Then search_performed с properties: type, has_filters (не сырой IP в событии)
```

Список свойств: [14](14-analytics.md).

---

## Трассировка историй P0 → тесты

| Story | CUJ / тип теста |
| --- | --- |
| US-A-01 | CUJ-1 |
| US-P-01 | CUJ-2 |
| US-L-02, US-E-01, US-V-01 | CUJ-3 |
| US-S-01, US-SPCE-01 | CUJ-4, CUJ-5 |
| US-L-01 + контакт | CUJ-6 |
| US-N-01, US-T-01 | CUJ-7 |
| Matching | CUJ-8 только после P1 |
| US-R-01 | CUJ-9 |
| US-M-01 | CUJ-10 |

CUJ-8 Matching в MVP пропускается как N/A.

---

## Task-уровень (пример для передачи в разработку)

Не код, а декомпозиция US-N-01:

- Спроектировать NotificationPreference (три булева).
- Модель Notification с уникальным ключом (listing_id, user_id, kind).
- Job после transition → published.
- Отправка Telegram, retry, лог ошибки.
- Событие notification_sent.
- Тесты: подписка вкл/выкл, дедуп.

Полная таблица бэклога: [20](20-roadmap-backlog.md).
