# 12 — UI Review

Проверка U1 против U0 и [../24-implementation-spec.md](../24-implementation-spec.md). Код не писался. Figma в репозитории нет — спецификация для макетов.

---

## Visual hierarchy

**Да:** на карточке цена/дата жирнее или равна title по weight; бейдж типа первый в мета. Home — плитки типов главный жест, не мелкий текст. Details — один primary CTA.

Риск: если в макете accent покрасить цену в teal — может спорить с кнопкой. Спека: цена **text + Bold**, не accent fill.

---

## Scanning (2–3 сек)

**Да, если** бейдж читается текстом, район рядом, акцент на третьей строке мета. Фото 4:3 даёт быстрый якорь. Нет автора и сердца в списке — меньше шума.

Чип «Все» отсутствует — список однородный.

---

## Conversion (Contact)

**Да:** гость видит одну большую кнопку «Войти, чтобы написать»; после входа — «Написать в Telegram». Не иконка-привидение. P-1 фиксирует `next`.

---

## Mobile / one hand

TabBar 56, Create центр, sheet снизу, touch 44–48. CTA details в потоке (не обязательный sticky) — осознанный компромисс; длинное описание — минус, для MVP приемлемо.

---

## Consistency

Одна палитра, Manrope, radius 10, 8pt, один accent `#0F5C56`. Админка на тех же токенах, плотнее, не «другой продукт».

---

## MVP discipline

В U1 **нет:** social, matching, favorites, featured, people catalog, Mini App, learning, dashboard-графики на Home, Radar, чип «Все» типов, FAB, stories.

---

## Definition of Done U1

1. Visual direction — [00](00-visual-direction.md)  
2. Foundation / tokens — [01](01-ui-foundation.md)  
3. ListingCard 375/1280 — [02](02-listing-card.md)  
4. Search — [03](03-search-ui.md)  
5. Details — [04](04-listing-details.md)  
6. P-1 — [05](05-prototype-p1.md)  
7. P-2 — [06](06-prototype-p2.md)  
8. P-3 — [07](07-prototype-p3.md)  
9. Home — [08](08-home.md)  
10. Profile — [09](09-profile.md)  
11. States — [10](10-ui-states.md)  
12. Responsive — [11](11-responsive.md)  
13. Этот review  
14. Функции = U0/spec 24  

---

## Пробел до разработки

Нет пиксельных Figma-файлов. Следующий шаг: **собрать макеты по этой спецификации → UI approval → implementation plan → Foundation (E1)**. Не начинать код из этого этапа.

---

## Открытые визуальные мелочи (не scope MVP)

Точный kerning логотипа; кастомные иконки vs набор Lucide-подобных. Можно решить в Figma, не в продукте.
