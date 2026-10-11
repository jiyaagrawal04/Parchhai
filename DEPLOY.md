# Deploying Parchhai

The website is **100% static** — a Vite + React build with the catalog hardcoded in
`apps/web/src/data/catalog.ts`. There is no API, no database, no login. Orders are
placed by customers in Parchhai's Instagram DM (see `apps/web/CONTENT.md`).

Any static host works. Two one-click options:

## Option A — Vercel (recommended)

1. Vercel → Add New → Project → import the repo.
2. **Root Directory:** `apps/web` · **Framework:** Vite.
3. Deploy. No environment variables are needed. (`apps/web/vercel.json` handles the
   install, build and SPA routing.)

Every push to the connected branch redeploys automatically — that's how you publish a
new product: edit `catalog.ts`, drop the photos into `apps/web/public/products/`, push.

## Option B — Render (static site)

1. Render → New → Blueprint → select the repo → Apply. `render.yaml` defines a single
   static site, `parchhai-web`, publishing `apps/web/dist`.
2. No environment variables needed.

## Local

```
pnpm install
pnpm --filter @parchhai/web dev       # http://localhost:5173
pnpm --filter @parchhai/web build     # output in apps/web/dist
```

## Legacy backend

`apps/api`, `apps/mobile` and `packages/db` are the old server-backed version and are
no longer deployed or used by the website. They can be deleted whenever convenient.
