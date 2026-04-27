# ADR 0004: Replay Hashes for Auditability

## Status
Accepted

## Context
Operational decisions must be auditable. After an incident, stakeholders ask: "What did the system recommend and why?" Without a verifiable record, answers rely on logs, which may be incomplete, rotated, or ambiguous.

Traditional logging stores decision outputs but not the inputs in a verifiable way. Reconstructing a decision from logs is manual and error-prone.

## Decision
Every decision record will include a **replay hash**: a SHA-256 checksum computed from the normalized event payload, feature snapshot, rule version, and engine version.

The replay hash enables:
1. **Verification**: Given the same inputs, the hash must match
2. **Detection**: Any tampering with inputs or outputs changes the hash
3. **Reconstruction**: The full decision can be replayed from stored artifacts

## Consequences

### Positive
- Cryptographic guarantee of decision integrity
- One-click replay from audit UI
- Independent verification by third-party auditors
- Immutable decision records

### Negative
- Additional storage for feature snapshots
- Hash computation adds latency (mitigated: ~1ms)
- Requires careful versioning of all inputs

## Mitigation
- Feature snapshots are stored as compressed JSONB
- Hash computation is done in-process, no external calls
- Versioning is enforced at the schema level

## Date
2024-01-15

## Author
Angel Pinzon
