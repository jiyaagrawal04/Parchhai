# Deploying Parchhai

Two services: the **API** (Node/Express) and the **web** (Vite static site). The simplest, most reliable path puts **both on Render** with one Blueprint. A Vercel option for the web is included too.

---

## Option A — Everything on Render (recommended, one platform)

`render.yaml` defines both services.

1. **Render → New → Blueprint** → select `jiyaagrawal04/Parchhai` → Apply.
   Render creates two services: `parchhai-api` and `parchhai-web`.
2. On **`parchhai-api`**, add the secret env vars (Environment tab → paste):
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_k1Ym5cAnwgDi@ep-blue-sea-aph7082d-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   DIRECT_URL=postgresql://neondb_owner:npg_k1Ym5cAnwgDi@ep-blue-sea-aph7082d.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require
   NODE_ENV=production
   ```
   (`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` auto-generate.)
3. Let both build. Copy the two URLs Render assigns, e.g.
   `https://parchhai-api.onrender.com` and `https://parchhai-web.onrender.com`.
4. **Wire them together:**
   - `parchhai-api` env → `WEB_ORIGIN = https://parchhai-web.onrender.com` → redeploy API.
   - `parchhai-web` env → `VITE_API_URL = https://parchhai-api.onrender.com/api/v1` → redeploy web.
5. Done. Open the web URL and log in with `admin@parchhai.example` / `Password123!`.

> Free-tier note: the API spins down after ~15 min idle, so the first request after a pause takes ~50s to wake. Normal. A free uptime pinger on `/api/v1/health` avoids it.

---

## Option B — API on Render, web on Vercel

**API:** as in Option A (the `parchhai-api` service), or its own Render Web Service:
- Build: `npm i -g pnpm@10.28.2 && pnpm install --no-frozen-lockfile && pnpm --filter @parchhai/db generate`
- Start: `pnpm --filter @parchhai/api start`
- Root Directory: blank (repo root), Health check: `/api/v1/health`, env vars as above.

**Web on Vercel:**
1. Vercel → Add New → Project → import the repo.
2. **Root Directory:** `apps/web`  ·  **Framework:** Vite
3. Env var: `VITE_API_URL=https://parchhai-api.onrender.com/api/v1`
4. Deploy. (`apps/web/vercel.json` handles the build + SPA routing.)
5. On Render API set `WEB_ORIGIN` to the Vercel URL → redeploy.

---

## Env variables reference

**API** (`apps/api`): `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL`(=15m), `JWT_REFRESH_TTL`(=30d), `WEB_ORIGIN`, `NODE_ENV=production`. Optional (blank = stub providers): `RAZORPAY_*`, `R2_*`, `RESEND_API_KEY`, `MSG91_API_KEY`. Do **not** set `PORT` — the host injects it.

**Web** (`apps/web`): `VITE_API_URL` only (build-time; redeploy after changing).

---

## Database

Schema is already pushed and seeded on Neon. If you ever reset it:
```
pnpm --filter @parchhai/db push    # sync schema
pnpm --filter @parchhai/db seed    # crafts, products, demo users, orders
```
(Run from the Render shell, or locally with the Neon URL in `.env`.)
