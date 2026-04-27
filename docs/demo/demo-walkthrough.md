# Demo Walkthrough

## Prerequisites

```bash
make install
```

## Start the Full System

```bash
make demo
```

This starts in parallel:
- API Gateway on `http://localhost:8000`
- Decision Service on `http://localhost:8001`
- Platform Service on `http://localhost:8080`
- Web App on `http://localhost:3000`

## Seeded Scenarios

The demo seeds three realistic scenarios:

### 1. Press Vibration Cascade
A manufacturing press shows abnormal vibration. The sensor event is ingested, normalized, scored by Astraea, and routed to the mechanical team. Operator accepts the recommendation. Resolution is confirmed.

### 2. Kubernetes Pod Failure
A pod in the payment service restarts loop. The Kubernetes alert is enriched with SLO evidence (availability dropped to 94.5%, P95 latency spiked to 320ms). Astraea scores it critical. The platform evidence panel shows the reliability impact.

### 3. ERP Authentication Outage
Users cannot log into the ERP system. The ticket is correlated with a previous authentication incident from two weeks ago. Astraea flags recurrence as a high-weight feature. The replay timeline shows the full correlation chain.

## Walkthrough Steps

1. **Open the web app**: `http://localhost:3000`
2. **Homepage**: Read the system narrative: Signal -> Decision -> Workflow -> Feedback -> Replay
3. **Command Center**: See the live signal queue, priority stack, and decision explanations
4. **Select an incident**: Click a ticket to see the incident detail panel and decision explanation
5. **Review the replay rail**: See the pipeline stage visualization (Ingest -> Normalize -> Decide -> Route -> Audit)
6. **Export audit**: Click Export to download the full audit bundle as Excel
7. **API validation**: `curl http://localhost:8000/health` returns `{"status":"ok"}`

## API Demo Commands

```bash
# Ingest an event
curl -X POST http://localhost:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{"source":"demo","event_type":"machine_alert","severity":"critical","payload":{"machine_id":"P-001","vibration_rms":12.4}}'

# Evaluate a decision
curl -X POST http://localhost:8000/api/decisions/evaluate \
  -H "Content-Type: application/json" \
  -d '{"event_id":"EVT-001","severity":"critical","urgency":"high","business_impact":"high"}'

# Replay an incident
curl http://localhost:8000/api/replay/incidents/INC-001

# Export audit
curl http://localhost:8000/api/audit/export/INC-001 -o audit.json
```

## Shutdown

```bash
make clean-demo
```

Kills all demo processes and cleans temporary databases.
