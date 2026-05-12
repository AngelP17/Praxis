# Praxis API Contracts

## Ingestion APIs

### POST /api/events/ingest
Ingest a single operational event.

**Request Body:**
```json
{
  "source": "k8s",
  "event_type": "pod_failure",
  "severity": "warning",
  "asset": {"asset_id": "svc-1", "site": "us-east", "line": "platform"},
  "payload": {"namespace": "default", "desired_replicas": 3, "available_replicas": 2}
}
```

**Response:**
```json
{
  "event_id": "evt_abc123",
  "status": "ingested"
}
```

### POST /api/events/batch
Ingest multiple events.

### GET /api/events
List normalized events.

### GET /api/events/{event_id}
Get event detail.

## Decision APIs

### POST /api/decisions/evaluate
Run decision engine against an event.

**Request Body:**
```json
{
  "source": "k8s",
  "event_type": "pod_failure",
  "severity_score": 0.8,
  "urgency_score": 0.7,
  "business_impact_score": 0.6,
  "sla_risk_score": 0.9,
  "recommended_action": "Run pod crash recovery"
}
```

**Response:**
```json
{
  "id": 1,
  "event_id": "evt_abc123",
  "priority_score": 0.72,
  "risk_level": "medium",
  "confidence_score": 0.7,
  "replay_hash": "sha256:...",
  "recommendations": [...]
}
```

### GET /api/decisions/{decision_id}
Get decision detail.

### POST /api/decisions/{decision_id}/replay
Replay decision deterministically.

### POST /api/decisions/{decision_id}/approve
Approve recommendation.

### POST /api/decisions/{decision_id}/reject
Reject recommendation.

### POST /api/decisions/{decision_id}/override
Override recommendation with note.

## Incident APIs

### GET /api/incidents
List incidents.

### GET /api/incidents/{incident_id}
Get incident detail.

### GET /api/incidents/{incident_id}/events
Get linked events.

### GET /api/incidents/{incident_id}/decisions
Get linked decisions.

### GET /api/incidents/{incident_id}/tickets
Get linked tickets.

### GET /api/incidents/{incident_id}/timeline
Get full timeline.

### POST /api/incidents/{incident_id}/resolve
Resolve incident.

### POST /api/incidents/{incident_id}/postmortem
Generate postmortem.

## Platform APIs

### GET /api/platform/summary
Platform summary.

### GET /api/platform/slo
SLO status.

### GET /api/platform/incidents
Platform incidents.

### GET /api/platform/runbooks
Runbooks list.

### GET /api/platform/topology
Topology map.

### GET /api/platform/controls
Controls list.

## Replay/Audit APIs

### GET /api/replay/incidents/{incident_id}
Replay full incident.

### GET /api/replay/decisions/{decision_id}
Replay decision.

### GET /api/replay/tickets/{ticket_id}
Replay ticket lifecycle.

### GET /api/audit/events
Query audit log.

### GET /api/audit/export/{incident_id}
Export audit bundle.
