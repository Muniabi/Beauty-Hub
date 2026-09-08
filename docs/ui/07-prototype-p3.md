# 07 — Prototype P-3 (модерация)

**UX:** [../ux/08-moderation.md](../ux/08-moderation.md)

```text
Admin → Queue → Listing → Approve / Reject
```

Плотный утилитарный UI, **те же токены**, меньше воздуха. Не фиолетовый enterprise, не отдельный «админ-скин». Фон тот же `bg`.

Макеты: **1280 основной**, 375 compact очередь.

---

## F1 — Queue 1280

Шапка admin: «Очередь» + фильтр сегмент pending | published | rejected (height 36).

Таблица/список:

| 72 thumb | Тип бейдж | Заголовок 1 строка | Автор | «2 ч назад» | Жалобы | → |
| --- | --- | --- | --- | --- | --- | --- |

Высота ряда 72, hairline между, hover surfaceMuted. Клик → F2.

Empty pending: «Очередь пуста» по центру, без иллюстраций.

---

## F2 — Item

Лево 60%: галерея + поля как details (read-only).  
Право 40% sticky: автор, telegram username как текст (staff), роль, дата, список жалоб.

Кнопки:
- Одобрить — primary 48 full ширины колонки
- Отклонить — secondary danger outline

Reject раскрывает textarea 96h «Причина для автора» + «Отклонить» disabled пока пусто.

---

## F3 — После approve

Toast 48h снизу «Опубликовано» 2с. Возврат F1 без этой строки.

Опциональный кадр: Search гостя с новой карточкой — для связки P-3 с витриной.

---

## F4 — Reject filled

Авторский Profile: compact + danger badge + причина в caption.

---

## F5 — 403

Не admin: «Нет доступа», secondary на Home. Без меню очереди.

---

## Mobile admin

Compact rows [02 compact](02-listing-card.md). Item — стек: превью, мета, кнопки снизу sticky над safe area (одобрить легко большим пальцем).
