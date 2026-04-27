# Aether Sentinel

**Operational intelligence platform for manufacturing and infrastructure incident response.**

Aether Sentinel ingests messy operational signals, evaluates them through the deterministic Astraea decision engine, routes incidents through the Aether workflow layer, and validates infrastructure behavior through Kubernetes SLO evidence.

This project demonstrates an end-to-end operational decision system:

- Event ingestion from tickets, machine signals, and Kubernetes alerts
- Deterministic scoring and explainable recommendations
- Incident correlation and ticket orchestration
- Human-in-the-loop approval, rejection, and override flows
- Replayable audit trails for every major decision
- Kubernetes chaos testing, SLO validation, runbooks, and observability

The goal is not to build another dashboard. The goal is to show how operational decisions are made, executed, reviewed, and proven.

---

## Architecture

```text
Signal Ingestion -> Event Normalization -> Astraea Decision Engine ->
Incident Correlation -> Aether Workflow -> Human Feedback -> Replay/Audit
```

| Service | Responsibility | Tech |
|---------|---------------|------|
| `web` | Command center, incident detail, replay UI | Next.js |
| `api-gateway` | Public API boundary, auth, orchestration | FastAPI |
| `decision-service` | Deterministic scoring, explainability, replay | Python (Astraea) |
| `platform-service` | SLOs, runbooks, topology, controls, chaos | FastAPI |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (for web app)
- PostgreSQL 15+ (or use SQLite for local dev)
- pnpm (for monorepo package management)

### Install

```bash
# Python dependencies
pip install -e .
pip install -e packages/astraea-core

# Web dependencies
cd apps/web && pnpm install
```

### Run

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

### Demo Path

```bash
# 1. Ingest a platform event
curl -X POST http://localhost:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "k8s",
    "event_type": "pod_failure",
    "severity": "warning",
    "payload": {"namespace": "default", "desired_replicas": 3, "available_replicas": 2}
  }'

# 2. Evaluate decision
curl -X POST http://localhost:8000/api/decisions/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_...",
    "severity_score": 0.8,
    "urgency_score": 0.7,
    "business_impact_score": 0.6,
    "sla_risk_score": 0.9,
    "recommended_action": "Run pod crash recovery"
  }'

# 3. View replay
curl http://localhost:8000/api/replay/decisions/{decision_id}

# 4. Export audit
curl http://localhost:8000/api/audit/export/{incident_id}
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
├── runbooks/              # Operational runbooks
├── scripts/               # Automation scripts
├── sample-data/           # Demo data
├── tests/                 # Unit, integration, e2e tests
└── docs/                  # Architecture, API contracts, demo script
```

---

## License

MIT
