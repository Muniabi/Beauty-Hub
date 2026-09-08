# 10 — Design System (правила UI)

Не CSS и не React. Семантика для Figma variables и последующей вёрстки. Канон токенов: spec §3.3.

---

## 1. Характер

Спокойный профессиональный инструмент. Нейтральный фон, один accent. Не Instagram, не «бьюти-гламур», не кричащий classified.

**Не использовать:** розовые градиенты «салон», stories-рамки, decorative illustrations комьюнити.

---

## 2. Цвет (семантика)

| Token | Роль |
| --- | --- |
| `color.bg` | фон страницы |
| `color.surface` | карточка, sheet, шапка |
| `color.text` | основной текст |
| `color.textMuted` | район, подписи |
| `color.accent` | CTA primary, ссылки, активный чип |
| `color.accentText` | текст на accent |
| `color.border` | линии, чипы |
| `color.success` | published / успех |
| `color.warning` | pending |
| `color.danger` | reject, удаление, ошибка |

Бейджи типов: разные **иконка+подпись**, цвет вторичен (a11y). Кабинет / Мероприятие / Вакансия не кодировать одним лишь оттенком.

Контраст текста к фону ориентир **WCAG AA** (4.5:1 body).

---

## 3. Типографика

| Роль | Использование |
| --- | --- |
| Screen title | Home hero, заголовок поиска |
| Card title | ListingCard, 16–18 logical |
| Accent meta | цена / дата — чуть жирнее body |
| Body | описание |
| Caption | район, «сначала новые» |
| Button | CTA |

Один гротеск. Иерархия размером и weight, не тремя шрифтами.

---

## 4. Spacing и сетка

База **8pt**. Экран mobile padding 16. Зазор карточек 12–16. Макс. ширина контента desktop ~1120, шапка на всю.

---

## 5. Радиус и тень

Карточка: небольшой радиус (8–12). Тень слабая или только border. Sheet — радиус сверху.

---

## 6. Компоненты

### Button

- Primary: accent, одна на экран-смысл.
- Secondary: outline.
- Danger: удаление, отклонение.
- Состояния: default, pressed, disabled, loading (spinner в кнопке, текст «Отправка»).
- Мин. высота 44px mobile.

### Input / Textarea / Select

Лейбл сверху, не placeholder-как-лейбл. Ошибка — текст под полем + `color.danger`, aria-invalid.

### Checkbox / Toggle

Тоглы уведомлений — подпись слева, toggle справа (нативный паттерн iOS/Android).

### Chips / Tabs типа

Выбран: заливка accent или жирная обводка + не только цвет. Невыбран: border.

### Badge типа и StatusBadge

pending «На проверке», published не показывать в public списке, rejected «Отклонено», expired «Неактуально».

### Cards

ListingCard — [03](03-listing-card.md).

### Dialogs / Sheets

Фильтры — sheet снизу mobile. Confirm удаления аккаунта — dialog. Focus trap, закрытие по overlay.

### Dropdown

Нативный select районов на mobile. Desktop — select или combobox простой.

### Toasts

Коротко сверху/снизу: «Жалоба отправлена», «Сохранено». Не для ошибок формы (они у полей).

### Navigation

TabBar 4 слота, иконка+подпись, активный пункт явно. Header desktop — текст, не только иконки.

### Empty / Loading / Error

EmptyState: короткий текст + 1–2 CTA, без иллюстрации-обязаловки.  
Loading: SkeletonCard, не полноэкранный спиннер >300ms без скелетона.  
Error: ErrorBanner + Повторить.

---

## 7. Иконки

Простой линейный набор. Таббар: home, search, plus, user. Тип объявления: можно без иконки, только текст бейджа, если спорно читается.

---

## 8. Motion

Минимум: sheet выезд, без параллакса и hero-видео.
