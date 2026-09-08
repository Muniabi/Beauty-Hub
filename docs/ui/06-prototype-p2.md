# 06 — Prototype P-2 (создание объявления)

**UX:** [../ux/07-create-listing.md](../ux/07-create-listing.md)

```text
Create → Select type → Form → Preview → Submit → Pending
```

Три ветки: Space, Event, Vacancy. Chrome одинаковый, поля разные.

Гость: Create → Login `next=/create` → онбординг при необходимости → Select type. В прототипе P-2 начинать **уже авторизованным** с completed profile (иначе дубль P-1).

---

## Общий chrome формы mobile

Header 52: ← Назад · «Новый кабинет» (заголовок типа).  
Контент pad 16, gap полей 16.  
Низ: не обязательно sticky; последняя кнопка «К просмотру» 48 primary full width.

---

## F1 — Select type `/create`

Три блока height 80, radius 10, border, title 16 Semibold + caption 13:

1. Кабинет — «Сдать место или кресло»
2. Мероприятие — «Мастер-класс, дата и тема»
3. Вакансия — «Ищу мастера или ищу работу»

Для space_owner — лёгкая обводка accent на «Кабинет» как hint, не автовыбор.

---

## F2a — Form Space

Порядок полей как UX §3. Фото: ряд превью 72×72 + кнопка «Добавить» 72 dashed border. Счётчик «1 / 6».

Цена + период: инпут число | select период в одну row (инпут flex 1).

---

## F2b — Form Event

Дата-время: нативный контрол, высота 48. Чекбокс «Бесплатно» скрывает сумму. URL — один input, лейбл «Ссылка на регистрацию».

Фото опционально — пустой dashed блок «Можно без фото».

---

## F2c — Form Vacancy

Segmented control direction 48h два слота (как чипы). Select формат занятости.

---

## F3 — Preview

Заголовок «Так увидят в поиске». Карточка как ListingCard + укороченные details без CTA контакта (ещё не published).  
Кнопки: «Назад» secondary · «Отправить на проверку» primary.

---

## F4 — Validation error

Тот же F2, поле без района: border danger, текст «Укажите район». Скролл к первому error. Кнопка не loading.

---

## F5 — Pending success

Иконка 32, title «Отправлено на проверку», body «Обычно в течение 24 часов. В каталоге появится после одобрения.»  
Primary «Мои объявления» → Profile. Secondary «На главную».

---

## F6 — Мои: pending (после P-2)

Compact card + StatusBadge warning «На проверке». Не в public search (кадр Search без этой карточки — опционально показать для ясности).

---

## Desktop

Форма max-width 560 по центру. Превью — карточка 428 как в сетке каталога, рядом текст «Предпросмотр».
