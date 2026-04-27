# API Contracts

## Event Ingestion

### POST /api/events/ingest
Ingest a single operational event.

**Request:**
```json
{
  "event_id": "evt_001",
  "source": "machine_sensor",
  "event_type": "failure",
  "severity": "critical",
  "asset_id": "line-3-factory-a",
  "payload": {"vibration_rms": 12.5, "threshold": 8.0},
  "occurred_at": "2024-01-15T08:30:00Z"
}
```

**Response:**
```json
{
  "event_id": "evt_001",
  "status": "accepted",
  "normalized": true,
  "stored_at": "2024-01-15T08:30:05Z"
}
```

### POST /api/events/batch
Ingest multiple events.

**Request:** Array of event objects.

**Response:** Array of ingestion results.

## Decision Evaluation

### POST /api/decisions/evaluate
Evaluate a decision for an event.

**Request:**
```json
{
  "event_id": "evt_001"
}
```

**Response:**
```json
{
  "decision_id": "dec_001",
  "event_id": "evt_001",
  "priority_score": 87.5,
  "confidence_score": 0.92,
  "root_cause_hypothesis": "Bearing degradation in press unit 3",
  "replay_hash": "sha256:abc123...",
  "explanation": {
    "priority_factors": ["severity: critical", "business_impact: high"],
    "confidence_factors": ["historical_pattern: matched", "asset_criticality: confirmed"]
  },
  "requires_human_review": true
}
```

### GET /api/decisions/{decision_id}/detail
Get decision details with full context.

### POST /api/decisions/{decision_id}/replay
Replay a decision with original inputs.

## Incident Management

### GET /api/incidents
List incidents with filtering.

### GET /api/incidents/{incident_id}
Get incident detail with correlated events.

### GET /api/incidents/{incident_id}/timeline
Get chronological timeline of incident.

### POST /api/incidents/{incident_id}/resolve
Resolve an incident.

## Human Feedback

### POST /api/feedback
Submit feedback on a decision.

**Request:**
```json
{
  "decision_id": "dec_001",
  "feedback_type": "accept",
  "note": "Correct priority assessment"
}
```

## Replay and Audit

### GET /api/replay/incidents/{incident_id}
Get replay bundle for an incident.

### GET /api/audit/export/{incident_id}
Export audit document.

**Response:** Structured JSON with full incident lifecycle.

## Platform Proxy

### GET /api/platform/health
Proxy to platform service health check.

### GET /api/platform/slo/{service_id}
Proxy to SLO metrics.

### GET /api/platform/evidence/{incident_id}
Proxy to evidence artifacts.

## Authentication

### POST /api/auth/login
Authenticate and receive JWT token.

### POST /api/auth/logout
Invalidate current session.

### GET /api/auth/me
Get current user profile.

## Error Format

All errors follow this structure:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Event payload exceeds maximum size",
  "detail": "Payload is 2.3MB, maximum is 1MB",
  "request_id": "req_abc123"
}
```

## Rate Limiting

- Event ingestion: 1000 requests/minute
- Decision evaluation: 500 requests/minute
- Incident queries: 200 requests/minute
- Replay/audit: 50 requests/minute

## Versioning

API versions are specified in the URL path:
- `/api/v1/events/ingest`
- `/api/v2/decisions/evaluate`

Current version: v1
