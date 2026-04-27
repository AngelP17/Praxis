# Aether Sentinel Demo Script

## 30-Second Pitch

I built Aether Sentinel, an operational intelligence platform for manufacturing and infrastructure incidents. It combines three layers: ingestion of messy operational signals, a deterministic decision engine called Astraea that scores and explains incidents, and an Aether workflow layer that opens tickets, routes work, captures human feedback, and preserves replayable audit history.

## Quick Demo

### 1. Start Services

```bash
# Terminal 1: API Gateway
source .venv/bin/activate
uvicorn apps.api_gateway.main:app --reload --port 8000

# Terminal 2: Platform Service
uvicorn services.platform-service.src.main:app --reload --port 8080
```

### 2. Ingest an Event

```bash
curl -X POST http://localhost:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "k8s",
    "event_type": "pod_failure",
    "severity": "warning",
    "asset": {"asset_id": "resilience-pilot", "site": "demo", "line": "platform"},
    "payload": {"namespace": "default", "desired_replicas": 3, "available_replicas": 2}
  }'
```

### 3. Evaluate Decision

```bash
curl -X POST http://localhost:8000/api/decisions/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "source": "k8s",
    "event_type": "pod_failure",
    "severity_score": 0.8,
    "urgency_score": 0.7,
    "business_impact_score": 0.6,
    "sla_risk_score": 0.9,
    "actionability_score": 0.8,
    "recommended_action": "Run pod crash recovery",
    "recommended_runbook_id": "pod-crash"
  }'
```

### 4. Replay Decision

```bash
curl -X POST http://localhost:8000/api/decisions/1/replay
```

### 5. Provide Feedback

```bash
curl -X POST http://localhost:8000/api/decisions/1/approve \
  -H "Content-Type: application/json" \
  -d '{"note": "Approved - runbook executed successfully"}'
```

### 6. Export Audit

```bash
curl http://localhost:8000/api/audit/export/INC-001
```

### 7. View Platform Evidence

```bash
curl http://localhost:8000/api/platform/summary
curl http://localhost:8000/api/platform/incidents
curl http://localhost:8000/api/platform/runbooks
```

## Key Talking Points

- **Deterministic Replay**: Every decision can be re-run from the original event
- **Explainable**: Feature weights, top factors, and confidence scores are transparent
- **Human-in-the-Loop**: Operators approve, reject, or override recommendations
- **Audit-Ready**: Full incident timeline and exportable bundles
- **Domain Flexible**: Handles manufacturing, IT, and infrastructure events
