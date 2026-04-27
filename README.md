# Aether Sentinel

[![CI](https://github.com/AngelP17/aether-sentinel/actions/workflows/ci.yml/badge.svg)](https://github.com/AngelP17/aether-sentinel/actions)

**Operational intelligence platform for explainable incident decisions, human-in-the-loop workflows, and replayable audit trails.**

Aether Sentinel turns noisy operational signals into deterministic, explainable, and replayable action. It is not a dashboard. It is a closed-loop decision system for manufacturing and infrastructure operations.

---

## 60-Second System Tour

1. **Signal arrives** from machine telemetry, ticketing, Kubernetes alerts, or operator notes.
2. **Event is normalized** into a canonical operational event with schema validation.
3. **Astraea scores** severity, urgency, business impact, SLA risk, recurrence, dependency criticality, actionability, and uncertainty.
4. **Aether correlates** the event into an incident and routes the workflow.
5. **A human operator** accepts, rejects, or overrides the recommendation.
6. **The system preserves** replay hashes, explanations, feedback, and platform evidence for audit.

---

## Why This Is Not a Dashboard

A dashboard displays state.
Aether Sentinel changes the operational decision loop.

The system is built around **decision accountability**:
- What happened
- Why it mattered
- What was recommended
- Who acted
- How the decision can be replayed

Most systems show you that CPU is high.
Aether Sentinel tells you that this CPU spike correlates with a ticket from three days ago, affects a business-critical workflow, and should be routed to the on-call engineer who resolved the last similar incident.

---

## Flagship Demo Path

```bash
# 1. Install everything
make install

# 2. Start the full stack
make demo

# 3. Seed a known scenario
make demo-seed

# 4. Validate the end-to-end path
make demo-validate
```

This creates a real, deterministic incident from raw signal to audit export that you can inspect in the web UI at `http://localhost:3000`.

---

## Architecture

```text
Signal Ingestion -> Event Normalization -> Astraea Decision Engine ->
Incident Correlation -> Aether Workflow -> Human Feedback -> Replay/Audit
```

| Service | Responsibility | Tech |
|---------|---------------|------|
| `web` | Command center, incident detail, replay UI | Next.js 16, React 19, Tailwind v4 |
| `api-gateway` | Public API boundary, auth, orchestration | FastAPI |
| `decision-service` | Deterministic scoring, explainability, replay | Python (Astraea) |
| `platform-service` | SLOs, runbooks, topology, controls, chaos | FastAPI |

---

## Core Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Deterministic scoring** | Same input always produces same output. Auditors can verify. Post-mortems can reconstruct exact reasoning. |
| **Human-in-the-loop** | System recommends. Humans decide. No unilateral automation. Feedback improves future recommendations. |
| **Replay hashes** | SHA-256 of inputs guarantees decision integrity. Any tampering changes the hash. |
| **SLO-backed evidence** | Infrastructure incidents are judged by user-facing impact, not just symptoms. |
| **Immutable records** | Raw events are never modified. Decision records are append-only. Evidence is checksummed. |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 22+
- pnpm
- PostgreSQL 15+ (or SQLite for local dev)

### Install

```bash
make install
```

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

### Manual service start

```bash
# API Gateway
uvicorn apps.api_gateway.main:app --reload --port 8000

# Platform Service
uvicorn services.platform-service.src.main:app --reload --port 8080

# Decision Service
uvicorn services.decision-service.main:app --reload --port 8001

# Web App
cd apps/web && pnpm dev
```

---

## Repo Structure

```text
aether-sentinel/
├── apps/
│   ├── api_gateway/       # FastAPI gateway
│   └── web/               # Next.js command center
├── services/
│   ├── decision-service/  # Astraea wrapper
│   └── platform-service/  # K8s platform API
├── packages/
│   ├── astraea-core/      # Deterministic engine
│   ├── domain/            # Domain models
│   └── pipelines/         # Ingestion pipelines
├── infrastructure/
│   ├── db/                # SQLAlchemy models, migrations
│   ├── k8s/               # Kubernetes manifests
│   ├── terraform/         # Infrastructure as code
│   └── monitoring/        # Prometheus, Grafana
├── scripts/
│   └── demo/              # Seeding and validation scripts
├── sample-data/           # Deterministic demo scenarios
├── tests/                 # Unit, integration, e2e tests
├── docs/                  # Architecture, theory, ADRs, diagrams
└── .github/               # CI workflows, issue templates
```

---

## Quality Gates

| Gate | Command | Status |
|------|---------|--------|
| Python tests | `make test` | 13 passed |
| TypeScript check | `pnpm --dir apps/web typecheck` | Pass |
| Next.js build | `pnpm --dir apps/web build` | Pass |
| Audit | `pnpm --dir apps/web audit --prod` | 0 vulnerabilities |
| Lint | `make lint` | Pass |
| Demo validation | `make demo-validate` | End-to-end verified |

---

## License

MIT
