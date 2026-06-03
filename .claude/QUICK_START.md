# Quick Start Commands

---

## First-time backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run db:up            # Postgres via Docker
npm run prisma:push      # create schema
npm run prisma:generate
npm run seed             # starter data + demo users
```

## Development (two terminals)

```bash
# Terminal 1 — API (http://localhost:4000/api)
cd backend && npm run dev

# Terminal 2 — storefront (http://localhost:3000)
npm run dev
```

## Build for production

```bash
npm run build            # frontend (excludes ./backend)
cd backend && npm run build && npm run start:prod
```

## See the database

```bash
cd backend && npm run prisma:studio     # GUI at http://localhost:5555
# or psql:  docker exec -it plant-gallery-db psql -U plant -d plant_gallery
```

## Demo logins

- Admin:    `admin@plantgallery.test` / `admin123`
- Customer: `demo@plantgallery.test` / `demo123`

---

**Last Updated**: 2026-06-03
