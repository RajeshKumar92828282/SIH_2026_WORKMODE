# design.md — Visual & API Design

> Covers both UI design (for the frontend/dashboard) and API response
> design (for the backend). Read `architecture.md` for the underlying
> structure this styles.

---

## 1. Visual Design Tokens (from the architecture diagram / brand)

| Category | Color meaning | Use for |
|---|---|---|
| Blue | User / Institution layer | RBI, NSO, Govt Agencies, Analysts entry points |
| Green | Frontend | Dashboard, Routes, Airlines, Heatmap, Data Explorer, Alerts, API Access, Methodology cards |
| Purple | API layer | Auth, rate limiting, request validation, endpoint routing visuals |
| Amber/Yellow | Backend services | Scraper, ETL, index engine, service boxes |
| Red/Pink | Data layer | PostgreSQL, time-series store, cache, file storage |
| Orange | External data sources | Airline websites, OTAs, DGCA/govt data |
| Gray | Infra/DevOps | Reverse proxy, containers, CI/CD, monitoring |

Keep this palette consistent across any new architecture diagrams,
slides, or dashboard section headers so the whole project reads as
one system, not disconnected pieces.

## 2. UI Design Principles (Dashboard)

- **Framework**: Tailwind CSS + shadcn/ui components — don't hand-roll custom component primitives that shadcn already provides (buttons, cards, tables, dialogs)
- **Charts**: Recharts for all trend lines, bar comparisons, and heatmaps — keep chart styling consistent (same axis fonts, same color mapping for index-up/index-down)
- **Layout pattern per page**: a summary/stat row at top (current index value, % change, freshness indicator) → main visualization → supporting table/detail below. Every dashboard page (Routes, Airlines, Lead-Time) should follow this same top-to-bottom rhythm so users don't have to relearn layout per page.
- **Color for data direction**: consistent green = index down (cheaper fares), red = index up (costlier fares) — decide this once and use it everywhere, including the Heatmap.
- **Typography**: one clear heading hierarchy (page title → section heading → card label) — avoid more than 3 levels of heading weight/size on a single page.
- **Loading & freshness**: every data view should show *when* the underlying data was last updated (scrape/ETL timestamp) — this matters for institutional trust in the data, not just aesthetics.
- **Empty/seed states**: while real scraped data is still being wired in, show clearly-labeled "sample data" states rather than blank screens — useful both for demoing early and for judges understanding what's real vs illustrative.

## 3. API Design Conventions

- **Versioned base path**: all endpoints under `/api/v1/*` — no unversioned routes.
- **Resource-oriented naming**: `/routes`, `/routes/{routeId}`, `/airlines` — plural nouns, no verbs in the path.
- **Response envelope** (consistent across all endpoints):
```json
{
  "data": { },
  "meta": { "generated_at": "2026-08-22T10:00:00Z" }
}
```
- **Error shape** (see `rules.md` §3): always `{ "error": { "code": "...", "message": "..." } }`, never a bare string or stack trace.
- **Pagination** (for `/observations` and similar list endpoints): `?page=1&limit=50`, with `meta.total` and `meta.page` in the response.
- **Filtering**: query params only (`?route=DEL-BOM&lead_time=T+1&from=2026-08-01&to=2026-08-20`), no filtering via request body on GET routes.
- **Dates**: ISO 8601 (`YYYY-MM-DD` or full timestamp), always UTC, always explicit — never locale-dependent date strings.
- **Auth signaling**: `401` = no/invalid credentials, `403` = valid credentials but insufficient scope — frontend and API docs should describe this distinction clearly so institutional consumers can debug their own integration.

## 4. Documentation Page (`/methodology`, `/api-access`)

- The Methodology page should plainly explain: route basket, weighting source (DGCA traffic share), base period, what's included in "total fare," and how missing/outlier data is handled — this is both a judge-facing and RBI/NSO-facing trust requirement, not just a nice-to-have page.
- The API Access page should show: how to obtain an API key, the exact `Authorization: Bearer <key>` header format, one example request/response per major endpoint, and current rate limits per tier.
