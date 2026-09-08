# 14 — P-2 Create Flow (pixel UI)

**Этап:** U2 P-2. Не код. Не P-3.  
**Канон:** [../24-implementation-spec.md](../24-implementation-spec.md) §3.7 · [../ux/07-create-listing.md](../ux/07-create-listing.md) · [06-prototype-p2.md](06-prototype-p2.md) · токены [01-ui-foundation.md](01-ui-foundation.md).

**Figma (цель):** тот же файл [Beauty Hub — Pixel UI](https://www.figma.com/design/dDbdGIcFAmXhlOxKS6MuVc), **новая страница** `U2 — P2 Create` (P-1 страницу не смешивать).

**Статус поставки:** P-1 визуально `APPROVED` ([13](13-p1-visual-review.md)). UX/UI P-2 спроектирован ниже. Кадры в Figma **не нарисованы** — Figma MCP Starter исчерпал лимит (~20 вызовов/мес.). Сборка кадров — следующий шаг, как только запись в файл снова доступна. Не заводить второй Figma-файл. Не P-3 и не код.

Прототип P-2 начинается **уже авторизованным**, `profile_completed` (мастер без подсветки типа). Гость Create → Login `next=/create` уже закрыт в P-1.

---

## 1. Решения

| ID | Решение |
| --- | --- |
| P2-DEC-01 | **Create entry = Select type.** Один экран `/create`: заголовок «Создать» + три типа. Отдельный пустой хаб не нужен. |
| P2-DEC-02 | Не wizard. Тип → **один скролл формы** → preview → pending. |
| P2-DEC-03 | Sticky низ mobile только на форме: primary «К просмотру» 48. «Сохранить черновик» — text button accent над primary. Preview: secondary «Назад» + primary «Отправить на проверку». |
| P2-DEC-04 | Preview = вид **гостя в поиске** (ListingCard) + укороченные details **без** контактного CTA. Пояснение: «Так увидят в поиске. Контакт появится после публикации.» |
| P2-DEC-05 | После submit объявление **не** в каталоге. Pending-копирайт spec §3.9. |
| P2-DEC-06 | Роль в прототипе: **мастер** — три типа равны, без accent-обводки. Hint space_owner (обводка Кабинет) — отдельный annotation, не второй happy path. |
| P2-DEC-07 | Фото Space ≥1; Event/Vacancy 0–6, dashed «Можно без фото». |
| P2-DEC-08 | Цена details 18/24 — тот же override P-1, новый токен не заводим. |
| P2-DEC-09 | Desktop: форма max 560 по центру. Preview 1280: колонка 560 (текст+CTA) + карточка 428. |
| P2-DEC-10 | Компоненты P-1: Header, TabBar (Active Create), Input, Select, Button, TypeBadge, SpecChip, ListingCard, ErrorMessage. Новые локальные: PhotoSlot 72, TypeChoice 80h, DirectionSegment, CheckboxRow, StatusBanner warning. |

Нет AI, matching, favorites, ratings, reviews, payments, messenger, feed.

---

## 2. Поток

```text
Tab Create
  → P2 Create Type
    → Space Form → (error?) → Space Preview → Pending
    → Event Form → Event Preview → Pending
    → Vacancy Form → Vacancy Preview → Pending
Черновик ← форма (остаётся draft, не pending)
Назад с Preview → та же форма с данными
```

`next` для гостя: `/create` (не макетить в P-2).

---

## 3. Инвентарь кадров (собрать в Figma)

### 375

| Frame | Содержание |
| --- | --- |
| `P2 / Create Type / Mobile / 375` | Create + выбор типа |
| `P2 / Space Form / Mobile / 375` | валидная форма кабинета |
| `P2 / Space Form Error / Mobile / 375` | нет района, «Укажите район» |
| `P2 / Space Preview / Mobile / 375` | карточка + отправка |
| `P2 / Event Form / Mobile / 375` | форма мероприятия |
| `P2 / Event Preview / Mobile / 375` | превью события |
| `P2 / Vacancy Form / Mobile / 375` | форма вакансии |
| `P2 / Vacancy Preview / Mobile / 375` | превью вакансии |
| `P2 / Pending / Mobile / 375` | успех модерации |

### 1280

| Frame | Содержание |
| --- | --- |
| `P2 / Create Type / Desktop / 1280` | те же 3 блока, колонка 560 |
| `P2 / Space Form / Desktop / 1280` | форма 560 |
| `P2 / Space Preview / Desktop / 1280` | 560 + ListingCard 428 |
| `P2 / Event Form / Desktop / 1280` | форма 560 |
| `P2 / Event Preview / Desktop / 1280` | как Space Preview, карточка Event |
| `P2 / Vacancy Form / Desktop / 1280` | форма 560 |
| `P2 / Vacancy Preview / Desktop / 1280` | карточка Vacancy |
| `P2 / Pending / Desktop / 1280` | колонка 560 |

Event/Vacancy error не дублировать: паттерн показан на Space Form Error.

Опционально (не блокер): `P2 / My Pending / Mobile / 375` — compact + StatusBadge «На проверке» (F6).

---

## 4. Create Type (`/create`)

Header 52: Beauty Hub (как P-1) **или** title «Создать» — **решение:** title `type.title` «Создать», без второго логотипа (как Search). TabBar Active=Создать.

Pad 16. Caption 13 muted: «Карточка попадёт в каталог только после проверки. Обычно в течение 24 часов.»

Три ряда **80h**, radius 10, surface, border, pad 16, title 16 Semibold + caption 13 muted, chevron 20 muted справа. Gap 12.

| Тип | Title | Caption |
| --- | --- | --- |
| Space | Кабинет | Сдать место или кресло |
| Event | Мероприятие | Мастер-класс, дата и тема |
| Vacancy | Вакансия | Ищу мастера или ищу работу |

Под вакансией caption ещё раз не дублировать — hint уже в блоке. Четвёртого типа нет.

Hit ≥44. Pressed opacity 0.92.

Desktop: Header 64, контент 560 center, те же 80h блоки на всю колонку, без TabBar.

---

## 5. Общий chrome формы

**375:** Header 52: Back 44 + title («Новый кабинет» / «Новое мероприятие» / «Новая вакансия»). Body pad 16, gap 16. Низ pad 16: text «Сохранить черновик» → primary «К просмотру» 48. TabBar Create. `padding-bottom` контента чтобы CTA не прятался под таббар (56+8).

**1280:** Header. Колонка 560 center. Кнопки в конце скролла, не sticky. Button desktop 44.

Лейбл caption 13 muted над полем. `*` у обязательных в лейбле: «Заголовок *». Ошибка: border danger 1 + caption danger под полем (не только цвет).

---

## 6. Space Form

Порядок (UX §3 + spec §3.7):

1. **Фото *** — ряд 72×72 gap 8, radius 8. Слот «+» dashed `border`, caption «Добавить». Счётчик caption «1 / 6». В валидном кадре: одно превью geometry (как P-1 media) + add. Upload loading: muted pulse на слоте.  
2. **Заголовок *** — Input, value «Кабинет 14 м² у Садовой», счётчик 80 не обязателен в MVP-макете.  
3. **Описание *** — textarea 120h min, radius 10, те же токены Input, body 15. Текст: «Светлый кабинет в центре, отдельный вход, мойка. Подходит для nail и brow.»  
4. **Район *** — Select, «Ворошиловский». Caption hint: «ЗЖМ обычно Советский, Северный — Первомайский.»  
5. **Специализации *** ≥1 — wrap chips seed: Барбер, Парикмахер, **Маникюр / педикюр** (selected accentSubtle+accent border), **Брови** selected, Ресницы, Визаж, Косметология. Height 40, pad 14, radius 10 (SearchTypeChip).  
6. **Цена * + период *** — row gap 12: Input число «18000» FILL + Select период «месяц» width ~140. Подпись периода: месяц / смена / час.  
7. **Площадь** опц. — Input «14», suffix caption «м²» в поле или лейбл.  
8. **Вид места** опц. — Select: кабинет / кресло / коворкинг / другое → «Кабинет в салоне».  
9. **Контакт** — Input Telegram предзаполнен `@anna`, caption «С профиля, можно изменить». Не телефон обязательным.

Error-кадр: район пустой «Выберите район», border danger, «Укажите район». Остальное заполнено. CTA не loading.

---

## 7. Event Form

Фото 0–6: пустой dashed 72 + «Можно без фото».

1. Заголовок * «Мастер-класс по бровям»  
2. Описание *  
3. **Дата и время начала *** — контрол 48h, «25 сен 2026, 18:00» (не в прошлом). Caption: «Дата в прошлом не публикуется.»  
4. Район *  
5. Адрес опц. Input «ул. Садовая, 12»  
6. Специализации * (brow selected)  
7. Цена: CheckboxRow 48h «Бесплатно» off; рядом Input «2500». Если on — инпут hidden, accent meta «Бесплатно».  
8. Места (capacity) опц. Input число  
9. **Ссылка на регистрацию** опц. Input URL  
10. Контакт `@anna`

---

## 8. Vacancy Form

Фото опц. dashed «Можно без фото».

1. Заголовок * «Ищу мастера маникюра»  
2. Описание *  
3. Район *  
4. Специализации * мульти (nail selected)  
5. **Тип предложения *** — DirectionSegment 48h, 2 слота, radius 10: «Ищу мастера» selected | «Ищу работу». Не путать с чипом типов каталога.  
6. **Формат** опц. Select: аренда / найм / процент / другое → «Найм»  
7. Контакт `@anna`

---

## 9. Preview

Заголовок экрана «Так увидят в поиске». Caption: «В каталоге карточка появится после проверки. Контакт гости не видят, пока объявление не опубликовано.»

ListingCard (тот же компонент P-1):

- Space: Кабинет, Ворошиловский, 14 м² у Садовой, 18 000 ₽ / месяц, nail+brow  
- Event: Мероприятие, дата 25 сен · 18:00, brow  
- Vacancy: Вакансия, Ищу мастера, nail  

Ниже 1 абзац description body + факты (площадь / дата / direction) без блока автора-CTA.

Кнопки: Secondary «Назад» · Primary «Отправить на проверку». Submit → кнопка «Отправка» disabled + spinner (один кадр не обязателен; на Pending уже success).

Desktop: слева этот текст+кнопки 560, справа карточка 428 «Предпросмотр».

---

## 10. Pending

Иконка 32 linear muted (квадрат+галка линейная, не конфетти).  
Title 20: «Отправлено на проверку»  
Body 15 muted: «Обычно в течение 24 часов. В каталоге появится после одобрения.»  
Primary «Мои объявления» → Profile (P-3/Profile не макетить, hotspot annotation).  
Secondary «На главную».

Нет «Опубликовано». Нет шаринга.

---

## 11. Prototype (когда кадры в Figma)

```text
Create Type → Space Form → Preview → Pending
Create Type → Event Form → Preview → Pending
Create Type → Vacancy Form → Preview → Pending
Space Form Error: «К просмотру» остаётся на error (не Preview)
Preview «Назад» → Form
Pending «На главную» → P-1 Home (существующий кадр, не копия)
```

---

## 12. Проверка spec → UX → UI

| Тема | Статус |
| --- | --- |
| 3 типа, нет 4-го | Да |
| Space фото ≥1, Event/Vacancy опц. | Да |
| Обязательные поля §3.7 | Да |
| Мульти-специализации vacancy | Да (как Space) |
| Direction vacancy | Segmented 48 |
| Бесплатно Event скрывает цену | Да |
| Черновик ≠ модерация | Text button, не pending |
| Preview без контакта | Да |
| Pending 24ч, не public | Да |
| Токены P-1 / U1 | Те же, без новых цветов |
| Touch 44/48 | Да |
| Responsive 375 + 1280 | Да; 768 не обязателен |
| MVP scope | Без banned-функций |

### Расхождения (не чинить молча)

| Тема | Спека | Это P-2 | Класс |
| --- | --- | --- | --- |
| Create vs Select Type | два имени в ТЗ U2 | один экран `/create` (U0/U1) | не блокер |
| Sticky CTA | U1: «не обязательно sticky» | sticky низ формы mobile | P2, удобство большого пальца |
| Figma кадры | обязательны | не нарисованы (MCP quota) | **P0 поставки** |
| Мои pending compact | F6 опционально | не в мин. наборе | P1 |
| space_owner hint обводка | UX Create | не в happy path мастера | P2 |

---

## 13. P0 / P1 / blockers

**Blocker продукта (логика Create):** нет — поток и поля согласованы с U0/U1/spec 24.

**P0 поставки:** собрать перечисленные frames на странице `U2 — P2 Create` в существующем файле, когда Figma MCP снова доступен. Без этого кликабельный P-2 в Figma отсутствует.

**P1:** иконки таббара (долг P-1); кадр compact «Мои / На проверке»; hint обводки для space_owner; состояние upload progress на фото.

**P2:** 768; полный date-picker native vs stylized 48h field; лимит 80 символов на title в UI.

Не переходить к P-3 и к коду, пока P-2 кадры не стоят в Figma **или** продукт явно не примет этот документ как временный суррогат (не рекомендуется: U2 = реальные frames).
