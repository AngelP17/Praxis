# Operational Intelligence Theory

## Problem Statement

Manufacturing and infrastructure incidents rarely arrive as clean, isolated alerts. They arrive as:

- Noisy tickets with inconsistent categorization
- Partial machine observations without full context
- Kubernetes alerts that lack business impact framing
- Operator notes that never get attached to formal records
- Historical incidents that should have prevented the current one

Traditional dashboards display state. They do not change decisions.

## Dashboard vs Operational Intelligence

| Dashboard | Operational Intelligence |
|-----------|-------------------------|
| Displays what happened | Explains why it matters |
| Shows metrics | Scores and prioritizes |
| Lists incidents | Correlates and deduplicates |
| Requires human triage | Recommends action with rationale |
| Loses context after resolution | Preserves replay and audit trail |

A dashboard tells you that CPU is high. Operational intelligence tells you that this CPU spike correlates with a ticket from three days ago, affects a business-critical workflow, and should be routed to the on-call engineer who resolved the last similar incident.

## Core Thesis

Aether Sentinel treats every incident as a **decision lifecycle**:

```
Signal -> Context -> Decision -> Action -> Feedback -> Replay
```

This is not a linear pipeline. It is a closed loop where every stage feeds back into the system's understanding of what matters.

## System Invariants

1. **Every decision must be explainable.**
   The system generates an explanation JSON alongside every priority score. An operator can read why a ticket was ranked high without reading code.

2. **Every recommendation must be reviewable.**
   Operators can accept, reject, or override any recommendation. Their feedback becomes part of the operational record.

3. **Every critical action must preserve audit context.**
   When a ticket is escalated, assigned, or resolved, the system stores the decision context that led to the action.

4. **Every incident should be replayable from source evidence.**
   Given an incident ID, the system can reconstruct the full timeline from raw signal to final resolution.

5. **Human operators remain part of the control loop.**
   The system recommends. Humans decide. The system learns from those decisions.

## Why This Matters

The value is not prediction alone. The value is **decision accountability**.

When a manufacturing line stops, someone will ask:
- What did we know?
- When did we know it?
- What did the system recommend?
- Who acted?
- Why?

Aether Sentinel answers all five questions from a single incident record.

## Decision Ownership Model

In Aether Sentinel, decisions have explicit ownership:

- **Astraea** owns scoring, ranking, and recommendation generation
- **Aether** owns workflow routing, ticket creation, and assignment
- **Platform Service** owns SLO evidence and infrastructure context
- **Human operators** own acceptance, rejection, and override
- **The audit layer** owns replay, timeline reconstruction, and export

No single component makes unilateral decisions. Every critical path involves at least two layers.
