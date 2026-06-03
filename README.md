# Plant Gallery — Web (Next.js)

The customer storefront, built as a real **Next.js 14 (App Router) + TypeScript + Tailwind** project. The design mirrors the high-fidelity prototype in `../ui_kits/storefront/`; this is the runnable, production-shaped version of it.

## Quick start
```bash
cd nextjs-app
npm install
npm run dev
```
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

## Intentionally stubbed
Auth, real checkout/payments, search, CMS, and real product photography (gradient + leaf-silhouette placeholders) are placeholders — this is the front-end design layer described in the platform vision doc (Phase 1 customer website). Wire it to the NestJS/PostgreSQL backend and an image source (S3/Cloudinary) to take it live.
