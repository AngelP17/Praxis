# ADR 0005: Kubernetes SLO Evidence Layer

## Status
Accepted

## Context
Infrastructure incidents (Kubernetes pod failures, node outages, network partitions) are often judged by symptoms: CPU, memory, restart count. But symptoms do not tell the full story. A pod restart may be harmless (self-healing) or critical (cascading failure) depending on user-facing impact.

SLOs (Service Level Objectives) translate technical symptoms into business impact: availability, latency, error rate, throughput.

## Decision
Aether Sentinel will integrate SLO evidence from the k8s-resilience-pilot platform service. Every infrastructure incident is enriched with:
- Availability snapshot
- P95/P99 latency
- Error rate
- MTTR trend
- Runbook mapping
- Chaos experiment result (if applicable)

This evidence is attached to incidents as immutable artifacts and included in replay bundles.

## Consequences

### Positive
- Incidents are judged by user impact, not just symptoms
- Platform evidence creates consistent severity scoring
- Post-mortems include reliability context
- SLO drift is visible in the operational timeline

### Negative
- Requires SLO instrumentation in target clusters
- Platform service adds dependency to the critical path
- Evidence freshness depends on scrape interval

## Mitigation
- Platform evidence is fetched asynchronously (does not block decision scoring)
- Evidence is cached with TTL
- Fallback to symptom-only scoring if platform service is unavailable
- Evidence artifacts are checksummed and immutable

## Date
2024-01-15

## Author
Angel Pinzon
