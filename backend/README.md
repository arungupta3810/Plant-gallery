# Plant Gallery API (NestJS)

Backend for the Plant Gallery Business Platform — Phase 1 MVP.

> **Self-contained on purpose.** This folder has its own `package.json`, `.env`,
> Prisma schema and seed, and imports **nothing** from the parent Next.js app.
> It talks to the frontend only over HTTP. You can `git init` here and move it to
> its own repository at any time with no code changes.

## Stack

- NestJS 10 · Prisma 5 · PostgreSQL · JWT auth (passport-jwt) · class-validator

## Quick start

```bash
cd backend
cp .env.example .env          # adjust if needed
npm install

# 1. Start Postgres (Docker)
npm run db:up

# 2. Create schema + generate client
npm run prisma:push
npm run prisma:generate

# 3. Seed catalog, blog, FAQs, demo users
npm run seed

# 4. Run the API (http://localhost:4000/api)
npm run dev
```

Health check: `GET http://localhost:4000/api/health`

### Demo logins (from seed)

| Role     | Email                       | Password   |
| -------- | --------------------------- | ---------- |
| Admin    | `admin@plantgallery.test`   | `admin123` |
| Customer | `demo@plantgallery.test`    | `demo123`  |

## API surface

All routes are prefixed with `/api`.

| Method | Path                       | Auth        | Purpose                         |
| ------ | -------------------------- | ----------- | ------------------------------- |
| POST   | `/auth/register`           | —           | Create account                  |
| POST   | `/auth/login`              | —           | Login → `{ token, user }`       |
| GET    | `/auth/me`                 | JWT         | Current user                    |
| GET    | `/plants`                  | —           | Catalog (filters/search/sort)   |
| GET    | `/plants/categories`       | —           | Category list                   |
| GET    | `/plants/:slug`            | —           | Single plant                    |
| POST   | `/plants`                  | ADMIN/STAFF | Create plant                    |
| PUT    | `/plants/:slug`            | ADMIN/STAFF | Update plant                    |
| DELETE | `/plants/:slug`            | ADMIN       | Delete plant                    |
| POST   | `/orders`                  | optional    | Checkout (guest or customer)    |
| GET    | `/orders/mine`             | JWT         | Customer order history          |
| GET    | `/orders/track/:number`    | —           | Track an order by number        |
| GET    | `/orders`                  | ADMIN/STAFF | All orders                      |
| PATCH  | `/orders/:number/status`   | ADMIN/STAFF | Update order status             |
| GET    | `/wishlist`                | JWT         | Saved plants                    |
| POST   | `/wishlist/toggle/:slug`   | JWT         | Toggle saved                    |
| GET    | `/blog`, `/blog/:slug`     | —           | Blog                            |
| GET    | `/faqs`                    | —           | FAQs                            |
| GET    | `/banners`                 | —           | Active banners                  |
| POST   | `/contact`                 | optional    | Inquiry form → Lead (+admin alert) |
| GET    | `/contact/leads`           | ADMIN/STAFF | All leads                       |
| GET    | `/plants/:slug/reviews`    | —           | Reviews + real average/count    |
| GET    | `/plants/:slug/reviews/eligibility` | JWT | Can this user review?           |
| POST   | `/plants/:slug/reviews`    | JWT         | Add review (verified buyer)     |
| GET    | `/notifications`           | JWT         | In-app inbox + unread count     |
| PATCH  | `/notifications/:id/read`  | JWT         | Mark one read                   |
| PATCH  | `/notifications/read-all`  | JWT         | Mark all read                   |
| GET    | `/admin/stats`             | ADMIN/STAFF | Dashboard stats (incl. low stock) |

## Notifications

`NotificationsService` (global module) creates in-app records and fans out to
channels. `EmailChannel` / `WhatsAppChannel` log to console in dev; set `SMTP_*`
or `WHATSAPP_API_TOKEN` in `.env` and fill the TODO in `notifications/channels.ts`
to send for real. Triggers: order placed (customer + admins), order status change
(customer), new inquiry (admins). Channels chosen per call (`['inapp','email','whatsapp']`).

## Inventory

Each plant has an `Inventory` row. Checkout validates stock and decrements it in a
transaction; admin dashboard surfaces low stock (≤5). Not yet handled: atomic
decrement under concurrency, and restock on cancellation.

## Reviews

Genuine, verified-buyer only — a user can review a plant only if they have an
order containing it, one review per plant. The plant's rating is the real average
(null/"no reviews" until one exists). No hardcoded ratings.

## Phase 2 / 3

`Lead` and `Subscription` models are stubbed in the schema so the platform can grow
(CRM, subscription boxes) without a migration rewrite. Notifications (Phase 2) are
now implemented; email/WhatsApp need provider credentials to send for real.
