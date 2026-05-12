# ADR-003: Operational Ontology Model

## Status
Accepted

## Context
Customer data arrives in many formats (tickets, telemetry, alerts, operator notes). Praxis needs a way to map this messy data into a structured operational model.

## Decision
Implement an Operational Ontology Compiler that extracts object candidates, infers types (Site, Asset, Incident, Vendor, Stakeholder, BusinessProcess), infers links, infers actions, and scores mapping confidence.

## Rationale
1. **Palantir alignment**: Enterprise ontology is the foundation for operational applications
2. **Forward Deployed relevance**: Handles partial, inconsistent, customer-specific data
3. **Confidence scoring**: Reports mapping confidence and asks next-best questions when data is missing
4. **Action-oriented**: Objects → Links → Actions → Workflows, not just visualization

## Consequences
- `packages/astraea-core/praxis/ontology_compiler.py` with mapping confidence scoring
- `packages/domain/models/operational_object.py` (Pydantic + SQLAlchemy models)
- `/api/ontology/compile` endpoint
- Frontend ontology graph component
