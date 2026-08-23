# rules.md — Conventions & AI Assistant Boundaries

> Read `PRD.md` and `architecture.md` first. This file governs *how*
> code should be written, and what an AI assistant helping with this
> codebase should and should not do on its own.

---

## 1. What to Use

| Area | Use |
|---|---|
| Frontend/API framework | Next.js 14+ App Router, TypeScript everywhere (no plain JS files) |
| Styling | Tailwind CSS + shadcn/ui components |
| Charts | Recharts |
| State management (frontend) | Zustand |
| Routing | Next.js file-based routing (no React Router inside the Next.js app) |
| API client (frontend → backend) | Axios or native `fetch` — pick one and stay consistent |
| ORM | Prisma (Next.js side only) |
| Validation | Zod, for every API route's input |
| Auth | NextAuth (Auth.js) for sessions; custom middleware for API keys |
| Python workers (if used) | `requests`/`httpx`, Scrapy or Playwright for scraping, `pandas` for ETL/index math, `psycopg2` or SQLAlchemy for Postgres access |
| Node workers (if used) | Playwright or Crawlee for scraping, same Prisma client as `apps/web` |
| Linting/formatting | ESLint + Prettier (JS/TS), `black` + `ruff` (Python) |

## 2. What to Avoid

- **No raw SQL string concatenation**, ever — Prisma's query builder, tagged-template `$queryRaw`, or parameterized queries only.
- **No business logic inside `middleware.ts`** beyond auth/rate-limit/header checks — scope/role logic belongs in the route handler.
- **No scraping logic inside Next.js API routes** — scraping is worker-only; a Route Handler must never make an outbound request to an airline/OTA site.
- **No hardcoded secrets** in any file — not even "temporarily," not even in worker scripts.
- **No new database tables or column renames without updating `architecture.md`** — the schema is a shared contract, not something to change unilaterally.
- **No skipping input validation** on any route "just for the demo" — validate first, always.
- **No exposing internal-only fields** (`source_url_hash`, `raw_payload`, `scrape_job_id`, credentials) through any API response.
- **Don't add authentication bypass "for testing"** and leave it in — if a temporary bypass is needed, it must be clearly marked and removed before demo.

## 3. Error Handling

### API routes (Next.js)
- Every route wraps logic in try/catch; unexpected errors return `500` with a generic message (no stack traces or internal details in the response body)
- Validation failures return `400` with a clear, specific error (which field, why)
- Auth failures return `401` (unauthenticated) or `403` (authenticated but insufficient scope) — never conflate the two
- Standard error shape:
```json
{ "error": { "code": "invalid_query", "message": "lead_time_window must be one of T+1, T+15" } }
```

### Workers
- Every scrape job, ETL batch, and index computation run is wrapped so a single failure (one route/airline failing) does not crash the whole run
- Failures are logged with enough context to retry (which job, which input) — never silently swallowed
- A failed worker run must not partially write inconsistent data (wrap DB writes in a transaction per batch where possible)

## 4. Boundaries of AI Assistance

When an AI assistant (Claude or otherwise) is helping build this codebase, it should:

- **Follow `architecture.md`'s folder structure and schema exactly** — not invent a different structure, even if it seems cleaner, without flagging the change first
- **Never invent new API endpoints** outside the contract in `architecture.md` without calling it out as a proposed addition
- **Never silently change the database schema** — propose the change, explain what it affects (workers + web both), and only proceed once acknowledged
- **Ask before removing MVP scope cuts** — e.g. don't "helpfully" add the full 5-airline/5-window scraper when the team has explicitly scoped to 2 airlines/2 windows for the hackathon
- **Flag security-relevant code explicitly** — any change touching auth, API keys, or rate limiting should be called out, not buried in a larger diff
- **Not fabricate DGCA figures or scraped data** — if real data isn't available yet, generate clearly-labeled synthetic/seed data, and say so
- **Default to the simplest working version** for hackathon scope, and mention (not silently implement) the "production-grade" alternative when relevant

## 5. General Rules

- **Schema-first workflow**: any change to `fare_quotes`, `index_values`, or `api_keys` must be agreed by whoever owns the Next.js/Prisma side and whoever owns the workers, since both depend on it
- **Seed data always available**: the app should never be in a state where it can't run because real scraped/index data doesn't exist yet
- **Commit messages**: short, imperative (`add lead-time endpoint`, `fix fare dedup logic`), no need for strict conventional-commits formatting given hackathon timeline
- **Testing**: not a hard requirement for hackathon MVP, but any dedup/index-computation logic should have at least one script/test verifying it against a known sample input, since judges may ask about correctness
- **Keep this file updated**: if the team changes a decision (e.g. switches workers from Python to Node), update `rules.md` and `architecture.md` together, not just one
