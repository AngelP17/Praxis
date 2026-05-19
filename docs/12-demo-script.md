# Demo Script

## Scenario: Database Replication Lag

### Setup

1. Start the API gateway
2. Start the decision service
3. Start the platform service
4. Open the web app
5. Log in as operator

### Step 1: Signal Ingestion

Ingest a PostgreSQL replication lag event:

```bash
curl -X POST http://localhost:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_db_lag_001",
    "source": "postgres-replica",
    "event_type": "database_replication_lag_critical",
    "severity": "high",
    "asset_id": "asset-postgres-replica",
    "payload": {"site": "Dallas", "description": "Replication lag exceeds SLA threshold of 60 seconds (current: 180s)"},
    "occurred_at": "2026-05-01T08:15:00Z"
  }'
```

### Step 2: Decision Evaluation

Evaluate the decision:

```bash
curl -X POST http://localhost:8000/api/decisions/evaluate \
  -H "Content-Type: application/json" \
  -d '{"event_id": "evt_db_lag_001"}'
```

Expected response shows:
- Priority score: 90+
- Confidence: 0.90+
- Root cause: Replica latency drift
- Requires human review: true

### Step 3: Command Room Inspection

Open the command center:

1. Observe the signal queue: `evt_db_lag_001` appears with high priority
2. Click the event to inspect details
3. Review the Astraea decision explanation
4. Note the replay hash

### Step 4: Human Feedback

Submit operator feedback:

```bash
curl -X POST http://localhost:8000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "decision_id": "dec_db_lag_001",
    "feedback_type": "accept",
    "note": "Assessment approved. Synchronizing database replicas per runbook."
  }'
```

### Step 5: Incident Correlation

Ingest a related connection pool event:

```bash
curl -X POST http://localhost:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_conn_pool_001",
    "source": "pgpool_load_balancer",
    "event_type": "connection_pool_saturated",
    "severity": "medium",
    "asset_id": "asset-pgpool",
    "payload": {"description": "Client connections reaching 98% of maximum pooled connections"},
    "occurred_at": "2026-05-01T08:22:00Z"
  }'
```

Observe that both events are correlated into a single incident.

### Step 6: Replay

Replay the incident:

```bash
curl http://localhost:8000/api/replay/incidents/{incident_id}
```

Verify:
- Both events appear in timeline
- Decision is reconstructed with same replay hash
- Operator feedback is preserved

### Step 7: Audit Export

Export the audit bundle:

```bash
curl http://localhost:8000/api/audit/export/{incident_id}
```

Verify:
- Complete timeline
- All decisions with replay hashes
- Operator feedback
- Platform evidence

## Interview Script

### Opening

"Praxis is an operational intelligence platform. It does not just display incidents. It makes decisions about incidents, explains those decisions, captures human feedback, and preserves everything for replay and audit."

### Key Points

1. **Signal Ingestion**: "Events arrive from tickets, sensors, Kubernetes, and operator notes. All are normalized to a canonical format."

2. **Deterministic Decisions**: "Astraea scores every event with a priority, confidence, and explanation. The same inputs always produce the same outputs, verified by a replay hash."

3. **Human Control**: "Operators accept, reject, or override recommendations. Their feedback becomes part of the operational record and influences future decisions."

4. **Replay and Audit**: "After an incident, we can replay the entire lifecycle from raw signal to resolution, with all decisions, feedback, and evidence preserved."

5. **Platform Evidence**: "Kubernetes SLOs provide business context. A CPU spike is a symptom. An SLO breach is an operational incident with defined impact."

### Closing

"The value is not prediction. The value is decision accountability. When a line stops, we can answer: what did we know, when did we know it, what did we recommend, who acted, and why."
