# memory.md — Decisions Log

> Running record of decisions already made for APIx, so any AI
> assistant (or teammate) picking this project up mid-hackathon has
> full context without re-litigating settled questions. Update this
> file whenever a real decision changes.

---

## Project identity
- Project: **APIx** — Real-time Airfare Price Index for India (SIH hackathon problem statement)
- Purpose: augment NSO's CPI transport sub-group using automated web-scraped airfare data
- Consumers: RBI, NSO/MoSPI, DGCA/govt agencies, researchers, analysts — not the general public

## Frontend decisions (already built/scaffolded)
- React 18 + Vite originally, later folded into **Next.js 14+ App Router** so frontend and backend API share one app
- Tailwind CSS + shadcn/ui + Recharts, Zustand for state, Axios for API calls
- Pages: Dashboard, Routes, Lead-Time, Airlines, Heatmap, Data Explorer, Alerts, API Access, Methodology

## Backend architecture decisions
- **Backend API lives in Next.js** (Route Handlers under `app/api/v1/*` + `middleware.ts`) — chosen over separate FastAPI microservices for hackathon speed, while keeping the same security boundaries conceptually.
- **Scraping, ETL, and index computation run as separate worker services**, not inside Next.js — reason: Next.js/serverless functions time out on long-running jobs; workers must be always-on or cron-scheduled, deployed outside the Next.js app.
- Workers and Next.js **never call each other directly** — they only communicate through the shared PostgreSQL database.
- **Prisma is used only on the Next.js side.** `schema.prisma` (owned by the Next.js/API person) is what actually creates the Postgres tables via `prisma migrate`.
- **Workers can be Python or Node** — if Python, they connect to Postgres directly via `psycopg2`/SQLAlchemy/`asyncpg` (no Prisma involved, since Prisma is Node-only); they must match Prisma's table/column names exactly, since the database table itself is the shared contract, not the ORM.
- Database: PostgreSQL (TimescaleDB extension is a future upgrade, not needed for MVP volume).

## MVP scope decisions
- 2 airlines (e.g. IndiGo + SpiceJet), 1 OTA optional, 3 routes (DEL-BOM, DEL-BLR, BOM-BLR)
- 2 lead-time windows: T+1 and T+15 (not all five from the original problem statement)
- Daily index only for MVP; weekly/monthly are a stretch goal (same data, different aggregation)
- Two roles only: `admin`, `api_consumer` (full RBAC tiers are a stretch goal)
- Synthetic/seed data fallback is acceptable and expected if scraping is blocked — must be clearly labeled as such in the demo, never presented as real

## Index methodology decisions
- CPI-style, Laspeyres-family index: fixed route basket, weights from DGCA passenger-traffic share, fixed base period (index = 100 at base)
- Index = weighted sum of each route's relative price (live fare / static base fare × 100)
- Back-testing: compare computed index against publicly available DGCA monthly average fares, presented as a visual overlay — no need for advanced statistical validation at hackathon scope

## Data pipeline decision — SUPERSEDES earlier scraper/ETL/raw_quotes design
- **Live web scraping was dropped for the hackathon MVP** in favor of a CSV-based simulation, to remove anti-bot risk entirely while keeping the index engine's logic identical to what a real scrape would feed it.
- **Three tables, one Postgres database** (explicitly NOT three separate physical databases — DB3 needs to join DB1 and DB2, which requires them in the same database to avoid `postgres_fdw`/`dblink` complexity):
  1. `static_fares` ("DB1") — loaded once from a CSV file at startup, never modified again. Acts as the fixed baseline/base-period fare.
  2. `live_fares` ("DB2") — a mutator function runs every 1 minute, applying randomised variation on top of each `static_fares` row and upserting into this table. This *is* the scraper stand-in.
  3. `index_results` ("DB3") — every 1-minute cycle, a comparison job joins `static_fares` and `live_fares` on (route_id, carrier_id, lead_time_window), computes `fare_diff`, `pct_change`, `relative_price`, and `index_contribution`, and writes one row per pair. Contains all columns from both DB1 and DB2 plus these derived columns.
- The overall index value is `sum(index_contribution)` across the basket, computed on read from `index_results` (no separate `index_values` aggregate table needed for MVP).
- Demo framing: "a real fare snapshot as the static baseline, live market fluctuation simulated on top of it — the comparison/index logic is identical to what it would be against a genuine live scrape."
- The old `raw_quotes` / scraper / ETL-dedup design described earlier in this log is **superseded** by this — `architecture.md` §5–6 have been updated accordingly.

## Two corrections made to the above design (methodology review)
- **`index_results` is append-only, not upserted.** Every 1-minute tick inserts a new batch of rows keyed by `computed_at`; it never overwrites the previous tick. Reason: `/api/v1/index/history` and route trend charts need an actual time series — an upsert-only table would only ever hold the current state, with no history to plot. (`live_fares` can remain upsert-style since only the current live price matters there.)
- **Weight normalization to avoid double-counting.** Since a route can have multiple carriers × lead-time windows, and each produces its own `index_results` row, applying the full route weight to every row would let routes with more rows silently dominate the index. Fixed by a two-pass compare job: (1) average `relative_price` across carriers/windows to get one representative value per route per tick, (2) apply `route_weight` once per route, not once per row. `index_contribution` and the final `sum(index_contribution)` are computed from this normalized per-route value.

## Team split decisions
- 4 backend people, split into 2 pairs (not 4 individual pipeline stages), to reduce coordination overhead:
  - **Group A**: scraper + ETL/data cleaning (writes `fare_quotes`)
  - **Group B**: index engine + Next.js API/auth (index engine writes `index_values`; API person owns Prisma schema, Postgres provisioning, and reads both tables)
- The Next.js/API person in Group B is the de facto **owner of the Postgres schema and migrations**, since Prisma lives in their app — but the schema content itself is a decision made by all four in an hour-one session, not unilaterally.
- Integration checkpoints: end of day 1 (raw → clean → index flows for at least one route) and mid-day 2 (API serves real, not just seeded, data).

## Security decisions
- Auth: NextAuth sessions for dashboard users, hashed (Argon2/bcrypt) API keys for institutional consumers — never mix the two mechanisms
- No internal fields (`source_url_hash`, `raw_payload`, credentials) ever exposed via API responses
- Input validation via Zod on every route; no raw string-built SQL anywhere
- Rate limiting + security headers enforced in `middleware.ts`; fine-grained role/scope checks re-verified in each route handler (defense in depth, not middleware-only)

## Open questions / not yet decided
- [ ] Final choice: Python vs Node for the worker services (affects whether Prisma or a plain DB client is used there)
- [ ] Hosted Postgres provider for the hackathon (Neon / Supabase / Railway / local Docker)
- [ ] Whether the OTA scraper is attempted at all, or dropped in favor of airline-only sources
- [ ] Whether weekly/monthly index and Heatmap/Data Explorer/Alerts make it into the final demo, based on time remaining after core pipeline works
