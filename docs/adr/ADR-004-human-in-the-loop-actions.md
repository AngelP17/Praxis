# ADR-004: Human-in-the-Loop Actions

## Status
Accepted

## Context
Praxis must be safe and credible in field deployment. It cannot pretend to autonomously fix production.

## Decision
All actions are governed by a mode system with five levels:
- **READ_ONLY**: Summarize, inspect, explain
- **HUMAN_APPROVAL**: Recommend, queue approval
- **ASSISTED_ACTION**: Prepare ticket, draft messages, generate runbooks
- **WRITEBACK**: Execute only in simulated/local mode (FieldLab)
- **BLOCKED**: Unsafe or unsupported

Every action captures an audit log with deterministic hash for replay verification.

## Rationale
1. **Safety**: No unilateral automation in production
2. **Auditability**: Every action is logged with cryptographic hash
3. **Field credibility**: Demonstrates understanding of real deployment constraints
4. **Palantir alignment**: Action types and action logs as governed writeback

## Consequences
- `packages/astraea-core/praxis/intervention_planner.py`
- `packages/domain/models/action_type.py`
- `infrastructure/db/models/action_log.py`
- `/api/ontology/actions/{action_type}/simulate` endpoint
