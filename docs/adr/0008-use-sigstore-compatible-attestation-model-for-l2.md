# ADR 0008: Use Sigstore-Compatible Attestation Model for L2

## Status
Accepted

## Context
While Ed25519 signatures (L1) prove that a specific operator key signed a decision, they do not prove *when* it was signed, nor do they prevent an attacker from modifying system times or performing key-compromise replay attacks. We need a way to log signatures to a public, tamper-resistant transparency log that records absolute proof of time and sequence.

## Decision
We define a **Sigstore-compatible attestation model** for the highest conformance level (**L2**) but do not implement inclusion verification yet.
- The `attestation` envelope inside the proof represents a Rekor-style transparency log inclusion bundle.
- It contains: `log` identifier, `entry_id` hash, `log_index` sequence, and a JSON-structured cryptographic `inclusion_proof`.
- When verifying at level L2 today, the verifier fails closed with `unsupported_attestation_verification`.

## Alternatives Considered
- **Direct PGP/GPG Keyrings**: Signing proofs using classic GPG signatures. Rejected due to complex key distribution, trust web management, and lack of timestamp transparency logs.
- **RFC 3161 Timestamp Authorities (TSA)**: Rejected because TSAs only prove time, whereas transparency logs prove both time and sequence in a verifiable ledger.

## Consequences
### Positive
- Prevents back-dating or post-dating of signed decisions.
- Completely neutralizes the threat of compromised signing keys retroactively writing fake historical proofs.
- Integrates seamlessly with modern cloud-native security frameworks (Sigstore, SLSA).

### Negative
- Requires access to a Sigstore/Rekor service (public or private instance).
- Increases serialization and verification logic complexity.

## How this is verified
- Enforced at L2 verification in `PraxisProofVerifier`, which rejects L2 because real Sigstore/Rekor inclusion verification is not implemented.
- Tested using `test_l2_fails_closed_on_invalid_inclusion_proof` in the adversarial test suite.
