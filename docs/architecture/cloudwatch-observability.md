# CloudWatch Observability

Praxis sends custom metrics and structured logs to CloudWatch for operational visibility, alerting, and performance tuning.

```mermaid
flowchart LR
    subgraph Sources["Metric Sources"]
        API["API Gateway<br/>Middleware"]
        Floci["Floci Client<br/>Service calls"]
        Lambda["Lambda<br/>Proof compute"]
        State["DynamoDB Streams<br/>Change events"]
    end

    subgraph CloudWatch["CloudWatch"]
        Metrics["Custom Metrics<br/>Praxis/API<br/>Praxis/FieldLab"]
        Alarms["Alarms<br/>>5 errors/5min"]
        Logs["Structured Logs<br/>JSON format"]
    end

    subgraph Consumers["Consumers"]
        Dash["Health Dashboard<br/>React UI"]
        Ops["Operator<br/>Alert response"]
        Debug["Developer<br/>Performance tuning"]
    end

    API --> Metrics
    Floci --> Metrics
    Lambda --> Metrics
    State --> Metrics

    Metrics --> Alarms
    Metrics --> Dash
    Metrics --> Logs

    Alarms --> Ops
    Logs --> Debug
    Dash --> Debug
```

## Metrics Namespace

All Praxis metrics live under `Praxis/API` and `Praxis/FieldLab`.

### API Metrics (emitted by `MetricsMiddleware`)

| Metric | Unit | Description |
|--------|------|-------------|
| `{method}_{path}_duration` | Milliseconds | Per-endpoint response time |
| `{method}_{path}_count` | Count | Per-endpoint request count |
| `{method}_{path}_errors` | Count | Per-endpoint error count |

### FieldLab Metrics (emitted by `CloudWatchLogger`)

| Metric | Unit | Description |
|--------|------|-------------|
| `{service}/initialized` | Count | Service client created |
| `Errors/{type}` | Count | Categorized error tracking |
| `dynamodb_streams/enabled` | Count | Streams enabled for state table |
| `lambda_compute_success` | Count | Successful Lambda invocation |

## Structured Logging

Every API request emits a JSON log entry via `CloudWatchMiddleware`:

```json
{
  "timestamp": 1778775052.734,
  "method": "GET",
  "path": "/api/proofs/manufacturing-printer-gpo",
  "status_code": 200,
  "duration_ms": 12.44
}
```

Logs are printed to stdout in development and routed to CloudWatch Logs in production.

## Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| `praxis-proof-compute-errors` | >5 errors in 5 minutes | Operator alert |
| Per-endpoint error rate | >10% in 1 minute | Investigate |

## Querying Metrics

```python
# From floci_client.py
client = FlociClient()
client.cw.log_metric("api/proof_compute_duration", 85.3, "Milliseconds")
client.cw.log_error("proof_generation_failed")
```
