# Data Model

## Entity Relationships

```mermaid
erDiagram
    OPERATIONAL_EVENT ||--o{ DECISION_RECORD : produces
    OPERATIONAL_EVENT }o--o{ INCIDENT : correlates_into
    INCIDENT ||--o{ TICKET : owns
    DECISION_RECORD ||--o{ RECOMMENDATION : emits
    DECISION_RECORD ||--o{ HUMAN_FEEDBACK : receives
    ASSET ||--o{ ASSET_EDGE : supports
    DECISION_RECORD ||--o{ OUTBOX_MESSAGE : triggers
    INCIDENT ||--o{ EVIDENCE_ARTIFACT : contains
    INCIDENT ||--o{ REPLAY_EVENT : reconstructs

    OPERATIONAL_EVENT {
        uuid id
        string event_id
        string source
        string event_type
        string severity
        json payload
        json normalized_payload
        datetime occurred_at
    }

    DECISION_RECORD {
        uuid id
        string decision_id
        float priority_score
        float confidence_score
        string root_cause_hypothesis
        string replay_hash
        json explanation
        json feature_snapshot
    }

    INCIDENT {
        uuid id
        string incident_key
        string title
        string status
        string severity
        datetime opened_at
        datetime resolved_at
    }

    TICKET {
        uuid id
        string ticket_id
        string status
        string priority
        string assignee
        datetime created_at
    }

    HUMAN_FEEDBACK {
        uuid id
        string actor
        string feedback_type
        string note
        datetime created_at
    }

    EVIDENCE_ARTIFACT {
        uuid id
        string artifact_type
        string path
        string checksum
    }
```

## Core Tables

Note: the live SQLAlchemy models in this repo are integer-backed for primary keys in the current checkout, even though some older architecture notes still describe UUID-centric shapes.

### operational_event
Stores all ingested signals in normalized form.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | VARCHAR | Unique event identifier |
| source | VARCHAR | Origin system |
| event_type | VARCHAR | Normalized type |
| severity | VARCHAR | Normalized severity |
| asset_id | VARCHAR | Affected asset |
| payload | JSONB | Raw source data |
| normalized_payload | JSONB | Canonical form |
| occurred_at | TIMESTAMP | Event time |
| created_at | TIMESTAMP | Ingestion time |

### decision_record
Stores Astraea decisions with replay context.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | VARCHAR | Linked event |
| priority_score | FLOAT | 0-100 priority |
| confidence_score | FLOAT | 0-1 confidence |
| root_cause_hypothesis | TEXT | Generated hypothesis |
| replay_hash | VARCHAR | SHA-256 of inputs |
| explanation | JSONB | Human-readable rationale |
| feature_snapshot | JSONB | Feature vector |
| decision_version | VARCHAR | Rule version |
| created_at | TIMESTAMP | Decision time |

### incident
Stores correlated incident groups.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| incident_key | VARCHAR | Unique incident ID |
| title | VARCHAR | Incident title |
| status | VARCHAR | Lifecycle status |
| severity | VARCHAR | Aggregated severity |
| root_cause | TEXT | Determined root cause |
| opened_at | TIMESTAMP | Creation time |
| resolved_at | TIMESTAMP | Resolution time |

### human_feedback
Stores operator feedback on decisions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| decision_id | UUID | Linked decision |
| actor | VARCHAR | Operator username |
| feedback_type | VARCHAR | accept/reject/override |
| note | TEXT | Optional context |
| created_at | TIMESTAMP | Feedback time |

### asset_edges
Stores directional asset dependencies for blast-radius scoring.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| from_asset_id | INTEGER | Upstream asset |
| to_asset_id | INTEGER | Downstream affected asset |
| relationship | VARCHAR | Dependency label such as `supports` |
| weight | INTEGER | Relative dependency weight |
| metadata_json | JSONB | Edge-specific metadata |

### outbox_messages
Stores durable execution handoff records after decision feedback.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| topic | VARCHAR | Event topic such as `praxis.decision.feedback_recorded` |
| payload | JSONB | Durable handoff payload |
| status | VARCHAR | Publishing state, default `pending` |
| created_at | TIMESTAMP | Enqueue time |
| published_at | TIMESTAMP | Publish completion time |

### evidence_artifact
Stores platform evidence linked to incidents.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| incident_id | UUID | Linked incident |
| artifact_type | VARCHAR | slo/runbook/chaos/snapshot |
| path | VARCHAR | Storage location |
| checksum | VARCHAR | SHA-256 |
| metadata | JSONB | Type-specific data |
| created_at | TIMESTAMP | Attachment time |

## Indexing Strategy

- **operational_event**: event_id (unique), source, severity, occurred_at
- **decision_record**: event_id, replay_hash (unique), created_at
- **incident**: incident_key (unique), status, severity, opened_at
- **human_feedback**: decision_id, actor, created_at
- **evidence_artifact**: incident_id, artifact_type

## Partitioning

- **operational_event**: Partitioned by month on created_at
- **decision_record**: Partitioned by month on created_at
- **incident**: Partitioned by quarter on opened_at

## Data Retention

- **Raw events**: 2 years
- **Decision records**: 2 years
- **Incidents**: 5 years
- **Replay bundles**: 5 years
- **Evidence artifacts**: 1 year (SLO data ages out)
