# Completion — Full-stack Phase 1 MVP

**Date**: 2026-06-03
**Task**: Make the storefront work end-to-end per the Plant Gallery Business Platform vision PDF, building the backend too.

---

## Outcome

The project went from a **design-only Next.js storefront** (data hardcoded in `lib/plants.ts`, in-memory cart, non-functional checkout) to a **working full-stack platform** with a real database-backed API. Phase 1 MVP is complete and verified end-to-end.

---

## What was built

### Backend — `./backend` (new)
NestJS 10 + Prisma 5 + PostgreSQL + JWT. **Self-contained** (own `package.json`, `.env`, `tsconfig`, Prisma schema/seed; imports nothing from the frontend; communicates over HTTP only) so it can be moved to its own repository.

Modules:
- **auth** — register / login / me, JWT (passport-jwt), bcrypt hashes, role-based guard (ADMIN / STAFF / CUSTOMER), plus an optional-auth guard for guest-or-user routes.
- **plants** — catalog with server-side search (`q`), category / light / difficulty filters, sort; categories list; admin create / update / delete + stock.
- **orders** — checkout (guest or customer), **server-side pricing** (never trusts client prices), **inventory decrement inside a DB transaction**, friendly tracking number (`PG-XXXXXX`), order tracking, customer order history, admin list + status update.
- **wishlist** — persisted per user.
- **content** — blog list/detail, FAQs, banners.
- **contact** — inquiry form → CRM `Lead`; admin lead list.
- **admin** — dashboard stats (revenue, orders, customers, leads, low stock).

Data model (`prisma/schema.prisma`) covers the PDF's "Database Modules": Users/Address, Category/Plant/Image/Inventory, Order/OrderItem/Payment, WishlistItem, BlogPost/Faq/Banner. **Phase 2/3 models stubbed**: `Lead`, `Subscription` (+ notification hooks marked in services) so CRM / notifications / subscription boxes can be added without a migration rewrite.

Seed (`prisma/seed.ts`) inserts the 12-plant catalog (ported from the old `lib/plants.ts`), 3 blog posts, FAQs, a banner, and demo users.

### Frontend — wired to the API
- New typed API client `lib/api.ts` (JWT attach, error normalization, env-configured base URL).
- `components/CartContext.tsx` rewritten: cart → `localStorage`, wishlist → DB when logged in (localStorage for guests), plus auth (token + user) state and session restore.
- **Shop** (`app/shop/page.tsx`) — server-driven search/filter/sort with debounced search box + loading skeletons.
- **Plant detail** — live fetch, stock-aware Add-to-cart, API-driven related plants.
- **Home** + **Journal** — server components fetching live plants/blog with static fallback.
- New pages: `/checkout`, `/order/[number]` (confirmation + status timeline), `/track`, `/login`, `/register`, `/account` (orders + wishlist), `/journal` + `/journal/[slug]`, `/contact`.
- **Admin CMS**: `/admin` (dashboard), `/admin/plants` (CRUD + stock), `/admin/orders` (list + status), role-guarded layout.
- `components/WhatsAppButton.tsx` floating launcher; contact page + footer WhatsApp deep-links.
- Header/Footer links wired to real routes.
- ~180 lines of CSS appended to `app/globals.css` for all new UI, reusing existing design tokens.

---

## Verification (live stack)

- `next build` passes clean — all 15 routes compile.
- Backend `nest build` clean; health, plants, search, categories all respond.
- Full purchase: created order `PG-0A1WZQ` ($72, demo card → PAID), then admin moved it to SHIPPED.
- Wishlist persisted to DB; customer order history works.
- **RBAC verified**: a CUSTOMER token gets **403** on `/api/admin/stats`.
- Proved data is DB-backed (not hardcoded): created "Proof Fern" via admin API, catalog returned it, then deleted it.

---

## Demo logins (from seed)

| Role     | Email                     | Password   |
| -------- | ------------------------- | ---------- |
| Admin    | `admin@plantgallery.test` | `admin123` |
| Customer | `demo@plantgallery.test`  | `demo123`  |

---

## Intentionally not real yet

- **Payments** — COD + a *demo* card path (marks order PAID, no real charge). Integrate Stripe/Razorpay in `orders.service.ts`.
- **Product images** — gradient/leaf placeholders; `Image` model ready for S3/Cloudinary.
- **Notifications** (email/WhatsApp) — Phase 2; hooks marked in services.

---

## Gotchas hit (and fixed)

1. Frontend `tsconfig.json` must `exclude: ["backend"]` — its `**/*.ts` glob otherwise pulls NestJS decorators into `next build` → "decorator expects 3 arguments".
2. Backend `tsconfig.json` must NOT include `prisma/**` — it raises rootDir so `nest build` emits `dist/src/main.js` instead of `dist/main.js`, breaking `start:prod`. Seed runs via `prisma/tsconfig.json` + ts-node.
3. Stale `.next` ("Cannot find module './15.js'" 500s) from a leftover IDE `next-server` on :3000 sharing the build dir. Fix: kill stray server, `rm -rf .next`, run one server. Dev on :3000 matches API CORS origin.
