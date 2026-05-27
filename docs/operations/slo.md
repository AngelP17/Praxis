# Service Level Objectives (SLOs) and Error Budgets

This document specifies the Service Level Indicators (SLIs), Service Level Objectives (SLOs), and Error Budgets for the **Praxis** operational platform in production environments.

---

## 1. Core Service Level Indicators (SLIs)

We define five critical indicators that directly impact the operational trust and availability of the platform:

| SLI Name | Definition | Measurement Window |
| :--- | :--- | :--- |
| **API Availability** | Percentage of HTTP GET/POST requests returning `2xx` or `3xx` codes (excluding user client errors `4xx`). | 30-Day Rolling |
| **Proof Verification Success** | Percentage of proof verification requests returning a valid execution check response without system exceptions. | 30-Day Rolling |
| **Replay Latency** | Latency of the decision replay and hash verification endpoint (`/api/decisions/{id}/replay`). | 30-Day Rolling |
| **Decision Generation Latency** | Time taken from receiving ingested CloudEvents to producing a finalized proposed decision block. | 30-Day Rolling |
| **FieldLab Proof Runtime** | Duration of an end-to-end local field verification and proof compilation run (`make praxis-proof`). | Per-Run basis |

---

## 2. Service Level Objectives (SLOs)

Praxis commits to the following technical and operational performance targets:

### SLO-1: API Availability
*   **Target**: $\ge 99.9\%$
*   **Specification**: Includes the core FastAPI gateway router and the Postgres data store connection.

### SLO-2: Proof Verification Success Rate
*   **Target**: $\ge 99.99\%$
*   **Specification**: All valid cryptographic proof objects must verify successfully without timeout or exception.

### SLO-3: Replay Latency
*   **Target**: $p95 < 200\text{ ms}$ / $p99 < 500\text{ ms}$
*   **Specification**: Replay calculations must remain ultra-fast to facilitate instant audit reviews.

### SLO-4: Decision Generation Latency
*   **Target**: $p95 < 500\text{ ms}$ / $p99 < 1500\text{ ms}$
*   **Specification**: Pipeline execution (ontology compilation, feature extraction, scoring) must remain highly optimized.

### SLO-5: FieldLab Proof Runtime
*   **Target**: $< 10.0\text{ seconds}$
*   **Specification**: Essential for rapid CI integration and developer velocity.

---

## 3. Error Budgets and Gating

An **Error Budget** represents the maximum allowed unreliability or latency degradation during a rolling 30-day window.

### Monthly Budget Allocations

| SLO Target | Allowed Downtime / Failures | Operational Gating Policy |
| :--- | :--- | :--- |
| **99.9% Availability** | ~43.8 minutes of downtime | If the budget is exhausted, product features are frozen. The SRE team redirects 100% of engineering bandwidth to recovery, database performance, or platform stability. |
| **99.99% Verification** | ~4.3 minutes of errors | Immediate SRE page. Any proof validation failure represents a severe integrity alert. |

---

## 4. Telemetry and Alerting

SLI metrics are scraped using standard Prometheus scraping points (`/metrics`) and exported to Grafana dashboards.
- **Critical Alert (P0)**: If API availability drops below $99.5\%$ over a 5-minute window, or if a single L1/L2 proof verification fails due to internal system exceptions, on-call engineers are paged immediately.
- **Warning Alert (P1)**: If $p95$ decision generation latency exceeds $1000\text{ ms}$ over a 1-hour window, or if the error budget consumption rate is projected to exhaust the budget before the 30-day window ends.
