# 15 — P-3 Admin / Moderation (UX/UI)

**Этап:** U2 P-3. Не код. Не implementation planning.  
**P-1:** `APPROVED` ([13-p1-visual-review.md](13-p1-visual-review.md)).  
**P-2:** спека Create ([14-p2-create.md](14-p2-create.md)); кадры Figma ещё не собраны (лимит MCP).  
**Канон:** [../24-implementation-spec.md](../24-implementation-spec.md) DEC-09, DEC-21, DEC-22, §2.6, §3.9, §3.12 · [../ux/08-moderation.md](../ux/08-moderation.md) · [07-prototype-p3.md](07-prototype-p3.md) · [../ux/09-telegram-ux.md](../ux/09-telegram-ux.md) · токены [01-ui-foundation.md](01-ui-foundation.md).

**Figma:** не создавать кадры в этой сессии. Когда MCP снова доступен — страница **`U2 — P3 Moderation`** в том же файле [Beauty Hub — Pixel UI](https://www.figma.com/design/dDbdGIcFAmXhlOxKS6MuVc). Не второй файл.

---

## 1. Цель

Админ за минуты: что пришло, какой тип, кто автор, что увидит каталог, можно ли опубликовать, почему отклонить, какие жалобы открыты.

Поток:

```text
Queue → Moderation Details → Approve | Reject → (очередь без этой pending-строки)
Reports → Report Details → Item (при необходимости unpublish) | Resolve
```

Не CMS, не BI, не CRM, не AI, не автомодерация, не messenger.

После **approve:** `published` → публичный каталог. Telegram channel и opt-in DM — **только из published**, асинхронно (DEC-09). Админ **не** жмёт «отправить в Telegram».

---

## 2. Роли и доступ

| Кто | Как | UI |
| --- | --- | --- |
| `admin` | роль в БД, не онбординг | `/admin/*` |
| Остальные залогиненные | — | SCR 403 «Нет доступа», secondary «На главную», без пунктов очереди |
| Гость на `/admin` | — | Login `next=/admin/listings`, затем 403 если не admin |

`/admin` **нет в таббаре** публичного приложения.

Staff chrome (не публичный Header/TabBar): высота 64, `surface` + hairline. Слева: «Beauty Hub» caption muted + «Админ» `type.nav`. Навигация текстом: **Очередь** | **Жалобы**. Справа имя + «Выйти». Активный пункт — underline 2px accent (как desktop P-1).

**P3-DEC-01.** В P-3 в nav только Очередь и Жалобы. U0 ещё знает Пользователи (block) и Сводка (7 чисел) — приоритет P1 в blueprint, **вне инвентаря P-3**. Не проектировать dashboard и RBAC.

---

## 3. Information architecture

| Экран | URL | Заметка |
| --- | --- | --- |
| Queue | `/admin/listings?status=pending` | дефолт pending |
| Item | `/admin/listings/:id` | approve / reject / unpublish |
| Reports | `/admin/reports?status=open` | дефолт open |
| Report | `/admin/reports/:id` | resolve + ссылка на item |
| 403 | любой `/admin/*` для не-admin | без утечки данных очереди |

Канонический объект P-3 = тот же кабинет P-1/P-2: `lst_p1_cabinet_sadovaya`, «Кабинет 14 м² у Садовой», Ворошиловский, Анна К., `@anna`.

Жизненный цикл (не менять):

```text
draft → pending → published | rejected
published + edit → pending          (DEC-21)
published → expired | archived
жалоба open ↛ автоскрытие           (DEC-22)
approve published → catalog + TG jobs
```

---

## 4. Queue

Desktop-first. Плотнее публичного каталога, **те же токены**, фон `bg`, не серый SaaS.

### 4.1. Шапка экрана

Title `type.titleLg` «Очередь».  
Сегмент **36h** (не 40 чипов каталога): `pending` | `published` | `rejected` | `все`. Дефолт **pending**. Выбран: `accentSubtle` + border accent + текст accent.  
Сорт не выбирается: FIFO, **сначала старые pending** (SLA 24 ч). Под сегментом caption 13 muted: «Сначала старые. Без массового одобрения.»

**P3-DEC-02.** Фильтра по типу **нет**. Тип виден бейджем в строке. FIFO по всем типам, чтобы не прятать старый Event за фильтром «Кабинеты».

### 4.2. Строка (1280)

Высота **72**, hairline `border`, hover `surfaceMuted`, cursor pointer. Клик по всей строке → Item. Нет bulk checkbox.

| Колонка | Содержание | Токен |
| --- | --- | --- |
| Thumb | 72×72, 4:3 crop, radius 8 | compact [02](02-listing-card.md) |
| Тип | TypeBadge Кабинет / Мероприятие / Вакансия | как P-1 |
| Название | 1 строка ellipsis | `type.cardTitle` |
| Район | caption | `textMuted` |
| Автор | display_name | `type.body` |
| Подано | «2 ч назад» | `type.caption` |
| Жалобы | число open; `0` → «—» | caption; >0 — `warning` |
| Статус | StatusBadge, если фильтр не только pending | pending warning / published success / rejected danger |
| › | chevron 20 muted | hit с строкой |

Пример pending Space: thumb геометрия P-1 · Кабинет · Кабинет 14 м² у Садовой · Ворошиловский · Анна К. · 2 ч назад · — · На проверке.

### 4.3. Pagination

UX-DEC-05: кнопка secondary «Показать ещё» 44h desktop под таблицей, не infinite, не страницы 1,2,3.

### 4.4. Состояния Queue

| State | UI |
| --- | --- |
| Loading | шапка+сегмент на месте; 5 skeleton rows 72 (thumb + полоски), без текста |
| Empty pending | центр: иконка 32 linear muted + «Очередь пуста» body. Без иллюстраций, без CTA создать |
| Empty published/rejected | «Нет объявлений в этом статусе» |
| Error | banner `dangerBg` под шапкой + «Повторить» |
| Results | таблица + «Показать ещё» если есть хвост |

---

## 5. Moderation Details

### 5.1. Desktop 1280 — две колонки

Gap 40. Контент 1120.

**Лево ~60% — публичный preview (как гость на P-1 Listing, read-only):**

- галерея (4:3, счётчик 1/n);
- TypeBadge + район;
- title, цена/дата/direction;
- спец. чипы;
- описание и факты типа (площадь / starts_at / direction);
- блок автора **публичный**: имя + роль, **без** телефона, **без** `@`, **без** CTA «Написать» / «Войти, чтобы написать».

Caption 13 muted над превью: «Так увидят в каталоге после публикации. Контакт гостю не показывается.»

**Право ~40% sticky top 80 — staff:**

- StatusBadge;
- «Подано» абсолютная дата + относительная;
- Автор: id (моно caption), имя, роль;
- **Staff-only контакт:** `@anna` (и телефон, если есть) в плашке `surfaceMuted` radius 10 pad 12. Лейбл caption: «Только модерация. Не копировать в публичный preview.»
- Жалобы: список open или «Жалоб нет»; строка → Report Details;
- Primary **Одобрить** 44h (1280) / 48h (375), fill accent, full ширины колонки;
- Secondary **Отклонить** — outline `danger`, текст danger, не primary teal.

Для `published` (зашли из фильтра): Одобрить не дублировать смысл — повтор = toast «Уже опубликовано» (идемпотентность API). Показать **Снять с витрины** text danger (unpublish → archived, confirm). Для `rejected`: причина read-only + «Уже отклонено».

### 5.2. Mobile 375

Стек: back 52 «Проверка» → public preview → staff мета → sticky низ: Одобрить primary + Отклонить outline. Большой палец. Нет публичного TabBar.

Имеет смысл: модератор в бете со смартфона ([ux/11](../ux/11-responsive-strategy.md) §5).

---

## 6. Approve

**P3-DEC-03.** U0: approve в **два** тапа (открыть → одобрить). U2 P-3 требует confirmation перед публикацией: **диалог**, не отдельный маршрут. Итого три тапа. Оправдано: публикация необратима для каталога и включает Telegram jobs.

Диалог 320–400, radius 10, `elevation.dialog`, surface:

- title 20: «Опубликовать?»
- body 15: «Карточка появится в поиске. В канал и в уведомления Telegram попадёт только после публикации, не из черновика.»
- Secondary «Отмена» · Primary «Одобрить»

После успеха:

- toast 48h 2с «Опубликовано» (`surface` + border, не конфетти);
- возврат в Queue pending **без этой строки**;
- listing `published`; guest Search может его найти (связка с P-1, не новый продукт).

Нет кнопки «Пост в канал». Нет превью Telegram-сообщения в admin (копирайт уже в [09](../ux/09-telegram-ux.md)).

---

## 7. Reject

Раскрытие на Item, не отдельный URL:

1. Тап «Отклонить» → textarea 96h, лейбл «Причина для автора *», placeholder «Например: фото не кабинета / цена не указана».  
2. Кнопка «Отклонить» в панели **disabled**, пока причина пустая/пробелы.  
3. Confirm dialog: «Автор увидит эту причину в карточке.» Отмена / Отклонить (fill danger **только здесь**, не на очереди).

**Валидация:** пустой submit не уходит; border danger + «Укажите причину для автора». Не toast вместо поля. Причина — тот же текст, что в ModerationBanner автора ([04](04-listing-details.md) §6, copy §3.9 «Не опубликовано. Причина: {reason}»).

После успеха: toast «Отклонено» → Queue без строки. Статус `rejected`. В каталоге нет. Telegram нет.

Черновик (`draft`) в очередь не попадает (P-2: черновик ≠ модерация).

---

## 8. Reports

### 8.1. Список `/admin/reports`

Сегмент 36h: **open** (дефолт) | **resolved**.  
«Показать ещё». FIFO: сначала старые open.

Строка ~72:

| | |
| --- | --- |
| TypeBadge + title listing 1 строка | объект жалобы |
| Причина | enum §3.9: мошенничество / спам / неверная информация / запрещённый контент / неактуально |
| Кто | display_name жалобщика (staff) |
| Дата | относительно |
| Статус | open warning / resolved muted |
| › | детали |

Empty open: «Нет открытых жалоб».  
Loading/error — как Queue.

**P3-DEC-04 (DEC-22).** «Разобрано» **не** снимает карточку с витрины. Снятие — только Item: reject (pending) или unpublish (published).

### 8.2. Report Details

- Причина + опциональный comment;
- кто и когда;
- compact listing (thumb, тип, title, район, StatusBadge);
- Primary text/secondary: «Открыть объявление» → Item;
- Primary: «Отметить разобранным» (open → resolved), confirm короткий «Жалоба закроется. Объявление не изменится.»
- Если listing published и жалоба о мошенничестве/запрещёнке: caption-ссылка «Чтобы снять с витрины — объявление → Снять с витрины».

Репорт своего listing API запрещает — в UI не нужно.

Жалоба с публичной карточки (P-1): гость в U1 видит ссылку; U0 прячет до входа. P-3 не меняет P-1. Staff видит жалобы после submit авторизованным.

---

## 9. States (сводка)

| Поверхность | L | E | Error | Success |
| --- | --- | --- | --- | --- |
| Queue | skeleton rows | «Очередь пуста» | banner + повтор | — |
| Item | gallery skeleton + полоски staff | 404 «Не найдено» + к очереди | banner | toast + redirect queue |
| Reports | skeleton | «Нет открытых жалоб» | banner | toast «Жалоба закрыта» |
| 403 | — | «Нет доступа» | — | — |
| Approve идемпотентный | — | — | — | toast «Уже опубликовано» |

Нет empty-иллюстраций «команда».

---

## 10. Responsive

| Ширина | Поведение |
| --- | --- |
| **1280** | Основной. Таблица Queue. Item 60/40. Confirm dialogs. |
| **768** | Queue → compact rows 72 (не 8 колонок). Item стек: preview сверху, staff+CTA снизу. Сегменты 36h не скроллятся в 4 пункта. |
| **375** | Имеет смысл для Item/Reject (дежурство). Queue compact — желателен, не в обязательном минимуме заказчика. Reports — desktop. Нет публичного TabBar. |

Приоритет: desktop.

---

## 11. Accessibility

- Контраст text на bg/surface AA (токены P-1).  
- TypeBadge **текстом**, не только цветом. StatusBadge: текст + semantic bg.  
- Focus 2px accent, keyboard: сегменты, строки-ссылки, кнопки, textarea.  
- Одобрить и Отклонить **разный** стиль и подпись, не пара одинаковых primary.  
- Reject: `aria-invalid` + текст причины.  
- Thumb alt: «фото кабинета» / title.  
- Диалоги: focus trap, Esc = отмена.  
- Touch 44 на 375 CTA.  
- Staff контакт не дублировать в public preview (гость/скриншот/пересылка).

---

## 12. spec → UX → UI → P-2 → P-3

| Тема | Spec / UX | P-3 UI |
| --- | --- | --- |
| Admin до Telegram | DEC-09 | Approve confirm объясняет: TG только после published |
| Статусы | §2.6 | Queue фильтр pending по умолчанию |
| Approve / reject+reason | SCR-ADMIN-ITEM, AC | Details + dialogs |
| Нет bulk | UX §2 | нет чекбоксов |
| FIFO | UX §2 | caption + сорт |
| Жалоба не скрывает | DEC-22 | Resolve ≠ unpublish |
| Причина автору | §3.9, AC-Reject | textarea = баннер автора P-1/P-2 |
| Черновик не в очереди | P-2 | Queue только submitted pending |
| Edit published | DEC-21 | снова pending, строка в очереди |
| Контакт гостю | P-1 | в preview гостя нет; staff колонка отдельно |
| Каталог | P-1 Search | только published |
| Create pending | P-2 | «На проверке 24ч» = эта очередь |
| Channel/DM | UX 09 | нет UI рассылки; jobs после approve |
| Users / Stats | U0 P1 | не в P-3 |
| AI / CMS / графики | запрет | нет |

### Расхождения (явно)

| Тема | Было | P-3 | Класс |
| --- | --- | --- | --- |
| Тапы approve | U0: 2 | + confirm dialog | осознанно, U2 brief |
| Тапы reject | U0: 3 | + confirm после причины | осознанно |
| Type filter очереди | нет в UX | не добавляем | — |
| Queue 375 | U0 compact | не в min. наборе заказчика; рекомендуется | P1 Figma |
| Users / Stats | в IA | вне P-3 | P1 продукта позже |
| P-1 «Пожаловаться» гостю | U0 vs U1 | не чиним в P-3 | долг P-1 P1 |

---

## 13. Figma frame inventory (после MCP)

Страница: `U2 — P3 Moderation`. Компоненты P-1: TypeBadge, StatusBadge (если нет — warning/danger chips), ListingCard, compact row, Button, Input/textarea, EmptyState, Error banner. Новые: AdminHeader, StatusSegment 36h, ApproveDialog, RejectPanel.

### Обязательные 1280

| Frame | Что проверяет |
| --- | --- |
| `P3 / Queue / Desktop / 1280` | таблица pending, FIFO, жалобы «—», «Показать ещё» |
| `P3 / Queue Empty / Desktop / 1280` | empty pending |
| `P3 / Details / Desktop / 1280` | 60/40, public preview без контакта, staff @, Одобрить vs Отклонить |
| `P3 / Approve Confirm / Desktop / 1280` | dialog на Details |
| `P3 / Reject / Desktop / 1280` | textarea + enabled danger confirm |
| `P3 / Reject Error / Desktop / 1280` | пустая причина, «Укажите причину для автора» |
| `P3 / Reports / Desktop / 1280` | open list |
| `P3 / Report Details / Desktop / 1280` | объект, resolve, связь на Item |

Queue Loading/Error — **не отдельные маршруты**: полосы skeleton и banner на кадре Queue (можно вторым артбордом `P3 / Queue Error / Desktop / 1280`, если удобнее QA). Не плодить CMS-экраны.

Approve Confirm **не** отдельный URL: overlay на Details.

### Обязательные 375

| Frame | Что проверяет |
| --- | --- |
| `P3 / Details / Mobile / 375` | стек + sticky Одобрить |
| `P3 / Reject / Mobile / 375` | причина + CTA большой палец |

Reject Error 375 можно не дублировать (тот же паттерн, что 1280).

### Рекомендуемые (не блокер закрытия спеки)

| Frame | Зачем |
| --- | --- |
| `P3 / Queue / Mobile / 375` | compact 72, дежурство (U0) |
| `P3 / Forbidden / Desktop / 1280` | 403 |
| `P3 / Queue Published / Desktop / 1280` | фильтр published + unpublish на Item |
| Связка: P-1 Search после approve | опционально, та же карточка P-1 |

### Объединения

| Запрос | Решение |
| --- | --- |
| Create Type-стиль хаба админки | нет хаба: `/admin` → Queue |
| Approve как full page | **диалог** на Details |
| Reject как full page 1280 | панель на Details + отдельные frames Reject / Reject Error для QA |
| Reports empty vs list | empty — состояние Reports, отдельный frame по желанию QA |

Прототип (когда кадры есть):

```text
Queue row → Details → Одобрить → Confirm → Queue (без строки)
Details → Отклонить → (error) → причина → Confirm → Queue
Queue → Reports → Report Details → Item | Resolve → Reports
```

---

## 14. Решения (сводка)

| ID | Решение |
| --- | --- |
| P3-DEC-01 | Nav P-3: Очередь + Жалобы. Users/Stats не макетить. |
| P3-DEC-02 | Нет фильтра типа в очереди. |
| P3-DEC-03 | Approve confirm dialog (расхождение с 2 тапами U0). |
| P3-DEC-04 | Resolve жалобы ≠ снятие с витрины. |
| P3-DEC-05 | Контакт только staff-колонка. Public preview = гость P-1 без CTA. |
| P3-DEC-06 | Unpublish с published Item, не из Reports. |
| P3-DEC-07 | Те же U1 tokens; плотность выше; не новый admin-скин. |
| P3-DEC-08 | Нет UI Telegram-рассылки. |

---

## 15. P0 / P1 / P2

**Статус спеки P-3:** готова к Figma после MCP. Продуктовых блокеров нет.

| Класс | |
| --- | --- |
| **P0 поставки** | Нарисовать inventory §13 в Figma, когда лимит снят. Не обходить MCP. |
| P1 | Queue 375; 403; Users/Block и 7 чисел (U0, не этот этап); StatusBadge если нет в библиотеке P-1 |
| P2 | Queue Error отдельным кадром; связка Search после approve; фильтр типа; 768 отдельными кадрами |

Не начинать implementation planning. Не писать код. U2 закрывается, когда в Figma стоят P-2 (14) и P-3 (этот inventory), затем финальный UI approval.
