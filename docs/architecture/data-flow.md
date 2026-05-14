# Praxis Data Flow

The full data pipeline from raw operational signals through to deterministic proofs and executive readouts.

```mermaid
flowchart TB
    subgraph Ingestion["1. Signal Ingestion"]
        Excel["Legacy: tickets.xlsx<br/>excel_loader → delta_detector"]
        FieldLab["FieldLab: Solution Packs<br/>manufacturing / ERP / k8s"]
        SQS["SQS: praxis-incident-events<br/>event queue"]
        S3["S3: praxis-raw-events<br/>event archive"]
    end

    subgraph Processing["2. Event Processing"]
        Extract["EventFeatureExtractor<br/>messy-signal normalization"]
        Ontology["OntologyCompiler<br/>objects, links, actions"]
        Decision["PraxisDecisionEngine<br/>10-factor priority scoring"]
        Evidence["EvidenceTrustScorer<br/>6-dimension quality"]
        VOI["ValueOfInformation<br/>missing-field ranking"]
    end

    subgraph Proof["3. Proof Construction"]
        Builder["PraxisProofBuilder"]
        ROI["RoiCalculator<br/>restricted-AST formula eval"]
        Expansion["ExpansionGraph<br/>adjacent use cases"]
        Intervention["InterventionPlanner<br/>safety-mode governance"]
        Hash["proof_hash<br/>sha256 canonicalization"]
    end

    subgraph Output["4. Artifact Output"]
        ProofJSON["praxis_proof.json<br/>S3: praxis-proofs"]
        ValueCase["value_case<br/>estimated annual value"]
        Readout["executive readout<br/>per run"]
        Events["EventBridge<br/>RunStarted / DecisionGenerated / ActionCaptured / ValueCaseReady"]
    end

    subgraph State["5. State Persistence"]
        DynamoDB["DynamoDB: PraxisIncidentState<br/>run status + metadata"]
        Streams["DynamoDB Streams<br/>real-time change capture"]
    end

    Excel --> Extract
    FieldLab --> SQS
    FieldLab --> S3
    SQS --> Extract

    Extract --> Decision
    Extract --> Ontology
    Extract --> Evidence
    Extract --> VOI

    Decision --> Builder
    Ontology --> Builder
    Evidence --> Builder
    VOI --> Builder
    ROI --> Builder
    Expansion --> Builder
    Intervention --> Builder

    Builder --> ProofJSON
    Builder --> ValueCase
    Builder --> Readout
    Builder --> Hash

    ProofJSON --> DynamoDB
    ValueCase --> Events
    Readout --> Events

    DynamoDB --> Streams
    Streams --> Events
```

## FieldLab Ingestion (Primary Path)

1. **Solution Pack** loads 12+ messy operational signals per scenario
2. `FlociEventSink.send_batch()` → SQS queue `praxis-incident-events`
3. `FlociEventSink.archive_raw_events()` → S3 bucket `praxis-raw-events`
4. `FlociWorkflowBus.emit()` → EventBridge event `FieldLabRunEventsIngested`

## Feature Extraction

`EventFeatureExtractor` normalizes raw events into structured decision inputs:
- Severity scoring (critical → 1.0, high → 0.9, medium → 0.6, low → 0.3)
- Business impact extraction (shipments, downtime, blocked orders)
- Root cause hypothesis derivation
- Recurrence count, vendor escalation, support escalation flags
- Workaround detection

## Proof Construction

`PraxisProofBuilder` orchestrates the full algorithm stack:
1. Feature extraction from raw events
2. Ontology compilation (objects, links, actions)
3. 10-factor decision scoring (severity, business impact, evidence trust, etc.)
4. ROI calculation via restricted AST evaluation
5. VOI ranking of missing fields
6. Expansion graph for adjacent use cases
7. Intervention planner with safety-mode governance
8. Proof hash via SHA-256 canonical JSON serialization

## Determinism Guarantee

Same solution pack + same events → same proof hash. The canonical JSON serializer normalizes floats, sorts keys, and strips mutable fields from the hash payload.
