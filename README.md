# Praxis

[![CI](https://github.com/AngelP17/praxis/actions/workflows/ci.yml/badge.svg)](https://github.com/AngelP17/praxis/actions)

**Proof-carrying field deployment for enterprise operations.**

Praxis turns customer-specific operational signals into executable decision graphs, local proof-of-value environments, audit-ready workflows, and measurable implementation plans.

## Watch Praxis Work

[3-minute demo](apps/web/public/demo/praxis-3-minute-demo.mp4)

In one run, Praxis loads a manufacturing solution pack, streams messy events through FieldLab, compiles an operational ontology, generates a proof-carrying decision, captures a human-approved action, and produces an executive value case.

> **Tag:** `praxis-v1` — Field-Deployed Decision Platform

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
| **Solutions Engineer** | Can scope a customer use case, build a technical demo, explain architecture, handle security/compliance, and show business value |
| **GTM Engineer** | Can package repeatable demo systems, solution templates, ROI calculators, customer narratives, and product feedback loops |
| **Forward Deployed Engineer** | Can integrate messy customer data, model operational workflows, build adapters, deploy locally, and iterate with users |
| **Platform Engineer** | Integrates Floci-backed local AWS services to simulate production event pipelines without cloud credentials |

---

## Flagship Demo: Printer GPO Failure to Executive Value Case

```bash
# 1. Install everything
make install

# 2. Start the full stack
make demo

# 3. Seed a known scenario
make demo-seed

# 4. Validate the end-to-end path
make demo-validate

# Or run the proof-first artifact path
make praxis-proof
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
| `/dashboard` | System health bento overview | Operator |
| `/command-center` | Primary operator work queue with decision explanations | Operator |
| `/incidents/[id]` | Incident detail with timeline | Operator |
| `/decision-center` | Decision center with counterfactual deltas | Operator |
| `/field-workbench` | End-to-end customer workflow from discovery to readout | FDSE |
| `/solution-packs` | Catalog of repeatable demo packs | GTM Engineer |
| `/solution-packs/[id]` | Launch a specific customer scenario | Solutions Engineer |
| `/fieldlab` | Floci-backed local environment status and event flow | Platform/SE |
| `/ontology` | Operational object graph, links, and actions | FDSE |
| `/value-case` | ROI calculator and assumptions | GTM Engineer |
| `/deployment-plan` | Technical rollout plan and risk register | Solutions Engineer |
| `/executive-readout` | CFO/COO-ready summary | GTM/SE |
| `/platform` | SRE control plane — SLOs, topology, chaos | Platform |
| `/assets` | Infrastructure asset inventory | Operator |
| `/audit` | Audit trail viewer and export | Operator |
| `/replay/[id]` | Point-in-time replay with forensics | Operator |
| `/reports` | Executive and operational reporting | Operator |
| `/admin` | Role-gated admin console | Admin |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 22+
- pnpm
- PostgreSQL 15+ (or SQLite for local dev)
- Docker (for FieldLab/Floci)

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
```

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
│   ├── erp-access-disruption/
│   ├── k8s-ingress-degradation/
│   ├── email-quarantine-disruption/
│   └── machine-cascade-maintenance/
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

| Gate | Command | Status |
|------|---------|--------|
| Python tests (core) | `make test` | 13 passed |
| Python tests (reasoning) | `pytest tests/astraea/` | 29 passed |
| Python integration | `pytest tests/integration/` | 8 passed |
| TypeScript check | `pnpm web:typecheck` | Pass |
| Next.js build | `pnpm web:build` | 17/17 pages |
| GPT-taste lint | `pnpm web:lint:gpt-taste:ci` | Pass |
| Smoke tests | `pnpm web:test:smoke` | 6/6 passed |
| CTA audit | `pnpm web:test:smoke cta-audit.smoke.spec.ts` | 4/4 passed |
| Audit | `pnpm --dir apps/web audit --prod` | 0 vulnerabilities |
| Lint | `make lint` | Pass |
| Demo validation | `make demo-validate` | End-to-end verified |

### Benchmarks

All 6 benchmark scenarios pass:

| ID | Scenario | Expected Root Cause | Result |
|----|----------|---------------------|--------|
| B1 | Press Line 3 Vibration Cascade | `bearing_degradation` | **PASS** |
| B2 | Kubernetes Ingress Degradation | `ingress_controller_backpressure` | **PASS** |
| B3 | IAM Policy Drift | `policy_drift` | **PASS** |
| B4 | Sensor Calibration Offset | `calibration_offset` | **PASS** |
| B5 | Contradictory Evidence | confidence drop + review flag | **PASS** |
| B6 | Missing Evidence | suppressed + review flag | **PASS** |

---

## License

MIT
