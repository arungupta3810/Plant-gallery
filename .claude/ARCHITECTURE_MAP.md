# Architecture Map

---

## Directory Structure

```
nextjs-app/                  Next.js 14 storefront (App Router + TS + Tailwind)
├── app/                     Routes (page.tsx per route)
│   ├── shop/                Catalog (search/filter/sort, client)
│   ├── plant/[id]/          Plant detail (client)
│   ├── checkout/            Checkout form
│   ├── order/[number]/      Order confirmation + tracking timeline
│   ├── track/               Track-by-number entry
│   ├── login/ register/     Auth
│   ├── account/             Orders + wishlist (auth-guarded)
│   ├── journal/             Blog list + [slug] detail (server)
│   ├── contact/             Inquiry form + WhatsApp
│   ├── admin/               CMS: layout(guard) + dashboard + plants + orders
│   ├── layout.tsx           Providers + Header/Footer/CartDrawer/WhatsAppButton
│   └── globals.css          Design tokens + all component CSS
├── components/              CartContext (cart+wishlist+auth), Header, Footer,
│                            PlantCard, PlantMedia, CartDrawer, Icon, WhatsAppButton,
│                            NotificationBell, Reviews, CareChip (Rating)…
├── lib/
│   ├── api.ts               Typed API client (JWT, env base URL)
│   ├── format.ts            INR currency (inr()) + shipping (shippingFor()) — Mumbai/India
│   └── plants.ts            Plant type + static fallback catalog
└── backend/                 SELF-CONTAINED NestJS API (movable to own repo)
    ├── prisma/schema.prisma Data model (Users, Plants, Inventory, Orders, Reviews,
    │                        Notifications, Content, Lead, Subscription)
    ├── prisma/seed.ts       Starter data — INR prices (the only hardcoded data)
    └── src/                 Modules: auth, plants, orders, wishlist, content, contact,
                             reviews, notifications (global), admin
```

## Key File Locations

- **Frontend config**: `tsconfig.json` (excludes `backend`), `.env.local` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WHATSAPP`)
- **Backend config**: `backend/.env` (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`), `backend/tsconfig.json` (excludes `prisma`)
- **API entry**: `backend/src/main.ts` (global prefix `/api`, port 4000)
- **DB**: `backend/docker-compose.yml` (Postgres), Prisma schema + seed
- **Tests**: none yet (verified via curl smoke tests + `next build` / `nest build`)

---

**Last Updated**: 2026-06-03
