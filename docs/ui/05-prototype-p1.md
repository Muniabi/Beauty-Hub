# 05 — Prototype P-1 (гость → контакт)

**Поток UX:** [../ux/05-auth-contact-flow.md](../ux/05-auth-contact-flow.md) · AC-P1 в [../ux/02-user-flows.md](../ux/02-user-flows.md)

Визуальные кадры для кликабельного прототипа (Figma later). **`next` не теряется.**

```text
Guest → Home/Search → Listing → Contact → Login → Telegram → Return via next → Same listing → Contact
```

---

## Кадры (mobile 375, дубли desktop 1280 ключевые)

### F1 — Home (гость)

Макет [08-home.md](08-home.md). Тап плитки «Кабинеты».

### F2 — Search type=space

[03-search-ui.md](03-search-ui.md), 2–3 карточки. Тап карточки.

### F3 — Listing guest

[04-listing-details.md](04-listing-details.md). CTA **«Войти, чтобы написать»**. Контакта в вёрстке нет.

### F4 — Login

Фон `bg`. Карточка по центру (desktop) / полный экран (mobile).

- Назад ← ведёт на **ту же** listing (next уже в URL, назад = listing без сессии).
- Заголовок `title`: «Войти через Telegram»
- Подзаголовок caption: «Чтобы написать автору объявления»
- Слот виджета Telegram: рамка 48h+ placeholder «Telegram Login» (в макете — серый блок 280×48, не фейковый скрин мессенджера)
- Legal caption + ссылки
- **В прототипе URL кадра:** `/login?next=/listings/{id}` — подпись мелким моно на артборде для разработчика

Ошибка входа: отдельный кадр F4b — текст danger + «Попробовать снова», next тот же.

### F5 — Onboarding role (только первый вход)

Три крупные выбора height 72, radius 10, border; выбран accentSubtle. Кнопка «Далее» disabled пока нет выбора.  
Query: `?next=/listings/{id}` в подписи кадра.

### F6 — Onboarding profile

Поля имя, Telegram. Далее.

### F7 — Onboarding notify (можно skip)

Три toggle default off. «Настроить позже» text button accent. Skip и Сохранить → **listing id**.

### F8 — Same listing auth

Тот же F3, но CTA **«Написать в Telegram»** primary. Secondary «Позвонить» если в данных прототипа есть phone.

Hotspot: Telegram CTA (внешний). Для прототипа — кадр F9 «заглушка: открывается Telegram» не обязателен.

---

## Правила next

| Шаг | next |
| --- | --- |
| F3 → F4 | `/listings/{id}` |
| F4 → F5–F7 | тот же, query на каждом onboarding URL |
| F7 → F8 | редирект path = next |
| Повторный пользователь | F4 → F8, без F5–F7 |

Если next пустой — `/` (не использовать в P-1 happy path).

---

## Desktop отличия P-1

Login — модальное окно 400px по центру **не делать** (решение U0: полная страница). Страница login max-width 400 по центру на bg.

Listing desktop — CTA в правой колонке, переход на login той же вкладке.

---

## Что проверить в прототипе

1. После «Назад» на login снова F3, не Home.  
2. После входа URL карточки тот же id.  
3. Нет экрана «успех! теперь найдите объявление снова».
