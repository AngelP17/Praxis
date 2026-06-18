# Praxis

[![CI](https://github.com/AngelP17/praxis/actions/workflows/ci.yml/badge.svg)](https://github.com/AngelP17/praxis/actions)
[![FieldLab Proof](https://github.com/AngelP17/praxis/actions/workflows/fieldlab-proof.yml/badge.svg)](https://github.com/AngelP17/praxis/actions/workflows/fieldlab-proof.yml)
[![Determinism Gate](https://img.shields.io/badge/determinism-gated-brightgreen)](DETERMINISM.md)
[![PPP v0.1](https://img.shields.io/badge/protocol-ppp_v0.1-715bff)](docs/spec/praxis-proof-protocol.md)

**Proof-carrying field deployment for enterprise operations.**

🔗 **Live Demo:** https://praxis-web-eight.vercel.app

### What each badge proves

| Badge | What it verifies |
|-------|------------------|
| **CI** | TypeScript typecheck, Ruff lint, pytest unit/integration, Next.js build, GPT-taste design gate (0 warnings), Playwright smoke tests, CodeQL, Scorecard, secret scan |
| **FieldLab Proof** | Full Floci-backed AWS emulation: SQS/S3/DynamoDB/EventBridge → ontology compile → decision engine → human approval → L0 proof verification → determinism re-run |
| **Determinism Gate** | Bit-identical replay hashes across runs; any tampering changes the SHA-256 proof hash |
| **PPP v0.1** | Conformance to the Praxis Proof Protocol spec for cryptographically verifiable AI decision provenance |

Praxis is a public proof demo and local FieldLab verification system, with a backend path that still requires explicit production hardening. The verified paths today are the frontend-only public demo (`NEXT_PUBLIC_DEMO_MODE=1`), the local FieldLab proof (`make praxis-proof`), and a recorded Docker Compose production proof in `docs/verification/2026-05-19-docker-compose-production-proof.md`. The Compose backend is the recommended self-hosted target, but current `main` verification and environment-specific secrets/origins must be checked before public production use.

Praxis is the reference implementation of the **Praxis Proof Protocol** — the first open spec for cryptographically verifiable AI decision provenance. It turns customer-specific operational signals into executable decision graphs, local proof-of-value environments, audit-ready workflows, and measurable implementation plans.

> **Verify any Praxis proof in one command:**
> ```bash
> uvx praxis-verify ./praxis_proof.json
> ```

### Key Artifacts

| Artifact | Description |
|----------|-------------|
| [PPP Spec v0.1](docs/spec/praxis-proof-protocol.md) | Formal protocol for AI decision provenance |
| [Proof Schema](docs/spec/proof-object.schema.json) | JSON Schema for conformant proof objects |
| [Whitepaper](docs/whitepaper/praxis-proof-protocol.md) | 10-page technical whitepaper |
| [DETERMINISM.md](DETERMINISM.md) | Bit-deterministic proof guarantees |
| [Hiring Pages](docs/for-hiring-managers/) | Role-targeted competency mappings |
| `uvx praxis-verify` | Third-party CLI verifier on PyPI |

## Verified Runtime

The full Floci-backed FieldLab path is verified on every push via `.github/workflows/fieldlab-proof.yml`:

```
Floci start -> health check -> demo run -> proof emit -> L0 verify -> determinism re-run -> optional best-effort signing workflow
```

[View latest CI run](https://github.com/AngelP17/praxis/actions/workflows/fieldlab-proof.yml)

The web app also ships a Next.js `app/api` bridge for frontend stability. In local development it proxies the web UI to the FastAPI gateway; on Vercel it serves deterministic demo payloads for proofs, solution packs, Floci health, replay checks, and pipeline streaming so the public demo remains navigable when the backend is not deployed beside the frontend.

## Release Modes

Praxis currently has two verified release modes and one functional-enough backend path:

- **Frontend-only public demo**: verified. Deploy the Next.js app with `NEXT_PUBLIC_DEMO_MODE=1` and the flagship surfaces run on deterministic demo fallbacks. This is the recommended public showcase path.
- **Local FieldLab proof**: verified. Run `make praxis-proof` after `make praxis-fieldlab-up` to produce a deterministic, auditable proof artifact. This is the recommended technical credibility path.
- **Docker Compose self-hosted**: functional, with a green PR-run CI proof recorded in `docs/verification/2026-05-19-docker-compose-production-proof.md`. The repo ships `docker-compose.yml` + `docker-compose.prod.yml` for running the full backend stack. The API gateway enforces production safety at boot, and `.github/workflows/ci.yml` includes a Compose production-proof job. See [Deployment Guide](docs/architecture/deployment-guide.md) for setup steps, and [Public Launch Checklist](docs/release/public-launch-checklist.md) for remaining hardening items.

Before a real public production launch:

- Replace `SECRET_KEY` with a strong runtime secret
- Set `ALLOWED_ORIGINS` to the real public frontend domains
- Replace or rotate demo credentials in `users.json`
- Validate the chosen backend hosting path

See [docs/release/public-launch-checklist.md](docs/release/public-launch-checklist.md) and [docs/architecture/deployment-guide.md](docs/architecture/deployment-guide.md).

## Prove Praxis Works

Praxis is verified through a local FieldLab run, not a pre-recorded video. The proof path loads the manufacturing solution pack, streams messy events through the Floci-backed FieldLab, compiles an operational ontology, generates a proof-carrying decision, captures a human-approved action, and produces an executive value case.

```bash
make install
make praxis-fieldlab-up
make praxis-flagship-proof
make praxis-fieldlab-down
```

The proof path emits the `artifacts/latest/praxis_proof.json` proof object and the `artifacts/latest/proof-summary.md` executive summary.

> **Tag:** `praxis-v1` — Field-Deployed Decision Platform

## Operational-Resilience Spine

Praxis now also supports a concrete event-driven resilience slice on the existing API path:

```bash
make praxis-seed-graph
make dev-api
make praxis-printer-slice
```

That path emits a `printer.offline` CloudEvent, stores it in `operational_events`, resolves the asset dependency graph, computes a deterministic Astraea decision, writes `decision_records`, records human feedback through the existing approval endpoints, persists a durable outbox row, and replays the decision by recomputing the canonical hash.

See [docs/praxis/printer-offline-slice.md](docs/praxis/printer-offline-slice.md) for the exact commands and proof steps.

## Deterministic Scenario Benchmarks

Every registered scenario produces a stable replay hash. Run `make praxis-scenario-benchmark` to regenerate.
The frontend fallback artifact at `apps/web/src/lib/generated/scenarios.generated.json` is generated from the Python registry with `make praxis-sync-frontend-scenarios`.

| Scenario | Event Type | Risk | Deterministic | Est. Annual Value |
|----------|-----------|------|:---:|-------:|
| Printer GPO Drift | com.praxis.asset.printer.offline | high | True | $38,400 |
| Network Edge Failover | com.praxis.infra.wan.offline | high | True | $47,100 |
| Identity Onboarding Drift | com.praxis.identity.ad.gpo_drift | high | True | $64,800 |
| Database Replication Lag | com.praxis.database.replication.lag | high | True | $110,000 |

Run a single scenario with `make praxis-run-scenario SCENARIO=printer-offline`, all with `make praxis-run-all-scenarios`, or benchmark all with `make praxis-scenario-benchmark`. Sync scenarios to the frontend artifact with `make praxis-sync-frontend-scenarios`.

---

## Screenshots

The committed screenshots below were refreshed from a local production Next.js build with `NEXT_PUBLIC_DEMO_MODE=1`. Regenerate them with:

```bash
NEXT_PUBLIC_DEMO_MODE=1 pnpm web:build
PORT=3200 NEXT_PUBLIC_DEMO_MODE=1 pnpm --filter praxis-web start --hostname 127.0.0.1 --port 3200
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 node scripts/capture-praxis-screenshots.mjs
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 node scripts/capture-all-screenshots.mjs
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 node scripts/capture-demo-screenshots.mjs
BASE_URL=http://127.0.0.1:3200 NEXT_PUBLIC_DEMO_MODE=1 node scripts/capture-readme-screenshots.mjs
```

| Landing | Field Workbench | Proof Object |
|---------|----------------|--------------|
| ![Landing](screenshots/praxis/01-praxis-landing.png) | ![Field Workbench](screenshots/praxis/02-field-workbench.png) | ![Proof Object](screenshots/praxis/03-proof-object.png) |

| Executive Readout | Solution Packs | Command Center |
|-------------------|----------------|----------------|
| ![Executive Readout](screenshots/praxis/04-executive-readout.png) | ![Solution Packs](screenshots/praxis/05-solution-packs.png) | ![Command Center](screenshots/praxis/08-command-center.png) |

| Ontology | Value Case | Console | Dashboard |
|----------|-----------|---------|-----------|
| ![Ontology](screenshots/praxis/06-ontology.png) | ![Value Case](screenshots/praxis/07-value-case.png) | ![Console](screenshots/praxis/09-console.png) | ![Dashboard](screenshots/praxis/10-dashboard.png) |

---

## Demo Video

<!-- TODO: Replace with Loom/video link after recording -->
**90-second fullstack walkthrough** — coming soon.

Script beats:
1. "This is Praxis, a manufacturing operations decision platform."
2. "The frontend is built with Next.js and React."
3. "This workflow starts with a printer outage scenario."
4. "The event is submitted through the UI."
5. "The backend validates and processes the event."
6. "The decision engine generates a recommendation."
7. "A human approves the action."
8. "Praxis emits an audit-ready proof object."
9. "The dashboard updates with measurable value and replay state."

---

## Why Praxis Exists

Enterprises do not fail because they lack dashboards.

They fail because operational knowledge, data, decisions, ownership, and actions are fragmented across tickets, spreadsheets, ERP systems, machine telemetry, tribal knowledge, and vendors.

Praxis turns that fragmentation into a deployable decision graph:

```
Customer data -> Operational ontology -> Decision engine -> Human action -> Audit trail -> Value proof -> Expansion roadmap
```

Dashboards show state. **Praxis drives operational decisions.**

---

## What Praxis Does

1. Ingest messy customer signals (tickets, telemetry, alerts, operator notes)
2. Compile an operational ontology (objects, links, actions, metrics)
3. Simulate the customer workflow locally through **Praxis FieldLab** (Floci-backed AWS emulation)
4. Generate explainable decisions and human-approved actions
5. Produce replayable audit artifacts with cryptographic integrity
6. Build a value case, deployment plan, and executive readout

---

## Target Roles Demonstrated

| Target role | Praxis proof |
|-------------|-------------|
| **Full Stack Engineer** | Builds polished React/Next.js product, connects to real API routes, designs backend workflows, persists data, validates inputs, runs tests, documents architecture, deploys safely, explains business value → [Walkthrough](docs/for-hiring-managers/fullstack-engineer-walkthrough.md) |
| **Solutions Engineer** | Can scope a customer use case, build a technical demo, explain architecture, handle security/compliance, and show business value |
| **GTM Engineer** | Can package repeatable demo systems, solution templates, ROI calculators, customer narratives, and product feedback loops |
| **Forward Deployed Engineer** | Can integrate messy customer data, model operational workflows, build adapters, deploy locally, and iterate with users |
| **Platform Engineer** | Integrates Floci-backed local AWS services to simulate production event pipelines without cloud credentials |

---

## Full Stack Architecture Chain

```
User
  ↓
Next.js / React UI (apps/web/src/app/)
  ↓
Next.js API Route Handlers / Typed API Client (apps/web/src/app/api/, apps/web/src/lib/api.ts)
  ↓
FastAPI Gateway (apps/api_gateway/routes/)
  ↓
Decision Service + Platform Service (services/decision-service/, services/platform-service/)
  ↓
PostgreSQL / Event Store / Proof Objects (infrastructure/db/models/)
  ↓
Dashboard + Audit Export (apps/web/src/app/dashboard/, apps/web/src/app/audit/)

CI/CD: GitHub Actions → Typecheck → Lint → Test → Build → Docker Compose Proof
Deployment: Vercel frontend + Docker Compose backend path
```

---

## Full Stack Engineer Signal

Praxis demonstrates a complete full-stack product workflow:

- **Frontend**: Next.js 16, React 19, Tailwind v4, GSAP, Zustand, Recharts — dashboard UI, scenario workbench, real-time proof surfaces
- **Backend**: FastAPI API gateway, Python decision service (Astraea), platform service — typed APIs, validation, orchestration
- **Data**: Operational events, decision records, proof objects, deterministic replay artifacts, audit log — persisted via SQLAlchemy/PostgreSQL (Docker Compose) or SQLite (local demo)
- **DevOps**: Docker Compose (prod + local), GitHub Actions CI (typecheck, lint, unit, e2e, build, proof), Vercel frontend deploy
- **Product**: Manufacturing operations workflow from raw incident signal → structured event → decision engine → human approval → audit-ready proof → executive value case

---

## Public Demo vs Full Stack Runtime

The public Vercel deployment is optimized as a deterministic showcase (`NEXT_PUBLIC_DEMO_MODE=1`). The full-stack runtime is available locally through Docker Compose and includes the API gateway, decision service, platform service, and proof workflow.

**Frontend-only demo (no backend required):**
```bash
# Deploy to Vercel with:
NEXT_PUBLIC_DEMO_MODE=1
```

**Full stack locally:**
```bash
make install      # Python venv + Node deps
make demo         # Starts API gateway, decision service, platform service, web
make demo-seed    # Seeds flagship scenarios
```

**Self-hosted / cloud backend (recommended for production):**
```bash
cp .env.example .env   # Set SECRET_KEY, POSTGRES_PASSWORD, ALLOWED_ORIGINS
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
curl http://localhost:8000/health
```

Then set `NEXT_PUBLIC_API_URL=http://your-server:8000` in your frontend deployment and remove `NEXT_PUBLIC_DEMO_MODE`.

---

## Flagship Demo: Printer GPO Failure to Executive Value Case

```bash
# 1. Install everything
make install

# 2. Start the full stack for the UI/API demo
make demo

# 3. Seed a known scenario
make demo-seed

# 4. Validate the end-to-end path
make demo-validate

# 5. Reset demo state when done
make demo-reset

# Or run the proof-first artifact path
make praxis-fieldlab-up
make praxis-proof
make praxis-fieldlab-down
```

A plant reports repeated printer failures affecting shipping paperwork. Praxis ingests the signal, maps it to the operational ontology, identifies the affected business process, scores the evidence, routes a human-approved action, generates an audit trail, and builds a value case for standardizing printer deployment governance.

This creates a real, deterministic incident from raw signal to audit export that you can inspect in the web UI at `http://localhost:3000`.

The proof path emits `artifacts/latest/praxis_proof.json` and verifies it with deterministic hash integrity.

---

## Architecture

```
Praxis
├── FieldLab (Floci local AWS substrate)
│   ├── SQS event queues
│   ├── S3 audit and evidence archive
│   ├── DynamoDB operational state
│   ├── EventBridge workflow events
│   └── Lambda-style customer adapters
│
├── Ontology Compiler
│   ├── Customer objects, Assets, Events, Incidents
│   ├── Actions, Stakeholders, Value metrics
│   └── Links, confidence scoring
│
├── Decision Engine
│   ├── Priority scoring (weighted multi-factor)
│   ├── Evidence trust scoring
│   ├── Causal graph reasoning
│   ├── Value-of-information ranking
│   ├── Counterfactual replay
│   └── Human review thresholds
│
├── GTM Engine
│   ├── Solution packs (repeatable demos)
│   ├── ROI model
│   ├── Objection handling
│   ├── Security/compliance answers
│   └── Expansion map
│
└── Field Workbench
    ├── Customer discovery
    ├── Data mapping
    ├── Demo execution
    ├── Implementation plan
    ├── Audit export
    └── Executive readout
```

### Service Architecture

| Service | Responsibility | Tech |
|---------|---------------|------|
| `web` | Landing, command center, dashboard, field workbench, solution packs, ontology, value case, executive readout | Next.js 16, React 19, Tailwind v4, GSAP |
| `api-gateway` | Public API boundary, auth, orchestration, decision explanation, fieldlab, solution packs, ontology | FastAPI |
| `decision-service` | Deterministic scoring, explainability, replay | Python (Praxis core) |
| `platform-service` | SLOs, runbooks, topology, controls, chaos | FastAPI |

---

## Core Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Deterministic scoring** | Same input always produces same output. Auditors can verify. Post-mortems can reconstruct exact reasoning. |
| **Human-in-the-loop** | System recommends. Humans decide. No unilateral automation. Feedback improves future recommendations. |
| **Replay hashes** | SHA-256 of inputs guarantees decision integrity. Any tampering changes the hash. |
| **Provenance-weighted evidence** | Priority and confidence depend on evidence freshness, source reliability, corroboration, and audit completeness. |
| **Counterfactual testing** | Score stability is verified under evidence removal or perturbation. Unstable decisions are flagged for review. |
| **FieldLab local simulation** | Reproduce customer workflows locally through Floci before touching production infrastructure. |
| **Solution packs** | Repeatable demo systems with scenarios, ROI models, objection handling, and security reviews. |

---

## Flagship Algorithms

### Operational Ontology Compiler
Turns messy customer inputs into a structured operational model (Objects + Links + Actions + Metrics + Risks). Maps raw data to object types (Site, Asset, Incident, Vendor, Stakeholder, BusinessProcess) with confidence scoring.

### Evidence Trust Score
Grades the quality of evidence behind recommendations using source reliability, freshness, corroboration, completeness, consistency, and auditability.

### Use Case Qualification Score
Scores whether a customer use case is worth pursuing (pain intensity, data readiness, stakeholder urgency, measurable value, deployability, expansion leverage).

### Value-of-Information Ranking
When data is missing, Praxis identifies which questions to ask first based on expected confidence gain, business impact, and acquisition feasibility.

### Intervention Planner
Turns recommendations into field-safe actions with modes: READ_ONLY, HUMAN_APPROVAL, ASSISTED_ACTION, WRITEBACK (simulated only), BLOCKED.

### Expansion Graph
Shows how a pilot expands into a bigger account, scoring adjacent use cases by shared data model, stakeholder overlap, measurable value, and implementation reuse.

---

## Praxis Field Workbench Flow

```
1. Select Solution Pack
2. Load Customer Context
3. Compile Operational Ontology
4. Start FieldLab (Floci)
5. Stream Events through SQS/S3/DynamoDB
6. Generate Decisions
7. Review Recommendations
8. Capture Human Action
9. Produce Replay Artifact
10. Generate Value Case
11. Generate Executive Readout
12. Generate Deployment Plan
```

---

## Frontend Surface

| Route | Purpose | Role signal |
|-------|---------|-------------|
| `/` | Landing page with live metrics | All |
| `/login` | Demo authentication (operator/admin/viewer) | All |
| `/dashboard` | System health bento overview | Operator |
| `/command-center` | Primary operator work queue with decision explanations | Operator |
| `/console` | Live pipeline console with Floci health and verifier controls | Operator |
| `/board` | Task board for active work items | Operator |
| `/incidents` | Incident list | Operator |
| `/incidents/[id]` | Incident detail with timeline | Operator |
| `/decision` | Decision summary | Operator |
| `/decision-center` | Decision center with counterfactual deltas | Operator |
| `/recommendations` | Active recommendation queue | Operator |
| `/tickets/new` | New ticket creation | Operator |
| `/tickets/[id]` | Ticket detail with comments and attachments | Operator |
| `/field-workbench` | End-to-end customer workflow from discovery to readout | FDSE |
| `/field-workbench/[runId]` | Specific FieldLab run | FDSE |
| `/solution-packs` | Catalog of repeatable demo packs | GTM Engineer |
| `/fieldlab` | Floci-backed local environment status and event flow | Platform/SE |
| `/ontology` | Operational object graph, links, and actions | FDSE |
| `/discovery` | Customer signal discovery and pack matching | FDSE/SE |
| `/value-case` | ROI calculator and assumptions | GTM Engineer |
| `/executive-readout` | CFO/COO-ready summary | GTM/SE |
| `/executive-readout/[runId]` | Specific run readout | GTM/SE |
| `/proof/[proofId]` | Cinematic proof detail, verifier flow, and diff workflow | Solutions Engineer |
| `/proof/diff` | Proof comparison and forensic diff | Solutions Engineer |
| `/expansion-map` | Adjacent use case expansion scoring | GTM Engineer |
| `/event-ingestion` | Raw event ingestion and normalization view | Platform |
| `/platform` | SRE control plane — SLOs, topology, chaos | Platform |
| `/assets` | Infrastructure asset inventory | Operator |
| `/audit` | Audit trail viewer and export | Operator |
| `/replay/[id]` | Point-in-time replay with forensics | Operator |
| `/reports` | Executive and operational reporting | Operator |
| `/readout/[runId]/print` | Print-optimized executive readout | GTM/SE |
| `/why-praxis` | Product positioning and value proposition | All |
| `/admin` | Role-gated admin console | Admin |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 22+
- pnpm 10.29.3 (pinned in root `package.json`)
- PostgreSQL 15+ (or SQLite for local dev)
- Docker (for FieldLab/Floci)

### Install

```bash
make install                # Full setup: Python venv + editable packages + frontend deps
# or
pnpm install                # Frontend-only, from repo root
```

`make install` is the default setup path for any task that touches Python services, proof flows, validation, or demo seeding. Use root `pnpm install` only when you intentionally need Node dependencies without the Python environment.

### Run tests

```bash
make test
```

### Run the full stack

```bash
make demo
```

Then open `http://localhost:3000` for the command center.

**Demo login credentials:**
| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin` | Administrator |
| `operator` | `operator` | Agent (recommended for demo) |
| `viewer` | `viewer` | Read-only |

### FieldLab (requires Docker)

```bash
make praxis-fieldlab-up     # Start Floci local AWS emulation
make praxis-fieldlab-down   # Stop Floci
```

### Solution Packs

```bash
make praxis-demo            # Run the flagship demo
make praxis-validate-pack   # Validate a solution pack
make praxis-readout RUN_ID=xyz  # Generate executive readout
make praxis-run-scenario SCENARIO=printer-offline  # Run a single scenario
make praxis-run-all-scenarios   # Run all registered scenarios
```

---

## Running Praxis

### Option 1 — Frontend demo only (no backend required)

The fastest path. All product surfaces work with deterministic demo data.

Deploy to [Vercel](https://vercel.com) with one environment variable:

```
NEXT_PUBLIC_DEMO_MODE=1
```

`vercel.json` at the repo root is already configured for a frontend-only Next.js deploy.

### Option 2 — Full stack locally

```bash
make install      # set up Python venv + Node deps
make demo         # start API gateway, decision service, platform service, and web on localhost
make demo-seed    # seed the 4 consolidated flagship scenarios
```

Open `http://localhost:3000`. Login credentials: `operator` / `operator` (agent role).

### Option 3 — Self-hosted / cloud backend

The Docker Compose self-hosted path is the recommended backend deployment target. Fly.io and Railway configs also exist as secondary references. All paths require the production hardening steps in [`docs/release/public-launch-checklist.md`](docs/release/public-launch-checklist.md).

| Path | Config file | Status |
|---|---|---|
| **VPS / Docker Compose** (recommended) | [`docker-compose.prod.yml`](docker-compose.prod.yml) | Functional, green PR-run CI proof |
| Fly.io | [`fly.toml`](fly.toml) | Secondary reference |
| Railway | [`railway.toml`](railway.toml) | Secondary reference |

Quick start for the recommended Docker Compose path:

```bash
cp .env.example .env   # edit: set SECRET_KEY, POSTGRES_PASSWORD, ALLOWED_ORIGINS
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
curl http://localhost:8000/health
```

Then set `NEXT_PUBLIC_API_URL=http://your-server:8000` in your frontend deployment and remove `NEXT_PUBLIC_DEMO_MODE`.

Full instructions for all three paths: [docs/architecture/deployment-guide.md](docs/architecture/deployment-guide.md)

---

## Repo Structure

```text
praxis/
├── apps/
│   ├── api_gateway/       # FastAPI gateway + fieldlab, ontology, solution packs
│   └── web/               # Next.js command center + field workbench
├── services/
│   ├── decision-service/  # Praxis decision wrapper
│   └── platform-service/  # K8s platform API
├── packages/
│   ├── astraea-core/      # Deterministic engine + praxis algorithms
│   ├── domain/            # Domain models
│   └── pipelines/         # Ingestion pipelines + fieldlab adapters
├── solution-packs/        # Repeatable demo systems
│   ├── manufacturing-printer-gpo/
│   ├── network-edge-failover/
│   ├── identity-onboarding-drift/
│   └── database-failover-lag/
├── infrastructure/
│   ├── floci/             # FieldLab: docker-compose, terraform, bootstrap
│   ├── db/                # SQLAlchemy models, migrations
│   ├── k8s/               # Kubernetes manifests
│   ├── terraform/         # Infrastructure as code
│   └── monitoring/        # Prometheus, Grafana
├── docs/
│   ├── praxis/            # Positioning, fieldlab, ontology, GTM, FDSE, security
│   ├── adr/               # Architecture decision records
│   └── research/          # Dossier, claim ledger, benchmarks
├── tests/
│   ├── praxis/            # Ontology compiler, evidence trust, use case score, VOI
│   └── integration/       # FieldLab integration, solution pack e2e
├── scripts/               # Demo, validation, executive readout, screenshot capture
└── .github/               # CI workflows, fieldlab-proof, solution-pack-validation
```

---

## Quality Gates

> Commands below derive from the `Makefile`, root `package.json`, and `apps/web/package.json`. If anything here conflicts with those files, the executable is correct. See `AGENTS.md` for the authoritative agent-entry guide.

| Gate | Command | Notes |
|------|---------|-------|
| Python lint | `make lint` | Runs Ruff over `apps`, `packages`, and `services` |
| Python format | `make format` | Runs Ruff formatter over `apps`, `packages`, and `services` |
| Python tests | `make test` | Runs unit and integration tests configured in the Makefile |
| Praxis algorithm/integration tests | `make praxis-test` | Runs `tests/praxis` and `tests/integration` |
| TypeScript check | `pnpm web:typecheck` | Next.js/React type safety |
| Next.js build | `pnpm web:build` | Production web build |
| GPT-taste lint | `pnpm web:lint:gpt-taste:ci` | Praxis design-quality gate (`--max-warnings=0`) |
| Smoke tests | `pnpm web:test:smoke` | Web smoke coverage |
| Demo validation | `make demo-validate` | Requires demo services and seeded data |
| Proof generation and verification | `make praxis-proof` | Emits and verifies `artifacts/latest/praxis_proof.json` |
| Benchmark suite | `make praxis-benchmark` | Validates all current solution packs |
| Scenario benchmark | `make praxis-scenario-benchmark` | Benchmarks all registered deterministic scenarios |
| Floci runtime check | `make praxis-floci-verify` | Requires `make praxis-fieldlab-up` |
| Canvas integrity | `make praxis-canvas-verify` | Checks Praxis canvas/source references |
| Proof hash integrity | `make praxis-proof-hashes` | Checks active proof code for fake hashes |
| Full Praxis validation | `make praxis-validate-all` | Chains lint + test + benchmark + floci + canvas + hashes; requires Floci running |

For doc-only work, prefer targeted `rg` checks and only add `make praxis-canvas-verify` or `make praxis-proof-hashes` when the edited docs affect canvas/proof guidance directly.

### Benchmarks

The benchmark suite validates all solution packs end-to-end:

| Pack | Scenario | Events | Proof Valid | Value Case |
|------|----------|--------|-------------|------------|
| `manufacturing-printer-gpo` | Printer GPO deployment drift | 12 | **PASS** | $38.4K |
| `network-edge-failover` | Network Edge Failover | 8 | **PASS** | $47.1K |
| `identity-onboarding-drift` | Identity Onboarding Drift | 8 | **PASS** | $64.8K |
| `database-failover-lag` | Database Replication Lag | 12 | **PASS** | $110.0K |

Run benchmarks:

```bash
make praxis-benchmark
```

The benchmark framework is extensible — additional scenarios (custom network failures, access drifts, replication issues, contradictory evidence, missing evidence) can be added as new solution packs under `solution-packs/`.

### FieldLab Runtime Verification

Use this when you need a durable local proof that Praxis is exercising the full FieldLab path:

```bash
make praxis-fieldlab-up
make praxis-validate-all
make praxis-fieldlab-down
```

`make praxis-validate-all` chains Python lint, tests, benchmarks, Floci runtime verification, canvas integrity, and proof-hash integrity. If the Floci container is not running or Docker is unavailable, the Floci verification step should fail loudly instead of silently falling back.

---

## License

MIT
