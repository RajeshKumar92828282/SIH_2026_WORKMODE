# PRD.md — APIx (Airfare Price Index)

> Read this first. This document defines *what* to build and *for
> whom*. See `architecture.md` for *how* it's structured,
> `rules.md` for coding conventions, `design.md` for visual/API
> design, and `memory.md` for decisions already made.

---

## 1. One-liner

A real-time Airfare Price Index for India, built by scraping airline
and OTA fare data, cleaning it, and computing a CPI-style weighted
index — to augment the official Consumer Price Index's air-travel
sub-group, which currently relies on sparse manual price collection.

## 2. Problem Statement (source: SIH hackathon brief)

The NSO's CPI collects air-fare data manually, from a limited set of
outlets, even though 90%+ of domestic tickets are now sold online with
highly dynamic pricing (200–400% intraday swings driven by advance-
booking window, day-of-week, season, and fuel surcharges). There is no
automated, high-frequency system that reflects what Indian travellers
actually pay. This project builds one.

## 3. Target Users

| User | What they need from APIx |
|---|---|
| **RBI (monetary policy)** | A reliable, high-frequency airfare index to inform inflation-targeting decisions |
| **NSO / MoSPI** | Data to augment the official CPI transport sub-group |
| **Govt agencies (DGCA, etc.)** | Cross-validation against their own traffic/fare data |
| **Researchers / academics** | Historical, queryable fare data via API and Data Explorer |
| **Analysts** | Route/airline/lead-time comparisons, trend visualisation |

All of the above are treated as **institutional API consumers** or
**dashboard users** — there is no general public signup flow in this
project's scope.

## 4. What to Build — Feature List

### Frontend (React/Next.js, already scaffolded — see existing `APIx_Frontend_README.md`)
- Airfare Price Index Dashboard (overview, current value, trend)
- Route Trend Analysis
- Lead-Time (advance booking) Analysis
- Airline Comparison
- India Heatmap (state-level index)
- Data Explorer
- Alerts & Notifications
- API Access & Documentation
- Methodology & Data Quality page
- Authentication (institutional login / API key display)

### Backend — Next.js API layer
- REST API (`/api/v1/*`) serving all of the above, read-only from the consumer's perspective
- Auth: session login (NextAuth) for dashboard users, API keys for institutional consumers
- Admin endpoints: issue/revoke API keys, manage organizations

### Backend — Worker services (Python, or Node — see `architecture.md`)
- Scraper: pulls fares from airline sites + OTAs on a schedule
- ETL: cleans, deduplicates, decomposes fares (base/tax/fees), filters bad data
- Index engine: computes the weighted APIx daily/weekly/monthly, runs back-tests against DGCA data

## 5. MVP Scope (hackathon-realistic)

**In scope:**
- 2 airlines, 1 OTA (optional), 3 routes (DEL-BOM, DEL-BLR, BOM-BLR)
- 2 lead-time windows (T+1, T+15)
- Daily index only
- Dashboard, Routes, Lead-Time pages wired to real API
- API-key auth demoed live
- Basic backtest chart vs published DGCA averages

**Explicitly out of scope for MVP** (describe as "designed, not built"):
- Full 5-airline, multi-route, 5-window coverage
- Weekly/monthly index (trivial extension, add only if time remains)
- Heatmap, Data Explorer, Alerts (build only if core flow is done early)
- Full RBAC tiers, Kafka/queue infra, Vault secrets, multi-region DR
- CAPTCHA-solving, proxy-rotation infrastructure at scale

## 6. Success Criteria (demo)

One real end-to-end trace, told as a story: *a real fare scraped this
morning → cleaned by the ETL pipeline → reflected in today's index
value → compared against DGCA's published average → retrievable via
an authenticated API call, as RBI/NSO would consume it.*

## 7. Non-Goals

- This is not a booking or ticketing platform — no purchase flow, ever.
- This is not a general-public consumer app — access is institutional/analyst-oriented.
- This does not need to defeat every airline anti-bot measure — partial, honest coverage is acceptable and expected.
