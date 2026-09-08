# 04 — Listing Details (страница объявления)

**UX:** [../ux/03-listing-card.md](../ux/03-listing-card.md) §4 · [../ux/05-auth-contact-flow.md](../ux/05-auth-contact-flow.md)

Автор впервые здесь, не в ListingCard списка.

---

## 1. Mobile 375

```text
┌ Header 52: [←]  пусто или «»  ┐  таббар не active
│ Gallery 375 × 281 (4:3)       │  свайп, dots 6 max, фон muted
├ pad 16 ─────────────────────┤
│ [Кабинет]  Ворошиловский      │
│ Title type.title 20/26        │
│ 18 000 ₽ / месяц  accentMeta  │  18/24 bold на details
│ [nail] [brow] …               │
│ ─ hairline 24v ─              │
│ Описание  body                │
│ Факты: площадь, вид места     │  caption + bodyStrong пары
│ ─ hairline ─                  │
│ Автор                         │  avatar 40×40 radius 8 muted
│ Имя bodyStrong                │  роль caption
│ ─ ─                           │
│ [ Войти, чтобы написать ] 48  │  гость
│ Жалоба caption link auth      │
└ tabbar ─┘
```

Галерея: без фото — плашка 281h + бейдж. Счётчик «2 / 4» caption в углу surface 8px pad.

Назад: шеврон 24, hit 44, возвращает Search с query.

---

## 2. Desktop 1280

Две колонки: галерея 640 (4:3) | мета 456. Gap 40. Автор и CTA в правой колонке sticky top 80.

CTA ширина колонки, не крошечная ссылка.

---

## 3. Блок автора

```text
┌ surfaceMuted radius 10 pad 12 ─┐
│ [фото 40]  Анна К.              │
│            Салон или помещение  │  роль, не телефон
└─────────────────────────────────┘
```

Нет «написать» внутри блока — только общий CTA ниже (один primary).

---

## 4. Contact CTA

| Роль | Кнопка | Стиль |
| --- | --- | --- |
| Гость | Войти, чтобы написать | primary full width |
| Auth | Написать в Telegram | primary |
| Auth + phone | Позвонить | secondary под primary, 48h |
| Event + url | Регистрация | secondary; не заменяет контакт если контакт нужен |
| Expired | нет контакта; «К поиску» secondary | |

Гость: телефон и @ не в DOM текстом.

---

## 5. Специфичные блоки

**Space:** площадь, вид места — список dl, caption / body.  
**Event:** дата крупно, адрес, места (информативно), ссылка регистрация.  
**Vacancy:** direction как accent строка; формат занятости body.

---

## 6. ModerationBanner (автор)

Полная ширина warningBg / dangerBg, pad 12, radius 10, до галереи или сразу после header. Pending: «На проверке. Обычно в течение 24 часов.» Rejected: причина.

---

## 7. States

| State | UI |
| --- | --- |
| Loading | gallery skeleton 281 + 4 полоски |
| Guest | CTA войти |
| Auth | CTA telegram |
| Expired | без галереи акцента контакта; title muted + «Объявление неактуально» + К поиску |
| 404 | empty «Не найдено» + на поиск |
| Forbidden draft | как 404 для чужого |

Жалоба: модалка surface, radio причин, Отмена / Отправить.

---

## 8. Typography details

Title 20 mobile / 24 desktop. Цена 18–20 Bold. Описание 15/22. Не уменьшать цену относительно title.
