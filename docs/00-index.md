# Praxis Documentation Index

This documentation set explains the theory, architecture, and operational model behind Praxis. It is organized so a new reader can understand the system in 60 seconds from the README, then dive into the theory docs for deeper understanding.

## Quick Navigation

| Doc | Purpose | Read Time |
|-----|---------|-----------|
| [01-operational-intelligence-theory.md](01-operational-intelligence-theory.md) | Why this system exists | 5 min |
| [02-system-architecture.md](02-system-architecture.md) | How the system is organized | 5 min |
| [03-event-model-and-normalization.md](03-event-model-and-normalization.md) | Signal ingestion and normalization | 4 min |
| [04-deterministic-decisioning.md](04-deterministic-decisioning.md) | How Astraea makes decisions | 5 min |
| [05-human-in-the-loop-control.md](05-human-in-the-loop-control.md) | Why operators remain in control | 4 min |
| [06-replayability-and-auditability.md](06-replayability-and-auditability.md) | Replay and audit design | 5 min |
| [07-slo-backed-platform-evidence.md](07-slo-backed-platform-evidence.md) | Platform evidence from Kubernetes | 4 min |
| [08-incident-correlation-theory.md](08-incident-correlation-theory.md) | Incident grouping and deduplication | 4 min |
| [09-data-model.md](09-data-model.md) | Core database schema | 3 min |
| [10-api-contracts.md](10-api-contracts.md) | API endpoints and contracts | 5 min |
| [11-frontend-ux-rationale.md](11-frontend-ux-rationale.md) | Why the UI is built this way | 4 min |
| [12-demo-script.md](12-demo-script.md) | How to demo the system | 5 min |
| [13-validation-and-quality-gates.md](13-validation-and-quality-gates.md) | How quality is verified | 3 min |
| [14-limitations-and-future-work.md](14-limitations-and-future-work.md) | Honest limitations and roadmap | 3 min |

## Architecture Decision Records

| ADR | Decision |
|-----|----------|
| [ADR-0001](adr/0001-monorepo-operational-platform.md) | Monorepo for operational platform |
| [ADR-0002](adr/0002-deterministic-decision-engine.md) | Deterministic decision engine |
| [ADR-0003](adr/0003-human-review-over-auto-remediation.md) | Human review over auto-remediation |
| [ADR-0004](adr/0004-replay-hashes-for-auditability.md) | Replay hashes for auditability |
| [ADR-0005](adr/0005-kubernetes-slo-evidence-layer.md) | Kubernetes SLO evidence layer |
| [ADR-0006](adr/0006-frontend-control-room-ux.md) | Control room UX over dashboard |

## Product Documentation

| Doc | Purpose | Read Time |
|-----|---------|-----------|
| [product/screen-map.md](product/screen-map.md) | All 14 frontend screens | 5 min |
| [product/operator-workflows.md](product/operator-workflows.md) | How operators use the system | 4 min |
| [product/portfolio-positioning.md](product/portfolio-positioning.md) | How this project positions in a portfolio | 3 min |

## Diagrams

| Diagram | File | Type |
|---------|------|------|
| System Context | [diagrams/system-context.mmd](diagrams/system-context.mmd) | flowchart |
| Signal to Decision Flow | [diagrams/signal-to-decision-flow.mmd](diagrams/signal-to-decision-flow.mmd) | sequence |
| Feedback Loop | [diagrams/feedback-loop.mmd](diagrams/feedback-loop.mmd) | flowchart |
| Replay Audit Flow | [diagrams/replay-audit-flow.mmd](diagrams/replay-audit-flow.mmd) | flowchart |
| Service Topology | [diagrams/service-topology.mmd](diagrams/service-topology.mmd) | flowchart |
| Data Model | [diagrams/data-model.mmd](diagrams/data-model.mmd) | erDiagram |
| Frontend State Machine | [diagrams/frontend-state-machine.mmd](diagrams/frontend-state-machine.mmd) | stateDiagram-v2 |
