# System Overview

## Context

Praxis ingests operational signals, runs them through the FieldLab and decision stack, produces replayable proof-carrying recommendations, and presents cinematic workbench surfaces for operators, forward-deployed engineers, and GTM reviewers.

```mermaid
flowchart LR
    A["Tickets, telemetry, alerts, operator notes"] --> B["API Gateway + adapters"]
    B --> C["Normalized operational events"]
    C --> D["FieldLab state and audit store"]
    D --> E["Astraea / Praxis decision engine"]
    E --> F["Recommendations + action policy"]
    E --> G["Incident and ontology views"]
    E --> H["Proof object + replay hash"]
    F --> I["Workbench surfaces"]
    G --> I
    H --> J["Proof diff, replay, audit export"]
    I --> K["Human action / feedback"]
    K --> D
```

## Core Principles

1. **Event sourcing first** — every ticket change produces an immutable event
2. **Decision quality over dashboard fluff** — every feature must improve decision quality, speed, or trust
3. **Explainability by default** — every score and recommendation has a human-readable rationale
4. **Operator in the loop** — human feedback updates weights and improves future decisions

## Data Flow

```mermaid
flowchart TD
    A["Signal sources"] --> B["Gateway ingest + validation"]
    B --> C["OperationalEvent normalization"]
    C --> D["FieldLab / event persistence"]
    D --> E["Feature extraction + evidence trust"]
    E --> F{"Praxis scoring"}
    F --> G["Decision record + recommendation set"]
    F --> H["Root cause and causal graph"]
    E --> I["Incident correlation"]
    G --> J["Proof object + signature"]
    H --> K["Executive readout inputs"]
    I --> K
    J --> L["Verifier / replay / diff"]
    K --> M["Value case + deployment plan"]
```

## Database Architecture

```mermaid
erDiagram
    OPERATIONAL_EVENT ||--o{ DECISION_RECORD : produces
    OPERATIONAL_EVENT }o--o{ INCIDENT : correlates_into
    INCIDENT ||--o{ TICKET : owns
    DECISION_RECORD ||--o{ RECOMMENDATION : emits
    DECISION_RECORD ||--o{ HUMAN_FEEDBACK : receives
    INCIDENT ||--o{ EVIDENCE_ARTIFACT : contains
    INCIDENT ||--o{ REPLAY_EVENT : reconstructs
```

## Key Design Decisions

- **FieldLab before production** — prove the workflow locally before any real hosted deployment
- **Deterministic decisioning** — identical inputs should produce identical scores, replays, and proof hashes
- **Rules-plus-graph reasoning** — operational logic stays inspectable and replayable
- **Human review by default** — the product recommends; humans approve or override
- **Immutable event trail** — operational events, proof artifacts, and feedback remain audit-friendly
