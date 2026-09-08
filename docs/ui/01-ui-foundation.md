# 01 — UI Foundation (основа визуальной системы)

Токены для Figma variables / позже кода. **Не CSS.**  
Наследует [00-visual-direction.md](00-visual-direction.md).

Имена токенов = канон. Значения — конкретные, чтобы макет не «примерно серый».

---

## 1. Colors

Светлая тема MVP. Hex sRGB.

### Brand / surface

| Token | Hex | Назначение |
| --- | --- | --- |
| `color.bg` | `#F4F1EB` | фон страницы |
| `color.surface` | `#FFFcf8` | карточка, шапка, таббар, инпут |
| `color.surfaceMuted` | `#EBE6DC` | плашка без фото, skeleton, бейдж типа |
| `color.text` | `#1C1917` | основной текст |
| `color.textMuted` | `#6B635B` | район, caption, лейбл |
| `color.accent` | `#0F5C56` | CTA, активный чип, ссылки, активный таб |
| `color.accentText` | `#F7F4EE` | текст на accent |
| `color.accentSubtle` | `#D5E8E5` | слабый фон выбранного чипа |
| `color.border` | `#D9D2C8` | линии карточек, инпуты |
| `color.borderStrong` | `#B7AFA4` | hover desktop card |
| `color.overlay` | `#1C191766` | backdrop sheet (40%) |

### Semantic

| Token | Hex | Текст на нём |
| --- | --- | --- |
| `color.success` | `#1F7A4D` | бейдж published (админ/мои) |
| `color.successBg` | `#E5F3EB` | фон бейджа |
| `color.warning` | `#A16207` | pending |
| `color.warningBg` | `#F8EED9` | |
| `color.danger` | `#B42318` | ошибка, reject, удаление |
| `color.dangerBg` | `#FCEBEA` | |
| `color.focus` | `#0F5C56` | кольцо фокуса 2px |

Проверка: `text` на `bg` и `text` на `surface` — AA. `accentText` на `accent` — AA.

Типы объявлений **не** получают отдельные brand-цвета.

---

## 2. Typography scale

Семейство: **Manrope**. Fallback макета: Inter.

| Token | Size | Line | Weight | Tracking | Где |
| --- | --- | --- | --- | --- | --- |
| `type.display` | 28 | 34 | 700 | −0.02em | Home hero mobile |
| `type.displayLg` | 36 | 42 | 700 | −0.02em | Home hero desktop |
| `type.title` | 20 | 26 | 600 | −0.01em | заголовок экрана Search, details title |
| `type.titleLg` | 24 | 30 | 600 | −0.01em | details desktop |
| `type.cardTitle` | 16 | 22 | 600 | 0 | ListingCard |
| `type.accentMeta` | 16 | 22 | 700 | 0 | цена / дата на карточке |
| `type.body` | 15 | 22 | 400 | 0 | описание, формы |
| `type.bodyStrong` | 15 | 22 | 600 | 0 | имя автора |
| `type.caption` | 13 | 18 | 500 | 0 | район в строке с бейджем, «сначала новые» |
| `type.badge` | 12 | 16 | 600 | 0.02em | бейдж типа/статуса |
| `type.button` | 16 | 20 | 600 | 0 | кнопки |
| `type.tab` | 11 | 14 | 500 | 0 | подпись таббара |
| `type.nav` | 15 | 20 | 500 | 0 | desktop header |

Цена: не уменьшать относительно `cardTitle`. Tabular nums если есть в начертании.

---

## 3. Spacing scale

База 8.

`space.2=2` `space.4=4` `space.8=8` `space.12=12` `space.16=16` `space.20=20` `space.24=24` `space.32=32` `space.40=40` `space.48=48` `space.56=56` `space.64=64`

| Применение | Token |
| --- | --- |
| Поля экрана mobile | 16 |
| Поля экрана desktop контент | 24, max width 1120 |
| Зазор карточек списка | 12 |
| Внутренний паддинг карточки | 12 |
| Зазор полей формы | 16 |
| Отступ таббара от контента | 8 + 56 + safe area |

---

## 4. Radii

| Token | px |
| --- | --- |
| `radius.badge` | 6 |
| `radius.control` | 10 |
| `radius.card` | 10 |
| `radius.sheet` | 16 |
| `radius.avatar` | 8 |

---

## 5. Elevation

| Token | Правило |
| --- | --- |
| `elevation.none` | карточка списка, инпут |
| `elevation.sheet` | y: −8, blur 24, color `#1C19171A` |
| `elevation.dialog` | y: 8, blur 32, `#1C191724` |

---

## 6. Borders

| Token | Значение |
| --- | --- |
| `border.default` | 1px `color.border` |
| `border.focus` | 2px `color.accent` |
| `border.hairline` | 1px верх/низ таббара и шапки |

---

## 7. Icon sizes

| Token | px | Где |
| --- | --- | --- |
| `icon.sm` | 16 | внутри бейджа опционально |
| `icon.md` | 20 | инпут, secondary |
| `icon.lg` | 24 | таббар, Create |
| `icon.xl` | 32 | empty state (одна простая) |

Stroke 1.75–2.

---

## 8. Button / input heights / touch

| Token | Mobile | Desktop |
| --- | --- | --- |
| `size.button` | 48 | 44 |
| `size.buttonSm` | 40 | 36 | чипы типа, «Показать ещё» |
| `size.input` | 48 | 44 |
| `size.tabbar` | 56 + safe-area-inset-bottom | — |
| `size.header` | 52 | 64 |
| `size.touchMin` | 44 | 44 |

Чип типа: высота 40, горизонтальный padding 14. Не меньше touch.

---

## 9. Breakpoints

| Token | px |
| --- | --- |
| `bp.mobile` | 375–767 |
| `bp.tablet` | 768–1023 |
| `bp.desktop` | ≥1024 |
| Макеты обязательные | **375**, **1280** |
| Макет желательный | 768 |

Контентная колонка desktop: 1120 по центру. Шапка на всю ширину `surface`.

---

## 10. Z-order (логические слои)

Контент 0 → шапка/таббар 10 → overlay 20 → sheet 30 → dialog 40 → toast 50.

---

## 11. Motion (спека, не код)

Duration 120–180ms, easing standard. Sheet: translateY. Без параллакса.
