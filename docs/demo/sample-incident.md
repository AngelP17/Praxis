# Sample Incident: Database Replication Lag

## Scenario

At 08:15 UTC, the PostgreSQL database replica `asset-postgres-replica` on the Dallas site reports abnormal replication lag of 180 seconds, exceeding the SLA threshold of 60 seconds. The database operator synchronizes replicas per runbook and resolves the issue.

## Timeline

| Time | Event | Source |
|------|-------|--------|
| 08:15:00 | Sensor alert: database_replication_lag_critical | postgres-replica |
| 08:22:00 | Event alert: connection_pool_saturated | pgpool_load_balancer |
| 08:22:15 | Event ingested and normalized | API Gateway |
| 08:22:30 | Astraea evaluates: priority_score=92, confidence=0.94 | Decision Engine |
| 08:22:45 | Incident INC-4785 created, correlating replication lag and pgpool saturation | Incident Service |
| 08:23:00 | Recommendation routed to SRE database operations team | Workflow |
| 08:30:00 | Operator accepts recommendation and triggers replica sync | Human Feedback |
| 08:45:00 | Resolution confirmed: replication lag drops below 5s | Workflow |

## Decision Record

```json
{
  "decision_id": "dec_db_lag_001",
  "event_id": "evt_db_lag_001",
  "priority_score": 92,
  "confidence_score": 0.94,
  "severity_score": 0.95,
  "urgency_score": 0.90,
  "business_impact_score": 0.92,
  "sla_risk_score": 0.95,
  "recurrence_score": 0.30,
  "dependency_criticality_score": 0.95,
  "actionability_score": 0.90,
  "uncertainty_penalty": 0.03,
  "root_cause_hypothesis": "Replica latency drift causing transactional lag. High risk to checkout flow.",
  "replay_hash": "sha256:7d8a9b0c...",
  "explanation": {
    "summary": "Critical replication lag on production Postgres replica impacting core transactions.",
    "key_factors": [
      "Severity is high (replication lag 3x above SLA threshold)",
      "Business impact is critical (Dallas checkout flow is affected)",
      "Actionability is high (synchronize replica per runbook RB-DB-001)"
    ],
    "recommendation": "Route to SRE DB team immediately. Perform replica synchronization."
  },
  "decision_version": "1.2.0",
  "feature_snapshot": {
    "severity": 0.95,
    "urgency": 0.90,
    "business_impact": 0.92,
    "sla_risk": 0.95,
    "recurrence": 0.30,
    "dependency_criticality": 0.95,
    "actionability": 0.90,
    "uncertainty_penalty": 0.03
  }
}
```

## Human Feedback

```json
{
  "feedback_id": "FB-2026-001",
  "decision_id": "dec_db_lag_001",
  "actor": "operator",
  "feedback_type": "accept",
  "note": "Replication lag confirmed. Performed replica synchronization successfully.",
  "created_at": "2026-05-01T08:30:00Z"
}
```

## Replay Verification

To verify this decision:

```bash
curl http://localhost:8000/api/replay/incidents/INC-4785
```

Expected output includes:
- Raw replication lag and connection pool events
- Normalized event payloads
- Feature snapshot
- Decision record with matching replay hash
- Operator feedback
- Resolution record

## Audit Export

```bash
curl http://localhost:8000/api/audit/export/INC-4785 -o audit_inc_4785.json
```

The export contains the full timeline, all decisions, feedback, and evidence artifacts in a single structured document suitable for regulatory review.
