# Operational Ontology

## Concept

The Operational Ontology Compiler turns messy customer inputs into a structured operational model following Palantir-style ontology design.

## Object Types

- **Site**: Physical location (plant, facility, data center)
- **Asset**: Equipment, devices, systems
- **Incident**: Operational disruption
- **Ticket**: Support/incident ticket
- **Vendor**: External service provider
- **Runbook**: Remediation procedure
- **Stakeholder**: Person with operational responsibility
- **BusinessProcess**: Workflow affected by operations

## Link Types

- Site owns Asset
- Incident impacts BusinessProcess
- Ticket supports Incident
- Vendor resolves Asset
- Runbook remediates Incident

## Action Types

- acknowledge_incident (HUMAN_APPROVAL)
- assign_owner (ASSISTED_ACTION)
- request_vendor_support (ASSISTED_ACTION)
- approve_remediation (HUMAN_APPROVAL)
- escalate_to_operations (HUMAN_APPROVAL)
- close_with_evidence (WRITEBACK)

## Mapping Confidence

confidence = 0.30 * schema_coverage + 0.20 * field_consistency + 0.20 * relationship_density + 0.15 * source_reliability + 0.15 * semantic_match_score
