# Proof Lifecycle Architecture

This document describes the lifecycle of a **Proof-Carrying Praxis Artifact** from the initial ingestion of raw, noisy operational events to the final immutable cryptographic verification and executive readout.

## High-Level Lifecycle Flow

```mermaid
sequenceDiagram
    autonumber
    participant Adapters as External Adapters
    participant Ingest as Event Ingest Gateway
    participant Graph as Ontology & Graph Service
    participant Engine as Praxis Decision Engine
    participant Human as Human Operator
    participant Replay as Replay & Hashing Service
    participant Readout as Readout & ROI Engine

    Adapters->>Ingest: Stream CloudEvents (telemetry, tickets, logs)
    activate Ingest
    Ingest->>Ingest: Validate & Normalize Event Payload
    Ingest-->>Adapters: HTTP 202 Ingested
    deactivate Ingest

    Ingest->>Graph: Compile Operational Graph
    activate Graph
    Graph->>Graph: Map Assets, Sites, and Processes
    Graph->>Graph: Trace Dependencies
    Graph-->>Engine: Structured Ontology Graph
    deactivate Graph

    activate Engine
    Engine->>Engine: Grade Evidence Trust (6 dimensions)
    Engine->>Engine: Compute Priority Score (10 factors)
    Engine->>Engine: Select Recommended Runbook Action
    Engine-->>Human: Decision Record & VOI (Value of Information) Queries
    deactivate Engine

    opt Level 3: HUMAN_APPROVAL
        Human->>Engine: Approve / Override Remediation Recommendation
    end

    activate Replay
    Engine->>Replay: Re-run Score Pipeline over Event Spine
    Replay->>Replay: Assert Deterministic Outputs (Value & Action matches)
    Replay->>Replay: Compute Cryptographic Verification Hash
    Replay-->>Engine: Replay Verification Verdict & Hashes
    deactivate Replay

    Engine->>Readout: Generate Executive Summary & ROI Metrics
    activate Readout
    Readout->>Readout: Compute ROI Cost-Avoidance Model
    Readout->>Readout: Map Adjacent Use Cases (Expansion Graph)
    Readout-->>Engine: Completed Executive Readout MD & JSON
    deactivate Readout

    Engine->>Engine: Pack into Immutable Proof JSON File
    Note over Engine: Proof Saved to artifacts/latest/praxis_proof.json
```

## Detailed Phase Breakdown

### Phase 1: Ingestion & Normalization
* **Inputs**: Messy events streamed via SQS or HTTP adapters mapping to the CloudEvents 1.0 schema.
* **Operations**: Key attributes are parsed into a normalized Python model `OperationalEvent` (`domain.events`). Unneeded metadata is stripped while retaining strict audit variables.

### Phase 2: Dependency Mapping (Ontology Compilation)
* **Operations**: The incoming incident triggers a graph compilation. The platform matches physical devices to software platforms and maps them to top-level business operations.
* **Output**: A graph describing which critical business operations are threatened by the anomaly.

### Phase 3: Astraea priority scoring & Recommendation
* **Operations**: The prioritized decision engine computes the severity vector. It grades evidence trust across 6 parameters (freshness, count, conflict, bias, completeness, precision).
* **Output**: An action policy suggestion and value-of-information (VOI) questions highlighting what missing data would improve the engine's confidence.

### Phase 4: Human-in-the-Loop Audit Gate
* **Operations**: For safety Level 3 recommendations, the action remains staged until an authorized user reviews and approves it. The approval decision triggers an outbox event.

### Phase 5: Replay & Cryptographic Proof Emission
* **Operations**: The event spine is replayed to ensure the scoring is reproducible. The system hashes the consolidated payload to produce the immutable signature (`proof_hash`).
* **Output**: `praxis_proof.json`.
