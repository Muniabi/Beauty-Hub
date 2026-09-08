# 04 — Auth and authorization

Канон: DEC-03, 04, 07, 08 · [ux/05](../ux/05-auth-contact-flow.md) · [12](../12-security-plan.md) · P-1 flow.

## 1. Telegram Login

1. Гость на listing жмёт «Войти, чтобы написать» → `/login?next=/listings/{id}`.  
2. Виджет Telegram (бот = тот же, что Login).  
3. Клиент POST payload на `/api/v1/auth/telegram`.  
4. Сервер: `hash` HMAC по [доке Telegram], `auth_date` не старше порога (например 86400 с).  
5. Upsert `user` + `telegram_account` (DEC-13). Первый вход: `user_registered`.  
6. Cookie сессии httpOnly, Secure (prod), SameSite=Lax, подписанный payload `{ userId, iat }`.  
7. Redirect: если `!profile_completed` → `/onboarding/role?next=...` иначе `safeNext(next)` default `/`.

`safeNext`: только path+query своего сайта; reject `//`, `http:`, `\`. Пустой next → `/`.

Онбординг: `next` в query на role, profile, notifications. Skip notify сохраняет next. Итог: **тот же listing**, не Home.

Невалидный hash → страница login error, **next сохранён** (P-1).

Logout: стереть cookie.

## 2. Session

Нет паролей. Каждый запрос: verify cookie → load user; если `blocked`/`deleted` → 401/403 и сброс cookie.

Admin: тот же Login, `role=admin` в БД (allowlist через seed / ручной SQL). Не регистрировать admin из онбординга.

## 3. Onboarding

Обязательно: роль (`master|space_owner|organizer`), имя, `contact_telegram` (предзаполнить username виджета).  
Район желателен, не блокер completed. Спец. обязательна только master (24).  
Notify: все false, skip можно (DEC-12).

Незавершённый профиль: каталог читать можно; Create и Contact → онбординг с `next`.

## 4. Permissions (не enterprise RBAC)

Проверки **на сервере**.

| Действие | guest | user completed | author | admin |
| --- | --- | --- | --- | --- |
| Читать published catalog/card | да | да | да | да |
| Видеть контакт / contact_clicked | нет | да | да | да |
| Create любой тип | login | да (DEC-08) | — | да |
| Edit / submit / archive своё | — | своё | да | да |
| Видеть свои draft/pending | — | свои | да | все |
| Approve / reject / unpublish / reports resolve / block | нет | нет | нет | да |
| Staff telegram/phone на moderation | нет | нет | нет* | да |
| Public HTML гостя: @ и телефон | нет | нет | нет | нет |

\* автор видит свой контакт в форме/профиле, не в гостевой вёрстке чужой карточки.

Роли master / space_owner / organizer **не** режут типы create — только hint UI (DEC-08).  
Guest Create → `/login?next=/create`.

## 5. Unauthorized

Каталог не показывает «401 экран». Защищённые маршруты → login + next.  
Admin UI не-admin → 403 «Нет доступа», не loop login если уже user ([15](../ui/15-p3-moderation.md)).
