# ADR 0001: Use Proof-Carrying Decision Artifacts

## Status
Accepted

## Context
In high-risk operational environments, AI-assisted decision making must be fully auditable and tamper-proof. Typical systems only log raw parameters or final outputs, scattering evidence, logic, and authorization states across multiple decoupled log lines and databases. This makes it impossible to guarantee the integrity of an operational decision post-execution.

## Decision
We will employ a unified, self-contained, and cryptographically signed **Proof-Carrying Decision Artifact** (the Praxis Proof Object). Every operational decision must generate an immutable proof containing:
1. Top-level metadata (`proof_id`, `run_id`, `solution_pack`).
2. Snapshot of evidence (`raw_events`, `sources`, `evidence_trust`).
3. Snapshot of structured ontology mapping states.
4. Deterministic decision engine results (priority score, hypothesis).
5. Signed operator action state (approval/rejection) and mode.
6. Replay and audit verification metadata (`replay_hash`, `deterministic`).

## Alternatives Considered
- **Distributed Logging**: Logging JSON entries to a centralized logging pipeline (e.g. ELK or Datadog). Rejected due to vulnerability to tampering and lack of cryptographic aggregation.
- **Relational Auditing Tables**: Storing snapshots in operational database tables. Rejected because external consumers and third-party auditors cannot verify them out-of-band without database access.

## Consequences
### Positive
- Auditors can verify the complete provenance of a decision out-of-band using public keys.
- Complete protection against retroactive database or log modifications.
- Perfect encapsulation of all evidence and logic states.

### Negative
- Slower decision latency due to serialization, hashing, and cryptographic signing overhead.
- Increased storage footprint for archiving large JSON/proof files.

## How this is verified
- Validated dynamically using `test_proof_schema_conformance.py` to ensure all fields are generated and match the JSON Schema specification.
- Verified cryptographically by `test_protocol_adversarial.py` which demonstrates that tampering with any field invalidates the proof's signature and canonical hash.
