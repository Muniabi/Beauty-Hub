# 13 — QA / Test Strategy (стратегия качества и тестирования)

**Связано:** [06](06-user-stories.md) · [10](10-api-specification.md) · [12](12-security-plan.md) · [15](15-cicd-devops.md)

Команда маленькая: не строить отдельный QA-департамент. Пирамида смещена к API/интеграции; E2E — только критические пути.

---

## Testing pyramid (пирамида тестирования)

```text
        E2E (мало: CUJ happy path)
       /                          \
   API / интеграция (много сценариев статусов)
  /                                              \
Модульные тесты домена (статусы listing, hash login, dedup keys)
```

Не цель: 100% coverage. Цель: не сломать публикацию, поиск, контакт, уведомление, модерацию.

---

## Уровни

### Unit tests (модульные)

- Переходы статусов listing (нельзя published без approve).
- Построение dedup_key.
- Фильтр eligible users по preferences.
- Валидация event starts_at в будущем.

### Integration tests (интеграционные)

- PostgreSQL testcontainer или отдельная test DB.
- Create listing → pending не в GET public list.
- Approve → виден в list.
- Contact без auth → 401.

### API tests

Контракты [10](10-api-specification.md): 400 на пустой title, 403 чужой PATCH.

### E2E

Playwright: CUJ-1…7, 9, 10 на staging. Telegram E2E полный — сложно; см. ниже.

### Telegram integration tests

- Мок Bot API.
- Webhook с неверным secret → 401.
- Фикстура Update /start.
- Тест send вызывается один раз при двух job (дедуп).

Живой бот: ручной smoke на staging bot (отдельный token).

### Regression

Перед продом: прогон unit+integration+смоук CUJ.

### Smoke

Health `/`, логин, открыть список, открыть карточку.

### Security tests

Чеклист: XSS в description, upload SVG, CSRF, hash login, webhook. Автоматизировать то, что дёшево; остальное — ручной лист релиза.

### Performance tests

Не нагружать Telegram API. Лёгкий k6 на GET listings с 1k строк в БД. Цель p95 ориентир ADR-005. Не имитировать 100k VU.

---

## Definition of Ready (критерии готовности задачи)

- Есть story и AC в формате Given/When/Then.
- Указаны роль и данные (фикстуры).
- Зависимости доступны (не блокирует несуществующий модуль).
- Событие аналитики определено, если user-facing.
- Не Out of MVP без пометки P1.

## Definition of Done (критерии завершённости)

```text
Код + ревью
Тесты уровня задачи зелёные
Lint/typecheck
Пустые/ошибки/загрузка для UI
Мобильная ширина проверена (ручной или E2E viewport)
Событие аналитики, если в AC
Нет секретов в коде
Документация API обновлена, если контракт изменился
```

Не требовать «UX review отдельным дизайнером», если роли совмещены — self-check по [07](07-ux-architecture.md).

## Release checklist (чек-лист выпуска)

- [ ] CI green
- [ ] Миграции на staging применены, backup prod перед migrate
- [ ] Smoke staging
- [ ] Telegram staging: /start, тестовый approve → DM (ручной)
- [ ] Админ approve/reject
- [ ] Флаги/секреты prod
- [ ] Политика ПДн на месте (публичный релиз)
- [ ] Мониторинг ошибок включён
- [ ] Rollback план понятен [15](15-cicd-devops.md)

---

## Critical user journeys (критические пользовательские сценарии)

CUJ-8 Matching в MVP = N/A.

### 1. Registration (CUJ-1)

- **Предусловия:** тестовый Telegram Login (staging bot).
- **Ожидание:** сессия, user в БД, `user_registered` на первом входе.
- **Негатив:** невалидный hash → 401, гость может открыть список.
- **Проверка:** API + E2E.

### 2. Profile creation (CUJ-2)

- **Предусловия:** CUJ-1.
- **Ожидание:** роль, имя, контакт сохранены, `profile_completed`.
- **Негатив:** пустое имя → ошибка валидации.
- **Проверка:** API.

### 3. Listing creation (CUJ-3)

- **Предусловия:** профиль completed, роль supply.
- **Ожидание:** pending, нет в публичном GET.
- **Негатив:** дата события в прошлом; файл 20MB.
- **Проверка:** API + UI форма.

### 4. Search (CUJ-4)

- **Предусловия:** есть published разных типов.
- **Ожидание:** фильтр type возвращает только его.
- **Негатив:** неизвестный type → 400.
- **Проверка:** API.

### 5. Filtering (CUJ-5)

- **Предусловия:** два района.
- **Ожидание:** AND фильтров; empty state.
- **Негатив:** district_id не из справочника → пусто или 400.
- **Проверка:** API + UI empty.

### 6. Contact / interaction (CUJ-6)

- **Предусловия:** published, пользователь залогинен.
- **Ожидание:** контакт, `contact_clicked`.
- **Негатив:** без auth 401; скрейп 429.
- **Проверка:** API.

### 7. Telegram notification (CUJ-7)

- **Предусловия:** user opt-in event, telegram связан, не автор.
- **Ожидание:** после approve Event — одно DM, `notification_sent`.
- **Негатив:** opt-in только space → DM нет; повтор job → одно DM.
- **Проверка:** интеграция с моком + ручной smoke.

### 8. Matching (CUJ-8)

P1. Предусловие: Search Intent. Пока не тестировать как релиз-гейт MVP.

### 9. Report (CUJ-9)

- **Ожидание:** report open в админке, карточка ещё published.
- **Негатив:** без auth; репорт своего listing.
- **Проверка:** API.

### 10. Moderation (CUJ-10)

- **Ожидание:** approve → published + побочные notify; reject → не в поиске.
- **Негатив:** не-admin 403; повтор approve идемпотентен.
- **Проверка:** API.

Покрытие AC из [06](06-user-stories.md): таблица в том файле. При изменении AC — обновить этот раздел.

---

## Тест-данные

Не использовать реальные телефоны мастеров. Синтетические аккаунты staging. Отдельный Telegram-канал staging, не прод-аудитория.
