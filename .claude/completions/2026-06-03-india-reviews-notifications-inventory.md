# Completion — India localization, genuine reviews, notifications, inventory

**Date**: 2026-06-03
**Task**: Localize for Mumbai/India, make all customer-facing data genuine (no hardcoding), add a notification feature, and document inventory handling. Builds on [2026-06-03-fullstack-phase1-mvp.md](2026-06-03-fullstack-phase1-mvp.md).

---

## 1. India / Mumbai localization

- **Currency → INR (₹)** via new `lib/format.ts` (`inr()` = Indian digit grouping; `shippingFor()` centralizes shipping). Replaced every `$` across storefront + admin.
- **Prices reseeded** to realistic Mumbai amounts (Monstera ₹1,899, Fiddle ₹2,549, Aloe ₹849…).
- **Shipping**: free over ₹250, else flat ₹49 — enforced in checkout, cart, and backend (`orders.service.ts`).
- Announcement bar, FAQ, plant shipping copy → Mumbai/₹. Contact address → Bandra West, Mumbai 400050. Schema address default `US` → `IN`.
- WhatsApp number set to `918652864081` (added country code; `wa.me` requires it).

## 2. Genuine reviews (removed hardcoded 4.8/124 rating)

- New `Review` model + `reviews` module (`/plants/:slug/reviews` list / eligibility / create).
- **Verified-buyer only**: must have an order containing the plant; one review per customer (unique constraint). 403 without purchase, 400 on duplicate.
- Rating = **real average** of real reviews; `Rating` component shows "No reviews yet" when none.
- New `components/Reviews.tsx` (list + form for eligible buyers) on the plant page.

## 3. Notification feature (all 4 channels)

- New **global** `notifications` module: `Notification` model, `NotificationsService.notify()` / `notifyAdmins()`, and a **channel abstraction** (`EmailChannel`, `WhatsAppChannel`) that logs in dev and checks `SMTP_HOST` / `WHATSAPP_API_TOKEN` for real sending later.
- API: `/notifications` (list+unread), `/:id/read`, `/read-all` (JWT).
- **Triggers**: order placed → customer (in-app+email+WhatsApp) + admins (in-app); order status change → customer (all 3); new contact lead → admins (in-app+email).
- Frontend `components/NotificationBell.tsx` in the header: unread badge, dropdown, mark-read (single + all), deep-links, 30s polling. Only shows when logged in.
- **Verified**: customer + admin inboxes populated correctly; email/WhatsApp console logs fired with right INR amounts + phone.
- Gap: guest checkouts don't get email/WhatsApp confirmations yet (logged-in customers do).

## 4. Inventory handling (documented; behavior unchanged)

How it works today:
- Per-plant `Inventory` (`stock`, `lowStockAt`); admins edit stock in `/admin/plants`.
- Checkout validates `stock >= qty` ("Not enough stock") and decrements in a **transaction** (`orders.service.ts`).
- Storefront: `stock === 0` → "Out of stock" badge, Add-to-cart disabled / "Sold out" (plant detail page only).
- Admin dashboard: low-stock list (≤5) with restock deep-links.

**Known limitations (not fixed):** check-then-decrement not atomic under concurrency (rare oversell race); cancelling an order doesn't restore stock; shop grid/cart don't surface stock.

---

## DB note

Schema changed (Review, Notification, Inventory default IN). Ran `prisma db push` + `generate` + `seed`. Re-seeding resets the catalog/orders — demo data is fresh.

## Open follow-ups offered to user

- Guest email/WhatsApp order confirmations.
- Inventory hardening (atomic decrement, restock on cancel, stock on grid).
- Admin screens for blog/FAQ/banners + leads viewer.
