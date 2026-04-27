# Sample Incident: Press Vibration Cascade

## Scenario

At 08:30 UTC, Press P-001 on Line 3 reports abnormal vibration (RMS 12.4, threshold 8.0). The machine operator creates a ticket: "Press vibrating, unusual noise."

## Timeline

| Time | Event | Source |
|------|-------|--------|
| 08:30:00 | Sensor alert: vibration_rms=12.4 | Machine telemetry |
| 08:31:15 | Ticket created: "Press vibrating" | Operator |
| 08:31:30 | Event ingested and normalized | API Gateway |
| 08:31:45 | Astraea evaluates: priority_score=87, confidence=0.92 | Decision Engine |
| 08:32:00 | Incident INC-2024-001 created, correlated with previous P-001 events | Incident Service |
| 08:32:15 | Ticket routed to mechanical team | Workflow |
| 08:45:00 | Operator alice accepts recommendation | Human Feedback |
| 09:15:00 | Resolution confirmed: bearing replaced | Workflow |

## Decision Record

```json
{
  "decision_id": "DEC-2024-001",
  "event_id": "EVT-2024-001",
  "priority_score": 87,
  "confidence_score": 0.92,
  "severity_score": 1.0,
  "urgency_score": 0.85,
  "business_impact_score": 0.90,
  "sla_risk_score": 0.75,
  "recurrence_score": 0.60,
  "dependency_criticality_score": 0.80,
  "actionability_score": 0.95,
  "uncertainty_penalty": 0.05,
  "root_cause_hypothesis": "Bearing degradation causing vibration cascade. Similar to INC-2023-089.",
  "replay_hash": "sha256:a1b2c3d4...",
  "explanation": {
    "summary": "Critical vibration on production press with high business impact and clear actionability.",
    "key_factors": [
      "Severity is critical (vibration 55% above threshold)",
      "Business impact is high (Line 3 is primary production line)",
      "Actionability is high (replace bearing, standard procedure)",
      "Recurrence pattern matches previous bearing failures"
    ],
    "recommendation": "Route to mechanical team immediately. Schedule bearing replacement within 2 hours."
  },
  "decision_version": "1.2.0",
  "feature_snapshot": {
    "severity": 1.0,
    "urgency": 0.85,
    "business_impact": 0.90,
    "sla_risk": 0.75,
    "recurrence": 0.60,
    "dependency_criticality": 0.80,
    "actionability": 0.95,
    "uncertainty_penalty": 0.05
  }
}
```

## Human Feedback

```json
{
  "feedback_id": "FB-2024-001",
  "decision_id": "DEC-2024-001",
  "actor": "alice",
  "feedback_type": "accept",
  "note": "Correct priority. Bearing was indeed degraded.",
  "created_at": "2024-01-15T08:45:00Z"
}
```

## Replay Verification

To verify this decision:

```bash
curl http://localhost:8000/api/replay/incidents/INC-2024-001
```

Expected output includes:
- Raw sensor event
- Normalized payload
- Feature snapshot
- Decision record with matching replay hash
- Operator feedback
- Resolution record

## Audit Export

```bash
curl http://localhost:8000/api/audit/export/INC-2024-001 -o audit_inc_2024_001.json
```

The export contains the full timeline, all decisions, feedback, and evidence artifacts in a single structured document suitable for regulatory review.
