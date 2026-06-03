# Common Mistakes

**⚠️ CRITICAL - Read at session start**

---

## Top 5 Critical Mistakes

### 1. Frontend build pulls in the backend

**Symptom**: `next build` fails with "decorator expects 3 arguments" pointing at `backend/src/...`.
**Check**: `tsconfig.json` `include` uses `**/*.ts`.
**Fix**: Keep `"exclude": ["node_modules", "backend"]`. The backend has its own tsconfig.

### 2. `start:prod` can't find `dist/main.js`

**Symptom**: backend `MODULE_NOT_FOUND` for `dist/main.js` (it's at `dist/src/main.js`).
**Check**: `backend/tsconfig.json` `include` contains `prisma/**` — that raises rootDir.
**Fix**: Don't include `prisma` in the build. Seed runs via `prisma/tsconfig.json` + ts-node. Also `nest-cli.json` `deleteOutDir:true` means rebuild before `start:prod`.

### 3. Stale `.next` chunk errors

**Symptom**: 500s with "Cannot find module './15.js'" / './682.js'.
**Check**: A stray `next-server` (often IDE-started) already on :3000 sharing `.next` while another build/start runs.
**Fix**: `lsof -ti tcp:3000 | xargs kill`, `rm -rf .next`, run ONE server.

### 4. Browser API calls blocked by CORS

**Symptom**: fetches fail in the browser though curl works.
**Check**: backend `CORS_ORIGIN` (default `http://localhost:3000`).
**Fix**: Run the frontend on :3000, or add the origin to `backend/.env`.

### 5. Assuming API data is hardcoded

**Symptom**: confusion about where data lives.
**Reality**: API reads/writes **Postgres** at runtime. Only `backend/prisma/seed.ts` is hardcoded, and only runs on `npm run seed`. `lib/plants.ts` is just a fallback if the API is down.

---

**Last Updated**: 2026-06-03
