# Parchhai — full-stack commerce platform

Premium DTC fashion brand reviving Indian block-print crafts (**Ajrakh, Bagru, Dabu, Bagh**) on contemporary silhouettes. This monorepo contains the storefront + landing site, the customer & admin dashboards, the mobile app, and the API — all backed by a single Neon Postgres database.

## Stack

| Layer | Tech |
|------|------|
| Database | **Neon** (serverless Postgres) + **Prisma** (`@prisma/adapter-neon`) |
| API | **Node + Express + TypeScript**, JWT auth, Zod validation, pino logging |
| Web (storefront + customer + admin + landing) | **React + Vite + TS**, React Router, TanStack Query, Tailwind, Zustand, Recharts |
| Mobile | **Expo + React Native + TS**, Expo Router, TanStack Query |
| Shared | `@parchhai/types` (Zod schemas + DTOs), `@parchhai/db` (Prisma client), `@parchhai/config` (tsconfig presets) |
| Payments | **Razorpay** behind a provider interface (auto-falls back to a **stub** when keys are absent) |
| Storage | **Cloudflare R2** (S3-compatible) behind an uploader interface (stub fallback) |
| Tooling | Turborepo + pnpm workspaces, Vitest |

> **Stack note.** The original brief mentioned both "MERN" and Neon. Those conflict (Mongo vs Postgres), so this build uses **Neon Postgres + Prisma everywhere** — Express/React/Node are kept, Mongo is not used.
>
> **Deviation note.** The marketing/landing pages are served as routes inside `apps/web` (`/`, `/crafts`, `/lookbook`, `/story`, `/journal`) rather than a separate `apps/landing`, to avoid duplicating the data layer. Everything in the brief's landing spec is present.

## Repository layout

```
parchhai/
├─ apps/
│  ├─ api/      Express + Prisma API (REST, /api/v1)
│  ├─ web/      React storefront + customer dashboard + admin dashboard + landing
│  └─ mobile/   Expo React Native app (storefront + account)
├─ packages/
│  ├─ db/       Prisma schema, Neon client, seed
│  ├─ types/    Shared Zod schemas + TS DTOs
│  └─ config/   Shared tsconfig presets
└─ turbo.json, pnpm-workspace.yaml
```

## Prerequisites

- Node ≥ 20, pnpm ≥ 10
- A Neon Postgres database (connection string)

## Setup

```bash
pnpm install

# 1. Configure env. Copy the template and fill in your Neon URL + secrets.
cp .env.example .env
#   The API reads apps/api/.env and the db package reads packages/db/.env.
#   DATABASE_URL = pooled (-pooler host); DIRECT_URL = non-pooled (for migrations).

# 2. Push the schema to Neon and seed it
pnpm db:push      # syncs schema.prisma → Neon (or: pnpm db:migrate for migration history)
pnpm db:seed      # 4 crafts, 20 products + variants, users, orders, coupons, CMS, shipping
```

Seed creates demo logins:

| Role | Email | Password |
|------|-------|----------|
| Owner (admin) | `admin@parchhai.example` | `Password123!` |
| Customer | `aanya@example.com` | `Password123!` |

(plus `catalog@`, `ops@`, `support@` staff accounts.)

## Run

```bash
pnpm dev            # all apps via Turborepo
# or individually:
pnpm dev:api        # http://localhost:4000/api/v1
pnpm dev:web        # http://localhost:5173
pnpm dev:mobile     # Expo dev server (press i / a / w)
```

The web app proxies to the API via `VITE_API_URL` (default `http://localhost:4000/api/v1`).
The mobile app reads `expo.extra.apiUrl` from `app.json` — point it at your machine's LAN IP for a physical device.

## Useful scripts

```bash
pnpm typecheck      # typecheck every package
pnpm test           # run Vitest suites (API pricing/coupon engine)
pnpm db:studio      # open Prisma Studio against Neon
pnpm db:generate    # regenerate the Prisma client
pnpm build          # production build of all apps
```

## Payments & uploads (stub mode)

With no Razorpay/R2 keys set, the API uses **stub providers** so every flow works end-to-end locally:

- Checkout creates a stub payment order; the client auto-verifies it and the order is confirmed (stock decremented, cart converted, coupon usage recorded).
- Image "uploads" return a deterministic placeholder URL.

Set the real keys in `apps/api/.env` (`RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`/`RAZORPAY_WEBHOOK_SECRET`, `R2_*`) to switch to live providers. The Razorpay webhook lives at `POST /api/v1/payments/webhook` (signature-verified against the raw body).

## API surface (`/api/v1`)

- **auth** — signup, login, otp/send, otp/verify, refresh, logout, me
- **catalog** (public) — products (filter/sort/paginate), product detail, reviews, crafts, categories, collections, journal, banners, pincode check
- **cart / wishlist** — server-side cart (guest via `X-Cart-Session`, adopted on login)
- **orders** — coupon preview, create order, payment verify, list/detail, cancel, return request
- **me** — profile, addresses CRUD
- **reviews** — create (purchase-gated, moderated)
- **payments** — Razorpay webhook
- **admin** (RBAC-gated) — products & variants, inventory + movements, orders + status + refund + invoice, returns queue, customers (CRM), coupons, banners, abandoned carts, journal, review moderation, shipping zones/rates/pincodes, reports (dashboard/sales/best-sellers/inventory/GST + CSV), settings, staff/RBAC, audit log, upload presign

### RBAC roles

`OWNER`/`ADMIN` (everything) · `CATALOG_MANAGER` (catalog/inventory/CMS/marketing) · `ORDER_OPS` (orders/returns/shipping) · `SUPPORT` (customers/reviews) · `READONLY` (read). Enforced in API middleware **and** the admin UI nav.

## Money

All monetary values are integer **paise** (₹ × 100) end-to-end. Format with the shared `formatINR` helper.

## Deploy (notes)

- **API** → Render / Railway / Fly. Set all `apps/api/.env` vars. Run `pnpm --filter @parchhai/db migrate:deploy` on release. Configure the Razorpay webhook URL to `https://<api-host>/api/v1/payments/webhook`.
- **Web** → Vercel (root `apps/web`, build `pnpm build`, output `dist`). Set `VITE_API_URL`.
- **Mobile** → EAS Build (`eas build`). Set `expo.extra.apiUrl` to the production API.
- **DB** → Neon (use the pooled URL for runtime, direct URL for migrations).

## Tests

`apps/api` ships Vitest unit tests for the pricing/coupon engine (`pnpm --filter @parchhai/api test`). Extend with integration tests via `supertest` (already a dependency).
