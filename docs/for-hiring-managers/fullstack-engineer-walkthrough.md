# Praxis Full Stack Engineer Walkthrough

## What this project demonstrates

Praxis is a complete full-stack product demonstrating:

**Frontend** (Next.js 16, React 19, Tailwind v4, GSAP, Zustand, Recharts):
- 30+ product routes in `apps/web/src/app/` — landing, command center, dashboard, field workbench, console, proof surfaces, ontology, value case, executive readout
- Typed API client in `apps/web/src/lib/api.ts` and `apps/web/src/lib/praxis-client.ts` — separates UI from transport
- 60+ Next.js Route Handlers in `apps/web/src/app/api/` proxying/falling back deterministically
- Design-quality gate via `gpt-taste` ESLint plugin (`pnpm web:lint:gpt-taste:ci` — zero warnings)

**Backend** (FastAPI, Python 3.12):
- API gateway with 25 routers in `apps/api_gateway/routes/` — events, decisions, proofs, fieldlab, ontology, solution packs, tickets, audit, auth
- Pydantic schemas in `apps/api_gateway/schemas/` for request/response validation
- Decision service (`services/decision-service/`) wrapping deterministic Astraea core (`packages/astraea-core/`)
- Platform service (`services/platform-service/`) for SLOs, topology, runbooks

**Data** (SQLAlchemy, PostgreSQL via Docker Compose, SQLite dev):
- 30+ models in `infrastructure/db/models/` — OperationalEvent, DecisionRecord, AuditRecord, ProofObject, OutboxMessage, AssetEdge, User, etc.
- Append-only event store for audit/proof integrity
- Deterministic replay hashes (SHA-256) for decision verification

**DevOps**:
- 8-job CI in `.github/workflows/ci.yml` — typecheck, lint, unit, integration, e2e, build, proof, Docker Compose production proof, CodeQL, Scorecard, secret scan
- FieldLab proof workflow in `.github/workflows/fieldlab-proof.yml` — full Floci-backed AWS emulation
- Docker Compose prod + local configs (`docker-compose.yml`, `docker-compose.prod.yml`)
- Vercel frontend deploy configured via `vercel.json`

**Product**: Manufacturing operations workflow — raw signal → structured event → decision engine → human approval → audit-ready proof → executive value case

## Flagship workflow

**Printer GPO Drift → Event Intake → Decision Run → Human Approval → Proof Object → Dashboard Update → Audit Export**

Exact commands to reproduce:

```bash
# 1. Full stack locally (API gateway, decision service, platform service, web)
make install
make demo
make demo-seed

# 2. Or: Proof-first artifact path (FieldLab + Floci)
make praxis-fieldlab-up
make praxis-flagship-proof
make praxis-fieldlab-down

# 3. Operational-resilience spine (printer offline slice)
make praxis-seed-graph
make dev-api
make praxis-printer-slice
```

Open `http://localhost:3000` → login `operator` / `operator` → navigate to `/field-workbench?pack=manufacturing-printer-gpo`

## 10-minute verification path for a reviewer

```bash
# Frontend verification (runs in CI on every PR)
cd apps/web
pnpm typecheck          # TypeScript strict mode, no `any`
pnpm lint:gpt-taste:ci  # Design-quality gate, zero warnings
pnpm test:smoke         # Playwright: command-center, CTA audit, surface expansion + NEW fullstack-proof-path
pnpm build              # Next.js production build

# Backend verification
make lint               # Ruff over apps/, packages/, services/
make test               # pytest unit + integration
make praxis-test        # Algorithm + FieldLab integration tests
```

Open these routes after `make demo` + `make demo-seed`:
- `/field-workbench?pack=manufacturing-printer-gpo` — end-to-end customer workflow
- `/proof/fieldlab_run_manufacturing_printer_gpo?pack=manufacturing-printer-gpo` — cinematic proof detail + verifier
- `/dashboard` — live/snapshot system health bento
- `/audit` — audit trail viewer with export

## API quick tour

Key endpoints (FastAPI serves interactive Swagger at `http://localhost:8000/docs`):

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/events/ingest` | Ingest operational event (CloudEvents or raw) |
| `GET` | `/api/events` | List events with optional source filter |
| `POST` | `/api/decisions/evaluate` | Run deterministic decision scoring |
| `POST` | `/api/decisions/{id}/approve` | Record human approval/rejection |
| `POST` | `/api/decisions/{id}/replay` | Verify deterministic replay hash |
| `GET` | `/api/proofs/{proof_id}` | Fetch proof object |
| `POST` | `/api/proofs/verify` | Verify proof integrity (L0/L1/L2) |
| `GET` | `/health` | Backend health check |
| `GET` | `/metrics` | Prometheus metrics |

Full OpenAPI contract: `docs/10-api-contracts.md` and `apps/api_gateway/schemas/`

## 90-second demo video script

1. "This is Praxis, a manufacturing operations decision platform."
2. "The frontend is built with Next.js 16 and React 19."
3. "This workflow starts with a printer outage scenario — a Zebra printer at Plant-TX goes offline, blocking shipping paperwork."
4. "The event is submitted through the Field Workbench UI, validated by a typed API client against Zod schemas."
5. "The FastAPI gateway receives it, Pydantic validates the payload, and it's persisted to Postgres as an OperationalEvent."
6. "The Astraea decision engine scores it — evidence trust, priority, causal graph — and generates a recommendation."
7. "A human (Operator role) reviews and approves the action via the decision center."
8. "Praxis emits an audit-ready proof object with a deterministic SHA-256 replay hash."
9. "The dashboard updates with measurable value ($38.4K annual), proof status, and audit export."

## Interview pitch paragraph

> Praxis is a full-stack product demo for manufacturing operations. It takes messy operational signals — like a printer or network incident — turns them into structured events, runs them through a backend decision workflow, requires human approval, and emits an audit-ready proof object.
>
> The frontend is built with Next.js and React, and the backend path uses FastAPI services, Python decision logic, Docker Compose, and deterministic proof artifacts. What I wanted to show is not just a pretty UI, but the full application lifecycle: user workflow, API integration, backend processing, validation, testing, deployment, and production reliability.