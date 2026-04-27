# Demo Script

## Scenario: Press Vibration Cascade

### Setup

1. Start the API gateway
2. Start the decision service
3. Start the platform service
4. Open the web app
5. Log in as operator

### Step 1: Signal Ingestion

Ingest a machine sensor event:

```bash
curl -X POST http://localhost:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_press_001",
    "source": "machine_sensor",
    "event_type": "degradation",
    "severity": "high",
    "asset_id": "press-line-3",
    "payload": {"vibration_rms": 12.5, "threshold": 8.0, "trend": "increasing"},
    "occurred_at": "2024-01-15T08:30:00Z"
  }'
```

### Step 2: Decision Evaluation

Evaluate the decision:

```bash
curl -X POST http://localhost:8000/api/decisions/evaluate \
  -H "Content-Type: application/json" \
  -d '{"event_id": "evt_press_001"}'
```

Expected response shows:
- Priority score: 85+
- Confidence: 0.90+
- Root cause: Bearing degradation
- Requires human review: true

### Step 3: Command Room Inspection

Open the command center:

1. Observe the signal queue: `evt_press_001` appears with high priority
2. Click the event to inspect details
3. Review the Astraea decision explanation
4. Note the replay hash

### Step 4: Human Feedback

Submit operator feedback:

```bash
curl -X POST http://localhost:8000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "decision_id": "dec_press_001",
    "feedback_type": "accept",
    "note": "Correct assessment. Maintenance scheduled."
  }'
```

### Step 5: Incident Correlation

Ingest a related ticket:

```bash
curl -X POST http://localhost:8000/api/events/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_ticket_042",
    "source": "ticketing",
    "event_type": "anomaly",
    "severity": "medium",
    "asset_id": "press-line-3",
    "payload": {"title": "Unusual noise from press", "category": "mechanical"},
    "occurred_at": "2024-01-15T08:35:00Z"
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

"Aether Sentinel is an operational intelligence platform. It does not just display incidents. It makes decisions about incidents, explains those decisions, captures human feedback, and preserves everything for replay and audit."

### Key Points

1. **Signal Ingestion**: "Events arrive from tickets, sensors, Kubernetes, and operator notes. All are normalized to a canonical format."

2. **Deterministic Decisions**: "Astraea scores every event with a priority, confidence, and explanation. The same inputs always produce the same outputs, verified by a replay hash."

3. **Human Control**: "Operators accept, reject, or override recommendations. Their feedback becomes part of the operational record and influences future decisions."

4. **Replay and Audit**: "After an incident, we can replay the entire lifecycle from raw signal to resolution, with all decisions, feedback, and evidence preserved."

5. **Platform Evidence**: "Kubernetes SLOs provide business context. A CPU spike is a symptom. An SLO breach is an operational incident with defined impact."

### Closing

"The value is not prediction. The value is decision accountability. When a line stops, we can answer: what did we know, when did we know it, what did we recommend, who acted, and why."
