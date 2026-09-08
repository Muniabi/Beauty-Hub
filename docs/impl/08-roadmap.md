# 08 — Implementation roadmap

Канон порядка: [24 §8](../24-implementation-spec.md), [22](../22-execution-order.md).  
Matching **не** в этой дорожке.

```text
E1 Foundation → E2 Auth+Profiles → E3 Listings+media
 → E4 Moderation+reports → E5 Search+contact
 → E6 Telegram → E7 Harden/legal/expire/analytics polish
 → E8 Closed beta
```

Admin **до** Telegram (DEC-11). Search после того, как есть published (можно stub seed listing в E3).

## Epic → Feature → Story (сжато)

### E1 Foundation
- **F1.1 Repo:** Next.js, TS, Tailwind, shadcn, ESLint, `.env.example`
- **F1.2 DB:** Prisma, Docker compose postgres optional, migrate Location+Specialization seed
- **F1.3 Layout:** shell Home/Search/Create/Profile (заглушки страниц), токены U1 CSS
- **F1.4 Storage:** interface + local adapter
- **F1.5 Health + CI:** `/health`, GitHub Actions typecheck
- **Зависимости:** нет

### E2 Auth + Profiles
- Telegram verify + session cookie
- `/login?next=` + onboarding role/profile/notifications skip
- `safeNext`, logout, blocked
- **Зависит от:** E1

### E3 Listings + create
- CRUD draft/pending, details tables, media 1–6
- P-2 screens (без Figma gate)
- Preview guest, pending page
- **Зависит от:** E2 (автор)

### E4 Moderation + reports
- `/admin/queue`, detail, approve/reject confirm, reports
- Audit + analytics approve/reject
- **Зависит от:** E3; seed admin user

### E5 Search + public card + contact
- SQL search, P-1 filters, empty states
- Card guest vs authed; getContact + `contact_clicked`
- **Зависит от:** E3; лучше после E4 чтобы был published path

### E6 Telegram
- Webhook, channel post on published, opt-in DM, deep link
- **Зависит от:** E4 (только published)

### E7
- Expire job, rate limits, legal pages, analytics events gap-fill, backups check
- **Зависит от:** E5–E6

### E8
- Closed beta Rostov, метрики вручную
- **Зависит от:** E7 + Product legal (DEC-02)

## Порядок внутри спринта E1 (первый код)

1. `package.json` / Next app  
2. Prisma + seed catalogs  
3. App shell + empty routes  
4. Storage stub  
5. CI  

Не начинать Telegram Login до зелёного migrate.
