# architecture.md — APIx System Architecture

> Defines *how* the system is structured, covering all four parts of
> the project: **Frontend (Next.js)**, **Backend (Next.js)**,
> **Database (PostgreSQL)**, and **Workers engine**. Read `PRD.md`
> first for *what* to build.

---

## 1. System Overview

```text
                    ┌───────────────────┐
                    │   Static CSV file   │
                    └─────────┬──────────┘
                              │ loaded once
                              ▼
                 ┌───────────────────────────┐
                 │  Worker Services            │
                 │  (Python or Node, separate  │
                 │   from Next.js)             │
                 │  loader → mutator → compare │
                 │  (mutator runs every 1 min) │
                 └────────────┬───────────────┘
                              ▼ writes
                 ┌───────────────────────────┐
                 │      PostgreSQL             │
                 │ routes, carriers,           │
                 │ static_fares ("DB1"),       │
                 │ live_fares ("DB2"),         │
                 │ index_results ("DB3"),      │
                 │ users, api_keys, alerts,    │
                 │ audit_logs                  │
                 └────────────┬───────────────┘
                              ▲ reads (Prisma)
                              │
                 ┌───────────────────────────┐
                 │   Next.js Application       │
                 │  Middleware → Route Handlers │
                 │  → App Router pages          │
                 └────────────┬───────────────┘
                              ▼
                Browser Users │ Institutional API Consumers
```

**Core rule:** Workers and Next.js never call each other directly.
They meet **only through the PostgreSQL database**, using an agreed
table schema. This keeps scraping/compute (long-running, potentially
flaky) fully decoupled from the API (must stay fast and always up).

## 2. Components — Four Parts

This system has exactly four parts. Every file in the repo belongs to
one of them:

1. **Frontend (Next.js)** — pages, components, charts, client-side state
2. **Backend (Next.js)** — API route handlers, auth, middleware, validation — lives in the *same* Next.js app as the frontend, different folders
3. **Database (PostgreSQL)** — single source of truth, schema owned via Prisma
4. **Workers engine** — scraper, ETL, index computation — a separate app/process, Python or Node

```text
apix/
├── apps/
│   ├── web/            ← Frontend (Next.js) + Backend (Next.js) together
│   │                      (see §3 and §4 for the split inside this app)
│   └── workers/         ← Workers engine (see §5)
└── packages/
    └── db/               ← Database schema, shared by web + workers (see §6)
```

**Core rule (unchanged):** the Workers engine and the Next.js app never
call each other directly. They meet **only through PostgreSQL**.

---

## 3. Frontend (Next.js) — `apps/web/app/(dashboard)` + `apps/web/src`

The frontend is the user-facing dashboard: Airfare Price Index
overview, route/lead-time/airline analysis, heatmap, data explorer,
alerts, and documentation pages — same feature set as the original
`APIx_Frontend_README.md`, now running inside the Next.js App Router
instead of a standalone Vite app.

### Pages (`app/(dashboard)/`)

| Route | Page | Purpose |
|---|---|---|
| `/` | Dashboard | Airfare Price Index overview |
| `/routes` | Route Trend Analysis | Per-route historical trend |
| `/lead-time` | Lead-Time Analysis | Advance-booking window comparison (T+1 vs T+15) |
| `/airlines` | Airline Comparison | Airline-wise fare comparison |
| `/heatmap` | India Heatmap | State-level index visualization |
| `/data-explorer` | Data Explorer | Raw/filtered fare observation browser |
| `/alerts` | Alerts | Price-spike / data-quality notifications |
| `/api-access` | API Access & Docs | API key display, usage examples |
| `/methodology` | Methodology | Index construction & data-quality explanation |
| `/login` | Auth | Institutional/admin login |

### Frontend folder structure (inside `apps/web`)

```text
apps/web/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx                  # Dashboard
│   │   ├── routes/page.tsx
│   │   ├── lead-time/page.tsx
│   │   ├── airlines/page.tsx
│   │   ├── heatmap/page.tsx
│   │   ├── data-explorer/page.tsx
│   │   ├── alerts/page.tsx
│   │   ├── api-access/page.tsx
│   │   └── methodology/page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── api/v1/...                    # ← Backend, see §4
│
├── src/
│   ├── components/                   # Shared UI (shadcn/ui-based)
│   │   ├── ui/                       # button, card, table, dialog, etc.
│   │   ├── charts/                   # Recharts wrappers (trend, heatmap, bar)
│   │   └── layout/                   # nav, sidebar, page shell
│   ├── features/                     # One folder per page's logic
│   │   ├── dashboard/
│   │   ├── routes/
│   │   ├── lead-time/
│   │   ├── airlines/
│   │   ├── heatmap/
│   │   ├── data-explorer/
│   │   └── alerts/
│   ├── hooks/                        # useIndexData, useRouteData, etc.
│   ├── store/                        # Zustand stores (filters, session)
│   ├── types/                        # Frontend-facing TS types
│   ├── utils/                        # Formatting, date helpers
│   └── lib/
│       └── api-client.ts             # Axios/fetch wrapper calling /api/v1/*
│
├── middleware.ts                      # ← also Backend, see §4
├── next.config.ts
└── package.json
```

- Frontend components call the backend **only** through `src/lib/api-client.ts`, which hits `/api/v1/*` — never a direct database or Prisma import from anything under `src/features` or `src/components`.
- State: Zustand for filters/UI state (selected route, date range, lead-time window); server data (index values, observations) is fetched, not duplicated into global state, to avoid staleness.

---

## 4. Backend (Next.js) — `apps/web/app/api` + `apps/web/lib`

The backend is the API layer — **same Next.js app as the frontend**,
but a strictly separate set of folders. This is what the frontend
*and* institutional consumers (RBI/NSO) both call.

### Backend folder structure (inside `apps/web`, alongside the frontend above)

```text
apps/web/
├── app/
│   └── api/v1/
│       ├── index/route.ts
│       ├── index/history/route.ts
│       ├── routes/route.ts
│       ├── routes/[routeId]/route.ts
│       ├── airlines/route.ts
│       ├── lead-time/route.ts
│       ├── heatmap/route.ts
│       ├── observations/route.ts
│       ├── alerts/route.ts
│       └── admin/
│           ├── api-keys/route.ts
│           └── organizations/route.ts
│
├── middleware.ts                      # AuthN, rate limit, security headers, CORS
│
└── lib/
    ├── auth.ts                        # NextAuth (Auth.js) config
    ├── rbac.ts                        # role/scope checks (admin, api_consumer)
    ├── rate-limit.ts                  # Upstash Redis or in-memory limiter
    ├── db.ts                          # Prisma client singleton
    └── validation/                    # Zod schema per endpoint
        ├── index.ts
        ├── routes.ts
        ├── lead-time.ts
        └── observations.ts
```

- Every route handler follows: **middleware → auth check → Zod validation → Prisma query → shaped response**
- `lib/db.ts` exports the single Prisma client instance used by every route handler — no route creates its own client
- Backend never imports anything from `src/components` or `src/features` (frontend) — the only shared surface between frontend and backend is the HTTP contract itself (`/api/v1/*`) plus, optionally, types in `packages/shared-types`

### Auth model
- Dashboard/admin users → NextAuth session (httpOnly cookie)
- Institutional consumers (RBI/NSO) → API key, `Authorization: Bearer <key>`, hashed at rest
- Two roles for MVP: `admin`, `api_consumer`

---

## 5. Workers Engine — `apps/workers`

A **separate application** from `apps/web`. Instead of live scraping
(high anti-bot risk for a hackathon timeline), the workers engine
simulates a live market on top of a real static snapshot, then
compares the two to produce the index. Three responsibilities, three
tables (all in the **same Postgres database** — see §6):

1. **Load** a CSV fare snapshot once, into `static_fares` (DB1)
2. **Mutate** that data every 1 minute into `live_fares` (DB2) — this stands in for "the scraper"
3. **Compare** DB1 vs DB2 every cycle and write the result into `index_results` (DB3), which is what the index/API layer reads

```text
apps/workers/
├── loader/
│   └── load_static_csv.py|.ts        # one-time: CSV → static_fares
│
├── mutator/
│   └── mutate_live_fares.py|.ts      # every 1 min: static_fares → live_fares (± variation)
│
├── index-engine/
│   ├── compare.py|.ts                # static_fares vs live_fares → index_results
│   ├── weighting.py|.ts              # DGCA-traffic-share route weights
│   └── backtesting.py|.ts            # vs DGCA published averages (stretch goal)
│
├── db/
│   └── client.py|.ts                 # psycopg2/SQLAlchemy (Python) or Prisma (Node)
│
└── config/
    └── routes.json                    # MVP route basket + weights
```

- **Language choice (Python or Node) is per-team decision** — see `rules.md` §1. Whichever is chosen, this folder must write to the *exact* table/column names defined in `packages/db/prisma/schema.prisma` (§6).
- No HTTP server, no inbound port — outbound only to Postgres (no external scraping targets for MVP).
- Order of execution, every 1-minute tick: `mutator` updates `live_fares` (upsert) → `compare` reads `static_fares` + `live_fares`, aggregates per-route across carriers/windows, and **appends** a new batch of `index_results` rows for that tick (never overwrites prior ticks — see §6.3). `loader` runs once at startup, not on the tick.
- This design is honestly described in the demo as: *"a real fare snapshot as the static baseline, live market fluctuation simulated on top of it — the index engine's comparison logic is identical to what it would be against a genuine live scrape."*

---

## 6. Database (PostgreSQL) — `packages/db`

**One physical Postgres database**, containing three logically
distinct tables that stand in for "DB1/DB2/DB3." They are not separate
databases — DB3's entire job is to compare DB1 and DB2 row by row,
which is a plain SQL join when they're tables in the same database,
and unnecessary cross-database plumbing (`postgres_fdw`/`dblink`) if
they're not.

```text
packages/
├── db/
│   └── prisma/
│       ├── schema.prisma             # authored & migrated from apps/web only
│       └── migrations/
└── shared-types/                     # Zod/TS types shared by web (always)
                                       # and workers (only if workers is Node)
```

- `schema.prisma` is the only place the schema is defined — it is what actually runs `prisma migrate` and creates the tables.
- If workers are Python, they don't use Prisma at all; they connect to the same Postgres instance directly and must match Prisma's table/column names exactly. **The database table is the contract, not the ORM.**

### 6.1 `static_fares` ("DB1") — loaded once from CSV

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `route_id` | FK → routes | e.g. DEL-BOM |
| `carrier_id` | FK → carriers | |
| `lead_time_window` | text | T+1, T+15 |
| `base_fare`, `taxes`, `fees`, `total_fare` | numeric | as read from the CSV |
| `loaded_at` | timestamp | when this snapshot was ingested |

Loaded once at startup by `apps/workers/loader`. Never modified after.

### 6.2 `live_fares` ("DB2") — mutated every 1 minute

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `route_id`, `carrier_id`, `lead_time_window` | same keys as `static_fares` | matches DB1 rows 1:1 |
| `base_fare`, `taxes`, `fees`, `total_fare` | numeric | current simulated "live" value |
| `updated_at` | timestamp | bumped every mutator run |
| `tick` | integer | increments each run |

Upserted every 1 minute by `apps/workers/mutator`, which applies a
randomised variation on top of each `static_fares` row.

### 6.3 `index_results` ("DB3") — comparison + final output

Contains every column from both `static_fares` and `live_fares`
(prefixed to disambiguate), plus derived comparison columns.

**Append-only, not upserted.** Every 1-minute cycle inserts a *new*
set of rows keyed by `computed_at` — it never overwrites the previous
tick's rows. This is required for `/api/v1/index/history` and route
trend charts to work at all: if rows were upserted, only the current
state would exist and there would be no time series to plot. `routes`,
`carriers`, `static_fares` stay as-is; `live_fares` may still be
upserted (only the current live price matters there), but
`index_results` must accumulate.

| Column | Source |
|---|---|
| `id` | serial PK |
| `route_id`, `carrier_id`, `lead_time_window` | join key |
| `static_base_fare`, `static_total_fare` | from `static_fares` |
| `live_total_fare`, `live_updated_at` | from `live_fares` |
| `fare_diff` | `live_total_fare - static_total_fare` |
| `pct_change` | `(live_total_fare - static_total_fare) / static_total_fare * 100` |
| `relative_price` | `(live_total_fare / static_total_fare) * 100` — CPI-style relative |
| `route_weight` | from `routes.weight` |
| `index_contribution` | see weight-normalization rule below — **not** simply `route_weight * relative_price` per row |
| `computed_at` | timestamp of this tick — same value for every row written in one cycle, used as the time-series key |

**Weight-normalization rule (avoids double-counting).** A route can
have multiple carriers and multiple lead-time windows, producing
multiple `index_results` rows per route per tick. If each row applied
the *full* route weight independently, a route with 4 rows (2 carriers
× 2 windows) would contribute 4× its intended weight, while a route
with 1 row contributes 1× — silently distorting the index. To prevent
this, the compare job runs in two passes per tick:

1. **Per-route aggregation pass**: average `relative_price` across all carriers/lead-time windows for a given route, producing one representative `relative_price` per route.
2. **Weighting pass**: `index_contribution = route_weight * route_relative_price`, applied once per route, not once per (route, carrier, window) row.

The overall index value (`/api/v1/index`) for a given tick is
`sum(index_contribution)` across the current route basket for that
`computed_at` timestamp — computed on read, or cached as the latest
row per route, rather than stored in a separate 4th table.

## 7. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18 + Next.js 14+ (App Router), TypeScript | §3 |
| UI | Tailwind CSS + shadcn/ui + Recharts | §3 |
| State (frontend) | Zustand | §3 |
| Backend API | Next.js Route Handlers + Middleware | §4, no separate gateway |
| Auth | NextAuth (Auth.js) + custom API-key middleware | §4 |
| ORM | Prisma → PostgreSQL | §6, single schema source of truth |
| Database | PostgreSQL | §6, TimescaleDB extension optional later |
| Workers | Python (Scrapy/pandas) **or** Node/TS (Playwright/Crawlee) | §5 |
| Cache/rate-limit | Redis (Upstash) or in-memory | §4 |
| Validation | Zod | §4, shared with workers only if Node |
| Hosting | Vercel (web) + Docker/local (workers) | Workers must not be deployed as Vercel functions |

## 8. Database Schema (summary — full DDL/Prisma file to be generated separately)

| Table | Key columns | Written by | Read by |
|---|---|---|---|
| `routes` | id, origin, destination, weight | seed / admin | web, index engine |
| `carriers` | id, name, code | seed / admin | web |
| `static_fares` ("DB1") | id, route_id, carrier_id, lead_time_window, base_fare, taxes, fees, total_fare, loaded_at | loader (once, from CSV) | index engine (`compare`) |
| `live_fares` ("DB2") | id, route_id, carrier_id, lead_time_window, base_fare, taxes, fees, total_fare, updated_at, tick | mutator (every 1 min) | index engine (`compare`) |
| `index_results` ("DB3") | id, computed_at (tick key), route_id, carrier_id, lead_time_window, static_total_fare, live_total_fare, fare_diff, pct_change, relative_price, route_weight, index_contribution | index engine (`compare`, every 1 min, **append-only**) | web (`/index`, `/index/history`, `/observations`) |
| `users` | id, email, password_hash, role | web (NextAuth) | web |
| `api_keys` | id, org_id, key_hash, scope, rate_tier, created_at, revoked_at | web (admin) | web (auth middleware) |
| `alerts` | id, type, route_id, message, created_at | index engine or web | web (`/alerts`) |
| `audit_logs` | id, actor, action, target, created_at | web | web (admin) |

See §6.1–6.3 for full column definitions of `static_fares`,
`live_fares`, and `index_results`.

## 9. API Contract (`/api/v1/*`)

```
GET  /api/v1/index
GET  /api/v1/index/history
GET  /api/v1/routes
GET  /api/v1/routes/{routeId}
GET  /api/v1/airlines
GET  /api/v1/lead-time
GET  /api/v1/heatmap
GET  /api/v1/observations
GET  /api/v1/alerts
GET  /api/v1/admin/api-keys
POST /api/v1/admin/api-keys
GET  /api/v1/admin/organizations
POST /api/v1/admin/organizations
```

All routes are read-only from the consumer's perspective except the
`admin/*` routes, which require the `admin` role.

## 10. Deployment Topology

- **Frontend + Backend** (`apps/web`, one deploy) → Vercel (or any Node host)
- **Workers engine** (`apps/workers`) → Docker container(s) on any host, or run manually/via cron for hackathon demo purposes
- **Database** → hosted free-tier PostgreSQL (Neon/Supabase/Railway) for fast setup, or local Docker for development
