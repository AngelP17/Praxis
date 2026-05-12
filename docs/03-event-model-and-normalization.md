# Event Model and Normalization

## The Problem with Raw Signals

Operational signals arrive in inconsistent formats:

- **Ticketing systems**: Title, description, category, priority, assignee, status
- **Machine sensors**: Timestamp, asset ID, measurement, threshold, severity
- **Kubernetes**: Namespace, pod, container, metric, alert rule, severity
- **Operator notes**: Free text, sometimes with screenshots or logs

Each source uses different field names, different severity scales, and different categorization schemes.

## Normalization Strategy

Praxis normalizes all signals into a canonical `OperationalEvent` model:

```python
class OperationalEvent:
    event_id: str          # Unique identifier
    source: str            # Origin system (ticket, sensor, k8s, note)
    event_type: str        # Normalized type (failure, degradation, anomaly)
    severity: str          # Normalized severity (critical, high, medium, low)
    asset_id: str          # Affected asset or service
    payload: dict          # Raw source payload
    normalized_payload: dict  # Canonical normalized form
    occurred_at: datetime  # Event timestamp
    received_at: datetime  # Ingestion timestamp
```

## Normalization Rules

### Severity Mapping

| Source Severity | Normalized Severity |
|----------------|---------------------|
| P0, Critical, DOWN | critical |
| P1, High, DEGRADED | high |
| P2, Medium, WARNING | medium |
| P3, Low, INFO | low |

### Event Type Mapping

| Source Pattern | Normalized Type |
|---------------|-----------------|
| crash, failure, down | failure |
| latency, slowdown, timeout | degradation |
| spike, anomaly, outlier | anomaly |
| maintenance, scheduled | planned |

### Asset Normalization

Assets are normalized to a consistent identifier space:
- Manufacturing lines: `line-{number}-{location}`
- Kubernetes services: `k8s-{namespace}-{service}`
- Infrastructure: `infra-{type}-{id}`

## Validation Contract

Every normalized event must pass validation:

1. **Required fields**: event_id, source, event_type, severity, occurred_at
2. **Severity enum**: Must be one of critical, high, medium, low
3. **Timestamp bounds**: occurred_at must be within 24 hours of received_at
4. **Asset presence**: Either asset_id or a resolvable asset reference must exist
5. **Payload size**: Raw payload must be under 1MB

## Event Store

Normalized events are stored in PostgreSQL with:
- JSONB columns for flexible payload storage
- Indexes on event_id, source, severity, occurred_at
- Partitioning by ingestion date for query performance
- Foreign key links to decision records and incidents

## Replay Requirements

For full replay, the system must store:
- Original raw payload (unchanged)
- Normalized payload (versioned)
- Normalization rule version
- Validation result
- Ingestion metadata

This ensures that even if normalization rules change, historical events can be replayed with their original context.
