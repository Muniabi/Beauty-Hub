# 19 — Risk Register (реестр рисков)

**Связано:** [05](05-mvp-scope.md) · [12](12-security-plan.md) · [16](16-launch-plan.md) · [17](17-growth-strategy.md)

Оценки probability / impact — экспертные для локального MVP, не актуарные. Severity = комбинация (Critical / High / Medium / Low).

Владелец: роль, не фамилия (команда не задана).

---

## Риски

### R-01 no users (нет пользователей)

- **Probability:** High  
- **Impact:** Critical  
- **Severity:** Critical  
- **Связь:** запуск без seed и интервью  
- **Mitigation:** Phase 0–1 до публичного запуска; concierge-канал  
- **Owner:** Product + Community  
- **Trigger:** 2 недели беты, WAU ≈ авторы карточек  
- **Contingency:** остановить разработку фич, только операции; или stop проекта  

### R-02 no listings (нет объявлений)

- **Probability:** High  
- **Impact:** Critical  
- **Severity:** Critical  
- **Mitigation:** ручной outbound салонов/организаторов; бесплатно  
- **Owner:** Community  
- **Trigger:** <5 published к дате беты  
- **Contingency:** не открывать сайт; остаться в concierge; проверить Avito-гипотезу  

### R-03 low activity (низкая активность)

- **Probability:** High  
- **Impact:** High  
- **Severity:** High  
- **Mitigation:** Telegram opt-in; актуальные карточки; не пустой Radar  
- **Owner:** Product  
- **Trigger:** listing_viewed ≈ 0 при наличии published  
- **Contingency:** UX карточки, каналы трафика, интервью «почему не открыли»  

### R-04 chicken-and-egg

- **Probability:** High  
- **Impact:** Critical  
- **Severity:** Critical  
- **Mitigation:** [17](17-growth-strategy.md) supply-first  
- **Owner:** Product  
- **Trigger:** отказ салонов «нет мастеров» и мастеров «нет кабинетов» одновременно  
- **Contingency:** одна сторона субсидируется вручную (сами набиваем кабинеты)  

### R-05 spam

- **Probability:** High  
- **Impact:** High  
- **Severity:** High  
- **Mitigation:** pending, лимиты, block [12](12-security-plan.md)  
- **Owner:** Ops + Tech  
- **Trigger:** всплеск pending низкого качества  
- **Contingency:** временно только invite-only публикация  

### R-06 fraud (мошенничество)

- **Probability:** Medium  
- **Impact:** Critical  
- **Severity:** High  
- **Mitigation:** нет оплаты на платформе; модерация; жалобы; правила  
- **Owner:** Ops  
- **Trigger:** жалобы «предоплата», сюжеты в чатах  
- **Contingency:** снять карточки, пост-предупреждение в канале, block  

### R-07 moderation overload

- **Probability:** Medium (после публичного) / Low на бете  
- **Impact:** High  
- **Severity:** High  
- **Mitigation:** SLA честный; D-05 назначен до беты  
- **Owner:** Ops  
- **Trigger:** queue time > заявленного  
- **Contingency:** пауза регистраций supply; упростить правила  

### R-08 Telegram dependency

- **Probability:** Low (блокировка) / Medium (API 429)  
- **Impact:** High  
- **Severity:** High  
- **Mitigation:** веб автономен; retry; staging bot отдельно  
- **Owner:** Tech  
- **Trigger:** массовые failed sends; Login down  
- **Contingency:** D-04 phone auth ускорить; канал дублировать постом вручную  

### R-09 low retention

- **Probability:** High  
- **Impact:** Critical  
- **Severity:** High  
- **Mitigation:** уведомления по типу не спам; episodic OK для спроса кабинета  
- **Owner:** Product  
- **Trigger:** никто не возвращается и opt-in 0  
- **Contingency:** дайджест P1 или признать utility-only «пришёл когда нужно» — это не провал, если соединения есть  

### R-10 low conversion (просмотр → контакт)

- **Probability:** Medium  
- **Impact:** High  
- **Severity:** High  
- **Mitigation:** качество seed, фото, цена, D-03 не чрезмерно прятать  
- **Owner:** Product  
- **Trigger:** views без clicks  
- **Contingency:** интервью по карточке; упростить контакт  

### R-11 bad matching

- **Probability:** n/a в MVP; High если сделать рано  
- **Impact:** Medium (потеря доверия к «подборкам»)  
- **Severity:** Medium  
- **Mitigation:** Match после беты; не показывать 94%  
- **Owner:** Product  
- **Trigger:** жалобы «приходит не то» на P0-типах  
- **Contingency:** ускорить Search Intent или реже слать  

### R-12 excessive development cost

- **Probability:** Medium  
- **Impact:** High  
- **Severity:** High  
- **Связь:** Mini App + Match + Radar + Club сразу  
- **Mitigation:** жёсткий P0 [05](05-mvp-scope.md)  
- **Owner:** Tech Lead + Product  
- **Trigger:** срыв этапов из-за новых «хотелок»  
- **Contingency:** freeze scope, concierge  

### R-13 scope creep

- **Probability:** High  
- **Impact:** High  
- **Severity:** High  
- **Mitigation:** Won't Have, этот реестр, review в [23](23-documentation-review.md)  
- **Owner:** Product  
- **Trigger:** задача без BH-FR и без JTBD  
- **Contingency:** вернуть в backlog P2  

### R-14 privacy/security issues

- **Probability:** Medium  
- **Impact:** Critical  
- **Severity:** High  
- **Mitigation:** [12](12-security-plan.md), D-02  
- **Owner:** Tech + Legal  
- **Trigger:** утечка, жалоба субъекта ПДн  
- **Contingency:** инцидент: ротация секретов, уведомление по закону  

---

## Дополнительные риски анализа

### R-15 неотличие от Avito (Space)

- **Probability:** High  
- **Impact:** High  
- **Severity:** High  
- **Mitigation:** не позиционировать как Avito; ставка на события+Telegram; исследовать [02](02-market-research.md)  
- **Owner:** Product  
- **Trigger:** интервью «я и так на Avito за день нахожу»  
- **Contingency:** сузить MVP к Event+Vacancy или не делать Space  

### R-16 пустой Radar убивает доверие

- **Probability:** High если включить рано  
- **Impact:** Medium  
- **Severity:** Medium  
- **Mitigation:** Radar не P0  
- **Owner:** Product  
- **Trigger:** главная с нулями  
- **Contingency:** главная = поиск  

### R-17 юридический статус и 152-ФЗ

- **Probability:** Medium (игнор)  
- **Impact:** Critical  
- **Severity:** High  
- **Mitigation:** D-02 блокер публичной регистрации  
- **Owner:** Product / основатель  
- **Trigger:** публичный URL с сбором ПДн без политики  
- **Contingency:** закрыть регистрацию, оставить статику  

### R-18 неизвестный состав районов

- **Probability:** Medium  
- **Impact:** Low  
- **Severity:** Low  
- **Mitigation:** RESEARCH справочник; синонимы ЗЖМ  
- **Owner:** Product  
- **Trigger:** пользователи не находят свой район  
- **Contingency:** свободное текстовое поле района как временный долг  

---

## Сводка для управления

Еженедельно в бете смотреть: R-01, R-02, R-05, R-07, R-13. Остальные — по триггеру.
