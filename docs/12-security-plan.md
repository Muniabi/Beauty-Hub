# 12 — Security Plan (план безопасности)

**Связано:** [09](09-database-architecture.md) · [10](10-api-specification.md) · [11](11-telegram-architecture.md) · [13](13-qa-test-strategy.md)

Не security theatre: меры привязаны к угрозам локального marketplace (спам, мошенничество, скрейп контактов, запрещённый контент, флуд бота, утечка ПДн).

---

## Authentication (аутентификация)

- Telegram Login: проверка `hash` по документации Telegram, проверка свежести `auth_date`.
- Сессия: httpOnly, Secure, SameSite=Lax (или Strict для админки).
- Нет паролей в MVP — нет хранения password hash. Риск: зависимость от Telegram (ADR-003).
- Admin: тот же login, allowlist user id. Не публичная регистрация admin.

## Authorization (авторизация) и RBAC

| Роль | Может |
| --- | --- |
| guest | читать published |
| master / supply роли | профиль, свои listing, contact, report |
| admin | модерация, block, reports |

Проверки на сервере, не только UI. Чужой PATCH listing → 403.

## Input validation (валидация)

- Zod (или эквивалент) на границе API.
- Лимиты длины title/description.
- Enum для type, reason, role.
- HTML не рендерить как HTML: экранирование (XSS).

## Rate limiting

См. [10](10-api-specification.md). Отдельно: контакт endpoint против сбора телефонов.

## Secure cookies / CSRF

- SameSite cookie снижает CSRF.
- Для cookie-session: CSRF-токен на state-changing если SameSite=Lax недостаточно для кросс-сайт POST. Минимум: SameSite=Lax + проверка Origin на POST API.

## XSS / injection

- React/Next по умолчанию экранирует; запрет `dangerouslySetInnerHTML` для пользовательского описания.
- SQL только параметризованный ORM/query builder.
- Нет shell из входных данных.

## File uploads

- Белый список MIME, проверка magic bytes по возможности.
- Ресайз/перекодирование, не отдавать исходный SVG.
- Имена ключей UUID, не user filename.
- Лимит размера и количества.
- Хранилище не в executable web root.

## Telegram security

- Webhook secret_token.
- Не доверять `from` без совпадения с TelegramAccount при привязке.
- Login hash verification.
- Не класть bot token в клиент.

## Secrets

- Env на сервере, не в git.
- Разные bot token staging/prod.
- Ротация при утечке.

## Logging / audit trail

- Не логировать bot token, session, полный телефон в plaintext логах приложения (маски).
- AuditLog: admin approve/reject, block user, delete account.
- Retention логов: 12 месяцев `ASSUMPTION` (согласовать с D-02)

## Abuse prevention

- Модерация pending до витрины (основной контроль спама).
- Жалобы не автоскрывают (анти-конкурентные жалобы).
- Block user.
- Лимит create listing.
- Captcha не включать сразу; сигнал — всплеск ботов на Login.

## Account deletion / privacy

- Удаление: status deleted, PII затереть, объявления archive, telegram unlink.
- Публично: имя и объявления; телефон не в HTML до contact endpoint.
- Политика ПДн: D-02, без неё не публичный запуск.
- Геолокация точная не хранится; только район справочника.

---

## Threat Model (модель угроз)

| ID | Asset | Threat actor | Attack path | Likelihood | Impact | Mitigation | Residual | Owner | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T-01 | Контакты мастеров | Скрейпер | GET карточек / перебор contact API | Высокая | Среднее (спам) | Auth на contact, rate limit, не светить phone в HTML | Скрейп после логина через много аккаунтов | Tech Lead | Попытка скрипта на staging |
| T-02 | Доверие витрины | Мошенник | Фейковый кабинет, предоплата | Средняя | Высокое | Pending модерация, жалобы, без оплаты на платформе | Сделка вне платформы | Ops + Product | Сценарий CUJ-9/10 |
| T-03 | Внимание пользователей | Спамер | Массовые listing | Высокая | Высокое | Лимит create, модерация, block | Ручной труд модератора | Ops | Метрика reports |
| T-04 | Telegram | Флудер | /start и команды | Средняя | Среднее | Rate limit webhook handling per telegram_user_id | 429 Telegram | Tech | Нагрузочный тест осторожно |
| T-05 | Подмена webhook | Атакующий | POST фейковых update | Низкая без secret / высокая без него | Высокое | secret_token, HTTPS | Утечка секрета | Tech | Проверка без секрета = 401 |
| T-06 | XSS в описании | Автор объявления | Скрипт в description | Средняя | Высокое (сессии) | Экранирование | Ошибка в markdown renderer если добавят | Tech | QA XSS payload |
| T-07 | Upload malware/XSS | Автор | SVG/HTML as image | Средняя | Высокое | MIME, re-encode | Обход фильтров | Tech | Негативные файлы |
| T-08 | Подмена Login | Атакующий | Подделка hash | Низкая | Критическое | Проверка HMAC token | Утечка bot token | Tech | Невалидный hash |
| T-09 | CSRF смена профиля | Злоумышленник | POST с cookie жертвы | Средняя | Среднее | SameSite, Origin | Старые браузеры | Tech | Тест CSRF |
| T-10 | Admin takeover | Инсайдер / утечка | Украденная сессия admin | Низкая | Критическое | Короткий TTL admin, audit, allowlist | Физический доступ | Tech | Audit log |
| T-11 | ПДн в аналитике | Ошибка разработки | properties содержит phone | Средняя | Высокое (152-ФЗ) | Запрет PII в events, review | Случайный лог | Tech + Product | Code review [14] |
| T-12 | Запрещённый контент | Автор | Фото/текст | Средняя | Высокое (право) | Модерация, report, правила | Пропущенный пост | Ops | Выборка очереди |
| T-13 | Уведомления как спам | Мы сами | Всем все кабинеты | Высокая | Среднее (отписки) | Opt-in, типы, позже intent | Шум внутри типа | Product | Отписки bot |
| T-14 | Availability | Сеть/хост | DoS | Низкая/средняя | Высокое | Rate limit, простой хостинг | Крупный DDoS не цель защиты MVP | Tech | — |

Likelihood/impact — качественные экспертные оценки, не статистика.

---

## Приоритет внедрения безопасности MVP

1. Проверка Telegram Login + webhook secret  
2. Параметризованный SQL + экранирование  
3. Upload policy  
4. Rate limit contact/create  
5. Модерация pending  
6. Cookies  
7. Удаление аккаунта и политика  

Не делать: WAF enterprise, pentest-аутсорс до появления реальных данных (желательно до публичного запуска — `RESEARCH REQUIRED` бюджет).
