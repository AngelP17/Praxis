# ADR 0009: Fail Closed on Unsupported Attestation

## Status
Accepted

## Context
When verifying at the highest assurance level (**L2**), we may encounter scenarios where the Sigstore attestation block is missing, incomplete, or the verifying server is temporarily offline. A "fail-open" approach (where we warning-log but let the validation pass) would completely defeat the security value of the L2 tier, allowing attackers to bypass ledger checks easily.

## Decision
We enforce a strict **Fail-Closed Security Posture** for all L2 checks.
- If the `level` of the verifier is set to `L2` and the proof lacks a valid `attestation` block, verification strictly fails with an explicit validation error: `L2 verification failed: missing attestation block (experimental fails closed)`.
- If the attestation block is present but lacks a valid structure (e.g. missing `log`, `log_index`, or `inclusion_proof`), verification strictly fails.
- No partial or warning states are allowed at the L2 boundary.

## Alternatives Considered
- **Fail-Open with Warnings**: Logging warnings but returning `valid=True`. Rejected due to extreme security risk in critical enterprise zones.
- **Failover to L1 on Network Timeout**: Falling back to simple signature validation if the Rekor API is unreachable. Rejected because a network partition should not lower our security guarantees.

## Consequences
### Positive
- Guarantees absolute, untampered compliance for systems configured to require L2 validation.
- Prevents bypass attacks during network partitions.

### Negative
- Increases system fragility: a network failure or misconfigured Rekor service will block valid operational reviews.

## How this is verified
- Validated by the adversarial test suite in `test_l2_fails_closed_on_missing_attestation` and `test_l2_fails_closed_on_invalid_inclusion_proof`, asserting that `valid` is always `False` and clear errors are appended when attestation constraints are violated.
