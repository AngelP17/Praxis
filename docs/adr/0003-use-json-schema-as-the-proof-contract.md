# ADR 0003: Use JSON Schema as the Proof Contract

## Status
Accepted

## Context
A proof-carrying system requires a strict data contract between the proof generator (Praxis) and the verification engines (CLIs, dashboards, external compliance targets). Without a formalized schema, internal field names can drift, custom structures can break parsing engines, and invalid states (like UPPERCASE constants violating protocol boundaries) can pollute production records.

## Decision
We establish **JSON Schema Draft 2020-12** as the authoritative structural contract for all generated Praxis Proof Protocol objects. Any proof exported by the builder must validate perfectly against `docs/spec/proof-object.schema.json`. Enforced rules include:
- Strict regular expressions for `proof_id` and `run_id`.
- Lowercase enums for action modes (`human_approval`, `read_only`, `assisted_action`, `writeback`) and statuses (`pending`, `approved`, `rejected`).
- Flat arrays of strings for `next_best_questions`.
- Formal pattern checks for SHA-256 digests in hashes and Ed25519 signature fields.

## Alternatives Considered
- **Pydantic Validation**: Using Pydantic models at the API boundary. Adopted for API routes, but rejected as a portable external audit contract because Pydantic is Python-specific, whereas JSON Schema is globally understood across all languages.
- **Protobuf / gRPC schemas**: Rejected due to high serialization complexity and lower readability for manual security compliance audits.

## Consequences
### Positive
- Cross-platform portability: any verifier (written in Python, Go, Rust, or Node) can immediately validate proofs using local schema libraries.
- Strong protection against structural drift and data format anomalies.
- Forces development of strict serializers and normalizers at boundary levels.

### Negative
- Increases build maintenance, requiring updates to both schema and code representation during structural changes.

## How this is verified
- Enforced at L0 verification in `PraxisProofVerifier` using `jsonschema.validate`.
- Verified at PR merge gate by `test_proof_schema_conformance.py` validating dynamic mock builds and registered solution pack outputs against the schema.
