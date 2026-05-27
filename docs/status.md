# Status

As of this checkout:

- L0 Praxis proof verification is implemented through JSON Schema validation, canonical hash recomputation, and deterministic replay checks.
- L1 verification is implemented for proof objects that include a valid Ed25519 signature envelope.
- L2 verification is intentionally unsupported and fails closed with `unsupported_attestation_verification`.
- Frontend demo proofs are generated from the Python proof builder and are L0 demo artifacts.
- Docker Compose is the supported backend deployment path.
- Refresh token rotation and token revocation are persisted in the database.

Known gaps:

- No production key registry or KMS/Vault integration.
- No real Sigstore/Rekor inclusion verification.
- Outbox production dispatch requires explicit EventBridge-compatible configuration.
- Monitoring is basic Prometheus HTTP metrics; OpenTelemetry is not implemented.
