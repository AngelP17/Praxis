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

The demo seeds four realistic flagship scenarios:

### 1. Manufacturing Printer GPO Drift
A manufacturing print server experiences GPO deployment drift, causing printer mapping failures and delaying shipping paperwork. Astraea scores it, tracks the root GPO policy drift, and provides human-in-the-loop remediation.

### 2. Network Edge Failover
A plant edge firewall loses primary ISP connectivity. Astraea scores the edge failover, evaluates Starlink backup status, maps Wan/backup routing dependencies, and flags the business continuity risk.

### 3. Identity Onboarding Drift
A new employee lacks access to critical systems due to fragmented onboarding ownership. Astraea correlates ERP roles, AD group drift, and print server permissions, and routes a deterministic approval action.

### 4. Database Replication Lag
A PostgreSQL database replica experiences significant replication lag, risking data loss. Astraea analyzes transaction lag metrics, checks replica synchronization limits, and generates an auditable recourse plan.

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
# Ingest a database replication lag event
curl -X POST http://localhost:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{"source":"postgres-replica","event_type":"database_replication_lag_critical","severity":"high","payload":{"site":"Dallas","asset":"asset-postgres-replica","description":"Replication lag exceeds SLA threshold of 60 seconds (current: 180s)"}}'

# Evaluate a decision
curl -X POST http://localhost:8000/api/decisions/evaluate \
  -H "Content-Type: application/json" \
  -d '{"event_type":"database_replication_lag_critical","severity":"high","urgency":"high","business_impact":"high"}'

# Replay an incident
curl http://localhost:8000/api/replay/incidents/INC-4785

# Export audit
curl http://localhost:8000/api/audit/export/INC-4785 -o audit.json
```

## Shutdown

```bash
make clean-demo
```

Kills all demo processes and cleans temporary databases.
