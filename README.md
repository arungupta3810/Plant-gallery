# Plant Gallery — Full-stack platform

The Plant Gallery Business Platform (Phase 1 MVP), end-to-end:

- **`/` (this folder)** — customer storefront: **Next.js 14 (App Router) + TypeScript + Tailwind**.
- **`/backend`** — REST API: **NestJS + Prisma + PostgreSQL + JWT**. Self-contained; can be lifted into its own repo (see [backend/README.md](backend/README.md)).

The frontend talks to the backend over HTTP only (`NEXT_PUBLIC_API_URL`), so the two deploy and scale independently.

## Quick start (run both)

**1. Backend + database** (first terminal):
```bash
cd backend
cp .env.example .env
npm install
npm run db:up            # Postgres via Docker
npm run prisma:push      # create schema
npm run prisma:generate
npm run seed             # catalog, blog, FAQs, demo users
npm run dev              # API on http://localhost:4000/api
```

**2. Frontend** (second terminal):
```bash
npm install
npm run dev              # storefront on http://localhost:3000
```

`.env.local` points the frontend at the API and sets the WhatsApp number:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WHATSAPP=15551234567
```

### Demo logins (from seed)
| Role     | Email                     | Password   |
| -------- | ------------------------- | ---------- |
| Admin    | `admin@plantgallery.test` | `admin123` |
| Customer | `demo@plantgallery.test`  | `demo123`  |

Admin dashboard lives at `/admin` (visible to ADMIN/STAFF users).

## Locale

Built for **Mumbai, India**: prices in **INR (₹)** via `lib/format.ts` (`inr()` formats with Indian digit grouping), **free delivery over ₹250** (else flat ₹49), Mumbai contact address, default country `IN`.

## What works end-to-end (Phase 1 MVP)

- **Catalog** — server-driven search, category/light/difficulty filters, sort.
- **Plant detail** — live data, stock-aware "Add to cart", related plants, **genuine reviews** (real average; "No reviews yet" when empty).
- **Reviews** — verified-buyer only (must have ordered the plant), one per customer; rating = real average of real reviews. No hardcoded ratings.
- **Cart & wishlist** — cart persists to `localStorage`; wishlist persists to the DB when logged in.
- **Checkout → order → tracking** — guest or logged-in; server-priced orders, stock validation + inventory decrement in a transaction, confirmation + `/track` + `/order/[number]` status timeline.
- **Inventory** — per-plant stock; checkout rejects oversell; out-of-stock disables Add-to-cart; admin low-stock dashboard. See [Inventory](#inventory--stock) below.
- **Notifications** — in-app bell (unread count, mark-read, polling) + admin alerts + email + WhatsApp. Triggers: order placed (customer + admins), order status change (customer), new inquiry (admins). Email/WhatsApp log to console in dev; drop in credentials to go live. See `backend/src/notifications/`.
- **Accounts** — register/login (JWT), account page with order history + wishlist.
- **Journal (blog)**, **Contact/inquiry form** (creates a CRM lead + notifies admins), **WhatsApp** deep-links + floating button.
- **Admin CMS** — dashboard stats, plant create/edit/delete + stock, order list + status updates. Role-guarded (customers get 403).

Open http://localhost:3000

## Inventory & stock

- Each plant has an `Inventory` record (`stock`, `lowStockAt`). Admins set/edit stock in `/admin/plants`.
- **Checkout** ([backend/src/orders/orders.service.ts](backend/src/orders/orders.service.ts)) validates `stock >= qty` (rejects "Not enough stock") and decrements stock **inside a DB transaction**.
- **Storefront** disables Add-to-cart and shows "Out of stock" / "Sold out" when `stock === 0`.
- **Admin dashboard** lists low-stock plants (≤ 5) with restock deep-links.
- **Known limitations** (not yet handled): the check-then-decrement isn't fully atomic against simultaneous orders (rare oversell race); cancelling an order does **not** restore stock; the shop grid/cart don't surface stock (only the detail page does).

## What's here
```
app/
  layout.tsx          Root layout: next/font (Plus Jakarta + Inter), CartProvider, Header/Footer/CartDrawer
  globals.css         Design tokens (CSS vars) + component classes (mirror /colors_and_type.css)
  page.tsx            Home
  shop/page.tsx       Catalog with filters + sort
  plant/[id]/page.tsx Plant detail (dynamic route)
  not-found.tsx       404
components/
  CartContext.tsx     Cart + wishlist + drawer state (client context)
  Header / Footer / Logo
  PlantCard / PlantMedia / CareChip (CareChip + Rating)
  CartDrawer
  Icon.tsx            Thin wrapper over lucide-react (string-name lookup)
lib/
  plants.ts           Typed catalog data + helpers
tailwind.config.ts    Brand tokens mapped to Tailwind theme (bg-forest, text-charcoal, shadow-brand, font-display…)
```

## Design system mapping
- **Colors / radii / shadows / fonts** are exposed both as CSS variables (in `globals.css`) and as Tailwind theme tokens (in `tailwind.config.ts`). Use whichever fits — utilities for new work, the ported component classes for parity with the prototype.
- **Fonts** load via `next/font/google` (self-hosted at build, no layout shift). Swap to the "Organic & Handmade" direction by changing the two `next/font` imports in `layout.tsx` to `Playfair_Display` + `Source_Sans_3` and updating the `--font-display`/`--font-body` variables.
- **Icons**: `lucide-react`. `Icon.tsx` maps the same string names used across the kit.

## Motion rule (keep this)
Entrance animations animate **transform only**; overlays/drawers default to their **visible** state. This guarantees content is never stranded invisible during SSR, prefetch, or if an animation timeline is paused. Don't reintroduce opacity-0 keyframe starts with `fill-mode: both`.

## Still stubbed / next steps
- **Payments** — checkout supports cash-on-delivery and a *demo* card option that marks the order paid without a real charge. Integrate Stripe/Razorpay in `orders.service.ts` + the checkout page to take real payments.
- **Email/WhatsApp sending** — the notification pipeline is built; channels log to console until credentials are set. Add `SMTP_*` (email) / `WHATSAPP_API_TOKEN` (WhatsApp) to `backend/.env` and implement the one TODO block in `backend/src/notifications/channels.ts`. Guest checkouts don't yet get email/WhatsApp confirmations (logged-in customers do).
- **Product photography** — gradient + leaf-silhouette placeholders. The schema has an `Image` model ready; wire uploads to S3/Cloudinary.
- **Inventory hardening** — atomic decrement against concurrent orders; restore stock on order cancellation; surface stock on shop grid/cart.
- **Admin CMS gaps** — blog/FAQ/banner editors and a leads/inquiries viewer (data + APIs exist; no admin screens yet).
- **Phase 2/3 models** (`Lead`, `Subscription`) exist in the Prisma schema so CRM and subscription boxes can be built without a migration rewrite.
