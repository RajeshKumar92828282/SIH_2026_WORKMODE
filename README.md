<<<<<<< HEAD
# APIx — Real-time Airfare Price Index for India

**SIH 2026 Hackathon Project** — Augmenting NSO/MoSPI's CPI transport sub-index using automated airfare data.

## Architecture Overview

```
┌─────────────┐    CSV/ETL    ┌──────────────────┐    1 min ticks    ┌─────────────────┐
│ Static CSV  │ ────────────► │  static_fares    │ ────────────────► │  live_fares     │
│ (Kaggle)    │  (one-time)   │  (DB1 - baseline)│  (±5% mutation)   │  (DB2 - snapshots)│
└─────────────┘               └──────────────────┘                   └────────┬────────┘
                                                                               │
                                                                               ▼
┌─────────────────────┐  Prisma/REST    ┌──────────────────┐       ┌─────────────────┐
│  Next.js Dashboard  │ ◄────────────── │  /api/v1/*       │ ◄───── │  index_results  │
│  (Frontend + API)   │                 │  (REST API)      │        │  (DB3 - index)  │
└─────────────────────┘                 └──────────────────┘        └─────────────────┘
```

**Core Principle**: Workers (Python) and API (Next.js) **never communicate directly** — PostgreSQL is the only contract.

## Monorepo Structure

```
apix/
├── apps/
│   ├── web/                    # Next.js 16 (App Router) — Frontend + Backend
│   │   ├── app/
│   │   │   ├── (dashboard)/    # Dashboard pages (9 pages)
│   │   │   ├── api/v1/         # REST API endpoints
│   │   │   │   ├── index/              # Current index
│   │   │   │   ├── index/history       # Time series
│   │   │   │   ├── routes/             # Route analysis
│   │   │   │   ├── airlines/           # Carrier comparison
│   │   │   │   ├── lead-time/          # Advance booking windows
│   │   │   │   ├── heatmap/            # State-level visualization
│   │   │   │   ├── observations/       # Raw fare browser
│   │   │   │   ├── alerts/             # Notifications
│   │   │   │   ├── auth/               # Login/register
│   │   │   │   └── admin/              # Admin endpoints
│   │   │   └── login/
│   │   ├── lib/                # Auth, DB, rate-limit, validation
│   │   └── src/components/     # React components (charts, layout)
│   │
│   └── workers/                # Python worker engine
│       ├── src/
│       │   ├── scheduler.py           # Main loop (1-min ticks)
│       │   ├── loader/                # CSV → static_fares (once)
│       │   ├── mutator/               # static → live_fares (upsert)
│       │   ├── index_engine/          # live vs static → index_results
│       │   └── database/              # SQLAlchemy models
│       └── Flight_hackathon/          # ETL pipeline (clean CSV)
│
├── packages/
│   ├── db/                     # Prisma schema + client
│   │   └── prisma/schema.prisma    # 11 models
│   └── shared-types/           # TypeScript DTOs for API contract
│
└── AI_INFO/                    # Architecture docs, PRD, decisions log
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL (Neon/Supabase/local)

### 1. Database Setup
```bash
# Copy env template
cp packages/db/.env.example packages/db/.env
# Edit DATABASE_URL

# Generate Prisma client & run migrations
npm run db:generate
```

### 2. Seed Data
```bash
# Creates routes, carriers, admin user, organizations, demo API key
npx tsx packages/db/prisma/seed-admin.ts
```

### 3. Run Workers (separate terminal)
```bash
cd apps/workers
python -m venv .venv && source .venv/bin/activate
pip install -r src/requirements.txt
python src/scheduler.py --once  # Test single cycle
# python src/scheduler.py       # Run continuous
```

### 4. Start Web App
```bash
npm install
npm run dev:web  # http://localhost:3000
```

## API Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/v1/index` | API Key (`read:index`) | Current index value |
| `GET /api/v1/index/history` | API Key (`read:index`) | Time series (supports `?from=&to=&limit=`) |
| `GET /api/v1/routes` | API Key (`read:routes`) | All routes with stats |
| `GET /api/v1/routes/:id` | API Key (`read:routes`) | Route detail with pagination |
| `GET /api/v1/airlines` | API Key (`read:index`) | Carrier comparison |
| `GET /api/v1/lead-time` | API Key (`read:index`) | T+1 vs T+15 analysis |
| `GET /api/v1/heatmap` | API Key (`read:index`) | State-level index |
| `GET /api/v1/observations` | API Key (`read:observations`) | Paginated fare browser |
| `GET /api/v1/alerts` | API Key (`read:index`) | Fare spike notifications |
| `POST /api/v1/auth/register` | Public | User registration |
| `POST /api/v1/auth/login` | Public | Session login (cookie) |
| `GET /api/v1/auth/me` | Session | Current user |
| `POST /api/v1/auth/logout` | Session | Clear session |
| `GET /api/v1/admin/*` | API Key (`admin`) | Admin management |

### Authentication
- **Dashboard users**: Email/password → httpOnly session cookie (`/api/v1/auth/login`)
- **Institutional consumers**: `Authorization: Bearer apix_live_...` (scoped API keys)

## Development

### Adding New API Endpoints
1. Add Zod schema in `apps/web/lib/validation/index.ts`
2. Create route handler in `apps/web/app/api/v1/.../route.ts`
3. Use `requireApiKey(req, 'scope')` or `requireAdmin(req)` from `lib/auth-middleware.ts`
4. Export types in `packages/shared-types/index.ts`

### Database Changes
1. Edit `packages/db/prisma/schema.prisma`
2. Run `npm run db:generate` (creates migration + regenerates client)
3. Update Python models in `apps/workers/src/database/models.py` to match

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 18 + Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Recharts |
| State | Zustand |
| Backend API | Next.js Route Handlers + Middleware (proxy.ts) |
| Auth | Custom JWT (session) + API Keys (SHA-256) |
| ORM | Prisma → PostgreSQL |
| Database | PostgreSQL (Neon for cloud) |
| Workers | Python 3.11 + SQLAlchemy + APScheduler |
| ETL | Pandas + custom pipeline |
| Rate Limiting | In-memory (per-tier) |

## Key Design Decisions

See `AI_INFO/memory.md` for full decision log. Highlights:
- **Simulation over scraping**: CSV baseline + ±5% mutation = "live" data for hackathon
- **Three tables, one DB**: `static_fares`, `live_fares`, `index_results` in same PostgreSQL
- **Index math**: Laspeyres-style, observation-weighted, base=100, append-only history
- **Auth separation**: Dashboard sessions vs institutional API keys — never mixed
- **Workers decoupled**: SQLAlchemy in Python, Prisma in Node — DB schema is the contract

## License

Internal hackathon project — not for production use without security review.
=======
# SIH_2026_WORKMODE
>>>>>>> e226e59b9d01947e8a296701da071adb56b534d4
