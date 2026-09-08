# 10 — UI States (состояния)

Токены [01](01-ui-foundation.md). Ключевые компоненты и экраны.

---

## Loading / Skeleton

- Pulse: `surfaceMuted` ↔ чуть светлее, 1.2s, без текста.
- ListingCard: фото-блок 4:3 + 3 полоски width 80%/60%/40%.
- Search: хром (чипы, поле) **не** скелетон — только список.
- Details: gallery 4:3 + полоски.
- Кнопка: spinner 20 на accentText, подпись «Отправка», disabled.

---

## Empty

Иконка 32 linear muted, title 16, body 15 muted, 1–2 кнопки.  
Тексты из spec §3.9 / UX. Без стоковых иллюстраций.

---

## Zero results (Search)

Отличается от empty seed. Primary «Сбросить фильтры».

---

## Error

Banner: bg `dangerBg`, text `danger`, иконка 20, «Повторить» text button. Полная ширина под header. Не modal на сетевой сбой списка.

---

## Success

Pending-экран P-2. Toast: surface, border, 48h, caption 15, 2s (жалоба, сохранение тогглов). Не конфетти.

---

## Unauthorized

Не отдельный «401 экран» на каталоге. Create/Profile/Contact → Login.  
API contact 401: вернуть вид CTA гостя.

---

## Forbidden

Админ 403: title «Нет доступа», secondary Home. Без утечки очереди.

---

## Expired

Details: без CTA контакта; caption danger/muted «Объявление неактуально»; secondary «К поиску». Список public не содержит.

---

## Validation

Поле: border danger 1–2px, текст 13 danger под полем, `aria-invalid`. Первое ошибка — в зоне видимости. Не toast вместо полей.

---

## Pending / Rejected

Badge warningBg / dangerBg. Баннер на details автора. Каталог гостя не показывает pending.

---

## Telegram login error

Текст 15 danger на странице login, next сохранён, кнопка retry.

---

## Disabled

Кнопка 40% opacity, не менять цвет на серый хаос. Toggle off: track border.
