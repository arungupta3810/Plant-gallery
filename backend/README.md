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
| POST   | `/contact`                 | optional    | Inquiry form → Lead             |
| GET    | `/contact/leads`           | ADMIN/STAFF | All leads                       |
| GET    | `/admin/stats`             | ADMIN/STAFF | Dashboard stats                 |

## Phase 2 / 3

`Lead` and `Subscription` models and notification hooks are stubbed in the schema
so the platform can grow (CRM, notifications, subscription boxes) without a
migration rewrite.
