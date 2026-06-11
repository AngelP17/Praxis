# Praxis Fullstack Case Study

## Problem

Manufacturing teams have fragmented operational signals across tickets, devices, vendors, and tribal knowledge. A printer going offline at Plant-TX creates a ticket in one system, telemetry in another, vendor logs in a third, and the root cause (GPO permission drift) lives in Active Directory — nowhere connected, nowhere actionable.

Traditional dashboards show state. They don't drive decisions.

## Solution

Praxis turns fragmented signals into a deployable decision graph:

```
Customer data → Operational ontology → Decision engine → Human action → Audit trail → Value proof → Expansion roadmap
```

For the printer scenario: Praxis ingests the `com.praxis.asset.printer.offline` CloudEvent, compiles an operational ontology (Site, Asset, BusinessProcess, Incident links), scores evidence trust (0.87), computes priority (87), routes a human-approved remediation (GPO override + spooler restart), emits a deterministic proof object with SHA-256 replay hash, and builds a $38.4K annual value case for standardized printer deployment governance.

## My role

Designed and implemented:
- Frontend surfaces: Next.js 16 App Router, 30+ routes, typed API client, GSAP scroll animations, Praxis design system (Tailwind v4 tokens)
- Backend workflow model: FastAPI gateway with 25 routers, Pydantic validation, SQLAlchemy async ORM
- API integration: Next.js Route Handlers as typed proxies with deterministic demo fallbacks
- Proof path: Deterministic Astraea decision engine, replay hashes, L0/L1/L2 verification, executive readout
- Documentation: Architecture, API contracts, deployment guide, hiring walkthroughs, case studies
- Test strategy: Playwright E2E (smoke + fullstack journey), pytest unit/integration, CI matrix
- Deployment path: Vercel frontend, Docker Compose backend, production hardening checklist

## Technical decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js App Router + Route Handlers** | Server Components by default, typed API layer, streaming, native proxy/fallback pattern for demo reliability |
| **FastAPI + Pydantic** | Automatic OpenAPI, request validation at boundary, async SQLAlchemy, type-safe schemas shared with frontend via generated types |
| **Docker Compose for local stack** | Reproducible Postgres + Floci (local AWS SQS/S3/DynamoDB/EventBridge) without cloud credentials |
| **Playwright for E2E** | Real browser, parallel, CI-friendly, tests user journeys not implementation details |
| **Deterministic proof hashes** | SHA-256 of canonical inputs guarantees audit integrity; tampering changes hash |
| **Human-in-the-loop** | System recommends, humans decide — no unilateral automation; feedback improves future scores |

## Tradeoffs

- **Public demo uses deterministic fallback payloads** — Vercel deployment runs without backend; Next.js Route Handlers serve demo data from `praxis-demo-data.ts` so flagship surfaces never 404. This optimizes for recruiter accessibility over architectural purity.
- **Full backend path runs through Docker Compose** — Not hosted on Fly/Railway/Render yet. The Compose production proof job in CI is green, but a live hosted backend would strengthen the "production path" story.
- **Production hardening requires secret rotation, origin configuration, and hosted backend validation** — Documented in `docs/release/public-launch-checklist.md` and `docs/architecture/deployment-guide.md`. Current `SECRET_KEY` and `ALLOWED_ORIGINS` are demo placeholders.
- **Auth is demo-only** — Role-based (operator/manager/admin/auditor) via `users.json` and JWT in `apps/api_gateway/routes/auth.py`. No external IdP (Auth0/Clerk) integrated.

## What I would improve next

1. **Hosted backend deployment** — Fly.io or Railway with managed Postgres, real TLS, health checks wired to uptime monitoring
2. **Real auth provider** — Clerk or Auth0 with org/role mapping, replacing demo `users.json`
3. **Persistent Postgres production instance** — Managed (Neon, Supabase, RDS) with migration strategy (Alembic) and backup/restore tested
4. **Expanded E2E coverage** — Full decision→approval→proof→dashboard→audit journey in Playwright (currently: command-center, CTA, surface-expansion + new fullstack-proof-path)
5. **Role-based audit workflow** — Auditor role sees proof diff, export, compliance packaging; Admin manages solution packs/config
6. **Observability dashboard** — `/metrics` already exposed; wire to Grafana with SLO burn-rate alerts for decision latency, proof verification rate, event ingest throughput