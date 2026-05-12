# Security and Compliance

## Design Principles

- **Deterministic**: Same input always produces same output (SHA-256 hashes)
- **Immutable**: Raw events are never modified; decision records are append-only
- **Human-in-the-loop**: No unilateral automation; all production actions require approval
- **Auditable**: Every decision, action, and feedback record is hashed and replayable

## Compliance Alignment

| Standard | Alignment | Evidence |
|----------|-----------|----------|
| SOC 2 | Aligns | Audit trails, access controls, change management |
| ISO 27001 | Aligns | Information security management system |
| GDPR | Aligns | No PII processed in demo; configurable data retention |

## Action Mode Security

| Mode | Production Safe | Requires Approval | Audit Trail |
|------|----------------|-------------------|-------------|
| READ_ONLY | Yes | No | Yes |
| HUMAN_APPROVAL | Yes | Yes | Yes |
| ASSISTED_ACTION | Yes (simulated) | Yes | Yes |
| WRITEBACK | FieldLab only | Yes | Yes |
| BLOCKED | N/A | N/A | Yes |
