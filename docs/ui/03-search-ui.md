# 03 — Search UI

**UX:** [../ux/04-search.md](../ux/04-search.md)  
**Карточка:** [02-listing-card.md](02-listing-card.md)

Задача: быстро просмотреть много предложений одного типа.

Нет чипа «Все» (смесь типов). Нет карты. Нет infinite scroll.

---

## 1. Mobile 375

**Высота chrome:** header 52 + контент + tabbar 56+safe.

### Header экрана

Не второй логотип. Слева заголовок `type.title`: «Кабинеты» / «Мероприятия» / «Вакансии» (меняется с чипом). Справа ничего.

### Под шапкой (sticky опционально)

Решение U1: **чипы + поиск sticky** под header, фон `surface`, нижний hairline. Список скроллится под ними.

```text
[ Кабинеты ] [ Мероприятия ] [ Вакансии ]   height 40, gap 8, горизонтально без скролла (3 чипа влезают)
[ 🔍  Название                    ]         height 48, full width, padding 16
[ Фильтры ]  caption «Сначала новые»        кнопка secondary 40h; caption справа muted
```

Чип выбран: bg `accentSubtle`, text `accent`, border accent 1.  
Чип нет: surface, border default, text.

Поле поиска: иконка 20 muted слева, placeholder «Название».

Кнопка «Фильтры»: если N>0 — точка 8px accent на кнопке или подпись «Фильтры · 2».

### Список

Padding 16. Карточки [02](02-listing-card.md). Gap 12.

### Показать ещё

Кнопка secondary full width, height 48, margin 16/24, текст «Показать ещё». Не спиннер автозагрузки.

---

## 2. Filter sheet (mobile)

Выезд снизу, radius 16 верх, `elevation.sheet`, max height 85vh.

Шапка sheet: «Фильтры» + закрыть 44×44.  
Контент: лейбл+select район; лейбл+select специализация (опция «Все направления»); поля типа (цена от–до в два инпута 48h; дата; direction чипы).  
Низ sticky sheet: [ Сбросить ] secondary | [ Показать ] primary, height 48, padding 16, над home indicator.

---

## 3. Desktop 1280

Header сайта 64. Контент 1120.

```text
Заголовок «Кабинеты» + поле Название width 320 справа
Чипы типа
┌ FilterBar 240 ┐  gap 24  ┌ карточка ┐ ┌ карточка ┐
│ Район         │          │          │ │          │
│ Специализация │          └──────────┘ └──────────┘
│ Цена от–до    │          «Показать ещё» по центру колонок
│ [Сбросить]    │
└───────────────┘
```

FilterBar: поверхность bg (не карточка с тенью), sticky top 80. Инпуты 44h.

---

## 4. Vacancy extra

Под чипами типа — ряд direction: «Все» (внутри вакансий) | Ищу мастера | Ищу работу. Высота 36, не путать с глобальным «Все» типов.

---

## 5. Состояния экрана

| State | Макет |
| --- | --- |
| Loading | sticky-хром на месте; 3 skeleton cards |
| Empty seed | иконка 32 + текст spec + primary «Добавить карточку» (create/login) |
| Zero results | текст spec + primary «Сбросить фильтры» + secondary «Уведомления» если auth |
| Error | banner dangerBg full width под хромом + «Повторить» |
| Results | список |

Empty и zero **разные** тексты (U0). Не подставлять карточки другого типа.

---

## 6. Spacing summary mobile

16 screen · 8 below header to chips · 12 chips to search · 12 search to filter row · 16 to first card.
