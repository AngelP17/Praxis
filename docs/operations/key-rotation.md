# Key Rotation

Praxis currently supports L0 unsigned proof verification and L1 verification for proof objects that already contain an Ed25519 signature envelope. The default `make praxis-proof` path emits L0 proofs. L2 Sigstore/Rekor verification is specified but intentionally fails closed until real transparency-log inclusion verification is implemented.

## Current Implemented State

- `packages/astraea-core/astraea/praxis/signing.py` can generate Ed25519 keys and sign a proof hash for tests or controlled L1 proof generation.
- `PraxisProofVerifier(level="L1")` requires and verifies a valid Ed25519 signature against the canonical proof hash.
- There is no production signing-key registry, KMS/Vault integration, or automated production signing identity in this checkout.

## Rotation Rule For L1 Keys

Until a production key registry is implemented, generated private keys are local/operator-managed test material only. Do not commit private keys, public-key registries, or generated signatures unless the task explicitly asks for a fixture.

When production key management is added, it must define:

- where private keys live;
- how public keys are distributed to verifiers;
- how old keys remain available for historical proof verification;
- how compromised keys are revoked;
- which CI or integration test proves rotation works.

## Emergency Handling

If a local signing key used for a published fixture is exposed:

1. Stop using that key immediately.
2. Regenerate affected signed fixtures through the builder/signing path.
3. Mark historical signatures from the exposed key as untrusted in docs or release notes.
4. Re-run L1 verifier tests before publishing.
