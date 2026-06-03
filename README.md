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

## What works end-to-end (Phase 1 MVP)

- **Catalog** — server-driven search, category/light/difficulty filters, sort.
- **Plant detail** — live data, stock-aware "Add to cart", related plants.
- **Cart & wishlist** — cart persists to `localStorage`; wishlist persists to the DB when logged in.
- **Checkout → order → tracking** — guest or logged-in; server-priced orders, inventory decrement in a transaction, confirmation + `/track` + `/order/[number]` status timeline.
- **Accounts** — register/login (JWT), account page with order history + wishlist.
- **Journal (blog)**, **Contact/inquiry form** (creates a CRM lead), **WhatsApp** deep-links + floating button.
- **Admin CMS** — dashboard stats, plant create/edit/delete + stock, order list + status updates. Role-guarded (customers get 403).

Open http://localhost:3000

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
- **Product photography** — gradient + leaf-silhouette placeholders. The schema has an `Image` model ready; wire uploads to S3/Cloudinary.
- **Notifications** (Phase 2) — email/WhatsApp dispatch hooks are marked in `contact.service.ts` / `orders.service.ts`.
- **Phase 2/3 models** (`Lead`, `Subscription`) exist in the Prisma schema so CRM, notifications, and subscription boxes can be built without a migration rewrite.
