# SLO-Backed Platform Evidence

## Why SLO Evidence

Infrastructure incidents should not be judged only by symptoms. They should be judged by user-facing reliability objectives.

A CPU spike is a symptom. A 500ms latency increase that violates the SLO is an operational incident with business impact.

## Evidence Sources

The platform service collects evidence from:

| Source | Metric | SLO Threshold |
|--------|--------|---------------|
| Availability | Uptime percentage | 99.9% |
| Latency | P95 response time | < 200ms |
| Error Rate | 5xx percentage | < 0.1% |
| Throughput | Requests per second | > 1000 |
| Recovery Time | MTTR | < 30 minutes |

## Evidence Types

### SLO Metrics
Current and historical SLO performance for affected services.

### Runbook Mapping
Links between alert patterns and documented remediation procedures.

### Chaos Experiment Results
Historical results from controlled fault injection that validate resilience assumptions.

### Incident Snapshots
Point-in-time captures of service topology, configuration, and resource utilization.

## How Evidence Enters Aether Sentinel

```
Kubernetes Event -> Platform Service -> Normalization -> Evidence Artifact -> Incident Link
```

1. Kubernetes generates an alert
2. Platform service collects SLO context
3. Evidence is normalized to canonical format
4. Evidence artifact is stored with checksum
5. Artifact is linked to the incident record

## Reliability Theory

SLOs translate technical symptoms into operational impact:

```
Symptom: CPU at 90%
SLO Context: P95 latency increased from 120ms to 450ms
Operational Impact: User-facing degradation exceeding SLO
Decision Priority: High (SLO breach imminent)
```

Without SLO context:
- The system sees a resource metric
- The operator must manually correlate with user impact
- Priority is subjective

With SLO context:
- The system sees user-facing impact
- The operator sees business context
- Priority is objective and measurable

## Evidence in Decisions

SLO evidence influences Astraea decisions:

- **Availability drops below 99%**: Severity automatically escalated
- **P95 latency exceeds 2x baseline**: Business impact score increased
- **Error rate exceeds 1%**: Actionability score increased (clear remediation path)
- **MTTR exceeds 1 hour**: Recurrence penalty applied

## Evidence in Replay

During replay, SLO evidence provides:
- Context for why a decision was made
- Validation that the decision was correct
- Learning for future similar incidents
- Proof for regulatory compliance

## Storage

Evidence artifacts are stored with:
- Immutable checksum (SHA-256)
- Timestamp
- Source service
- SLO threshold at time of incident
- Actual value at time of incident
- Historical baseline for comparison
