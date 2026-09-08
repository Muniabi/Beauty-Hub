# 00 — UX Blueprint (инвентарь и решения U0)

**Этап:** U0 UX/UI  
**Канон продукта:** [../24-implementation-spec.md](../24-implementation-spec.md)  
**Связано:** [01 — IA](01-information-architecture.md) · [02 — Flows](02-user-flows.md) · [12 — Review](12-ux-review.md)

Код не входит в U0. Макеты Figma — следующий этап после этой документации.

**Принцип проверки каждого экрана:** за 2–3 секунды понять тип, район и цену/дату; затем быстро связаться с автором.

---

## 1. UX-решения vs запрос U0 vs spec 24

Не молчаливое изменение спецификации. Ниже — явные решения.

| ID | Тема | Запрос U0 | Spec 24 | Решение U0 |
| --- | --- | --- | --- | --- |
| UX-DEC-01 | Чип «Все» | категории Все / Помещения / … | TypeChips: Кабинеты / Мероприятия / Вакансии, дефолт Кабинеты (DEC-10) | **Нет смешанного «Все».** Смесь типов ломает сканирование. Desktop-меню уже ведёт в пресеты. |
| UX-DEC-02 | Favorite | «если входит в MVP» | Won't / P1 | **Нет сердца/избранного** на карточке и странице |
| UX-DEC-03 | Featured | «только если нужно» | нет | **Нет** featured-карточки |
| UX-DEC-04 | Search input | нужен | PRD `q`, в §3.8 слабо | **Одно поле** «Название» (поиск по заголовку). Район — фильтр, не строка поиска |
| UX-DEC-05 | Pagination | pagination / infinite | не заморожено | **Кнопка «Показать ещё»**, не infinite scroll. Страницы 1,2,3 не делать |
| UX-DEC-06 | Автор в списке | — | карточка списка: фото, бейдж, title, район, цена/дата, спец. | Автор **только на странице** карточки |
| UX-DEC-07 | Раскладка списка mobile | — | — | Карточка **вертикальная**: фото сверху, мета снизу, одна колонка |
| UX-DEC-08 | Возврат после логина | сохранить context | P-1 | `?next=` абсолютный путь карточки или create. После онбординга — тот же `next`, не Home |
| UX-DEC-09 | Чип «Помещения» vs «Кабинеты» | «Помещения» | UI: «Кабинет» / «Кабинеты» | Подписи **Кабинеты / Мероприятия / Вакансии** как в spec |

`DECISION REQUIRED` (не блокер макетов): нумерация страниц вместо «Показать ещё», если Product настоятельно хочет счётчик страниц. Пока действует UX-DEC-05.

---

## 2. Что сознательно не проектируем

Избранное, Radar, каталог людей, лента, Mini App, CRUD в боте, matching, экран «вам подходит», социальный follow, карта, сортировка кроме «новые».

---

## 3. Приоритет экранов

**P0 — обязательны для UI-макетов 375 и 1280 и для передачи в разработку после визуала:**

SCR-HOME, SCR-SEARCH, SCR-CARD, SCR-LOGIN, SCR-ONB-ROLE, SCR-ONB-PROFILE, SCR-CREATE-TYPE, SCR-CREATE-SPACE, SCR-PENDING-OK, SCR-PROFILE, SCR-ADMIN-QUEUE, SCR-ADMIN-ITEM.

**P0-формы** (тот же паттерн, что Space): SCR-CREATE-EVENT, SCR-CREATE-VACANCY, SCR-PREVIEW.

**P1 внутри U0** (описать, макет можно упростить): SCR-ONB-NOTIFY, SCR-SETTINGS, SCR-REPORT, SCR-ADMIN-REPORTS, SCR-ADMIN-USERS, SCR-ADMIN-STATS, SCR-LEGAL-*, TG-*.

**Алиасы Search:** SCR-SPACES / EVENTS / JOBS = тот же SCR-SEARCH с пресетом. Отдельный уникальный layout не нужен.

---

## 4. Инвентарь экранов

Легенда states: L loading · E empty · Z zero-results (фильтры) · R error · S success · U unauthorized · F forbidden · X expired · 404.

### SCR-HOME `/`

| Поле | Значение |
| --- | --- |
| purpose | За 5 секунд понять продукт и уйти в тип объявления |
| primary user | Гость, мастер |
| entry points | Прямой заход, логотип, таб Главная |
| primary action | Выбрать тип (Кабинеты / Мероприятия / Вакансии) |
| secondary | Открыть карточку из блока «Новые», Войти, Создать |
| required data | До 6 published (если есть), иначе empty |
| states | L, E (нет published), R |
| navigation | Таббар; плитки → Search с type |
| dependencies | Список published |
| приоритет | P0 |
| детали | [06-home.md](06-home.md) |

### SCR-LOGIN `/login`

| Поле | Значение |
| --- | --- |
| purpose | Telegram Login, сохранить `next` |
| primary user | Гость, желающий контакт или создать |
| entry | Contact CTA, Создать, Профиль, deep link |
| primary action | Войти через Telegram |
| secondary | Назад, ссылки legal |
| required data | `next` query |
| states | default, ошибка виджета, U не нужен |
| navigation | Без таббара или таббар приглушён |
| dependencies | Telegram Widget |
| приоритет | P0 |
| детали | [05-auth-contact-flow.md](05-auth-contact-flow.md) |

### SCR-ONB-ROLE `/onboarding/role`

| purpose | Выбрать master / space_owner / organizer |
| primary user | Первый вход |
| entry | После успешного Login, если нет роли |
| primary action | Выбрать роль, Далее |
| secondary | нет skip |
| required data | — |
| states | default, валидация «выберите роль» |
| navigation | степпер 1/3 |
| dependencies | Auth |
| приоритет | P0 |

### SCR-ONB-PROFILE `/onboarding/profile`

| purpose | Имя + контакт Telegram (= profile_completed) |
| primary user | Первый вход |
| primary action | Сохранить |
| secondary | фото, район, спец. (мастер — спец. обязательна) |
| states | L, валидация, R |
| navigation | степпер 2/3 |
| приоритет | P0 |

### SCR-ONB-NOTIFY `/onboarding/notifications`

| purpose | Opt-in трёх типов; все false по умолчанию |
| primary action | Сохранить или «Настроить позже» |
| states | default |
| navigation | степпер 3/3 → `next` или Search |
| приоритет | P1 (экран короткий, skip обязателен) |

### SCR-SEARCH `/search`

| purpose | Найти релевантную карточку одного типа |
| primary user | Гость, мастер |
| entry | Таб Поиск, Home плитки, header desktop, пресеты /spaces /events /jobs |
| primary action | Открыть карточку |
| secondary | Фильтры, сброс, Показать ещё, Создать из empty |
| required data | type, список, фильтры |
| states | L, E (seed пуст), Z (фильтры), R |
| navigation | Таб Поиск active |
| dependencies | published listings |
| приоритет | P0 |
| детали | [04-search.md](04-search.md) |

### SCR-SPACES / SCR-EVENTS / SCR-JOBS

Тот же Search. JOBS: доп. чип direction. Не отдельные макеты besides chip.

### SCR-CARD `/listings/:id`

| purpose | Решение писать автору |
| primary user | Гость → затем авторизованный |
| entry | Search, Home, Telegram UTM, admin preview |
| primary action | Показать контакт / Войти чтобы написать |
| secondary | Жалоба (авторизован), внешняя регистрация Event |
| required data | карточка; контакт только после GET contact |
| states | L, guest, authed, X expired, 404, F чужой draft |
| navigation | Назад; таб не active |
| приоритет | P0 |
| детали | [03](03-listing-card.md), [05](05-auth-contact-flow.md) |

### SCR-CREATE-TYPE `/create`

| purpose | Выбрать тип объявления |
| primary user | Любая роль с profile_completed |
| entry | Таб Создать |
| primary action | Кабинет / Мероприятие / Вакансия |
| secondary | — |
| states | U → login; подсветка дефолта по роли |
| приоритет | P0 |
| детали | [07-create-listing.md](07-create-listing.md) |

### SCR-CREATE-SPACE / EVENT / VACANCY

| purpose | Заполнить поля типа |
| primary action | К превью или «Отправить на проверку» через preview |
| secondary | Сохранить черновик |
| states | L upload, validation, R |
| приоритет | P0 |

### SCR-PREVIEW

| purpose | Проверить карточку глазами искателя |
| primary action | Отправить на проверку |
| secondary | Назад к форме |
| приоритет | P0 |

### SCR-PENDING-OK

| purpose | Снять тревогу: не в каталоге сразу |
| primary action | К своим объявлениям / на Главную |
| copy | «На проверке. Обычно в течение 24 часов.» |
| приоритет | P0 |

### SCR-PROFILE `/profile`

| purpose | Свои объявления по статусам, вход в настройки |
| primary action | Открыть своё объявление / Создать |
| secondary | Настройки, выход |
| states | L, E нет объявлений, U → login |
| приоритет | P0 |

### SCR-SETTINGS `/settings`

| purpose | Три тогла уведомлений, выход, удаление аккаунта |
| primary action | Сохранить тоглы |
| states | L, confirm delete |
| приоритет | P1 |

### SCR-LEGAL-P / SCR-LEGAL-T

| purpose | Плейсхолдер политики/правил |
| states | static |
| приоритет | P1 |

### SCR-REPORT (модалка)

| purpose | Жалоба с причиной, не скрывает карточку |
| primary user | Авторизованный |
| states | form, S «жалоба отправлена» |
| приоритет | P1 |

### SCR-ADMIN-QUEUE `/admin/listings`

| purpose | Обработать pending |
| primary user | admin |
| primary action | Открыть item |
| states | E пустая очередь, L, F 403 |
| приоритет | P0 |
| детали | [08-moderation.md](08-moderation.md) |

### SCR-ADMIN-ITEM `/admin/listings/:id`

| purpose | Approve или Reject + причина |
| primary action | Одобрить |
| secondary | Отклонить |
| приоритет | P0 |

### SCR-ADMIN-REPORTS / USERS / STATS

| purpose | Жалобы; block user; 7 чисел |
| приоритет | P1 |

### TG-START / SETTINGS / DM / CHANNEL

Не веб-экраны. Тексты: [09-telegram-ux.md](09-telegram-ux.md). Приоритет P1 для визуала, P0 для копирайта к E6.

---

## 5. Главный flow

**P-1:** Гость → каталог → карточка → логин Telegram → та же карточка → контакт.

Без него MVP не проверяет гипотезу соединений.

---

## 6. Следующий этап после U0

Визуальные макеты 375 и 1280 по P0-экранам (не код). Затем реализация E1+.
