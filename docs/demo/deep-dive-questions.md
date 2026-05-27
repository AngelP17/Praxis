# Technical Deep Dive Q&A (Interview Preparation)

This document contains tough, architect-level system design and security questions about **Praxis**, along with highly detailed technical answers to use in interviews.

---

## Q1: Why did you select Ed25519 for signatures instead of standard RSA or PGP?
**Answer**:
"Ed25519 was selected due to its significant security, performance, and operational advantages in forward-deployed edge environments:
1.  **Compact Signature Size**: Ed25519 signatures are exactly 64 bytes (128 hex chars) and public keys are 32 bytes (64 hex chars), compared to 256–512 bytes for RSA-2048/4096. This keeps the JSON proof payload lightweight for edge storage and network transit.
2.  **Performance**: Signature generation and verification are orders of magnitude faster than RSA, which is critical when validating batches of operational decision logs.
3.  **Resilience to Side-Channel Attacks**: Ed25519 is mathematically designed to be immune to cache-timing attacks and branch-misprediction attacks, ensuring security even when deployed on untrusted or shared edge computing hardware.
4.  **Modern Ecosystem Alignment**: It aligns with modern cloud-native supply chain standards (such as Sigstore/Cosign), making integration with Rekor transparency logs straightforward."

---

## Q2: How do you solve the challenge of "replay drift" if the decision logic depends on dynamic external states or databases?
**Answer**:
"We resolve the replay drift problem using a **strict state isolation and freezing model**:
1.  **Context Snapshotting**: Any external system state or database value that influences the decision (such as an active SLA policy or customer markdown) is captured once at runtime, serialized as a static context, hashed, and recorded in the proof under `customer_context_hash`.
2.  **Time Freezing**: Nondeterministic environmental variables like timestamps (`generated_at`, `verified_at`) are captured once during original execution and stored as static string parameters. During replay, the verifier reads these frozen values instead of calling dynamic system clocks.
3.  **Strict Pure Functions**: The scoring engine itself (`PraxisDecisionEngine`) is written as a pure function. It accepts only the extracted features and static ontology nodes, ensuring that executing it twice over the same inputs guarantees identical outputs. Any change to the logic is immediately caught as a code version change."

---

## Q3: If an operator's private signing key is leaked or compromised, how does the platform handle it?
**Answer**:
"We implement a **failsafe revocation and historical quarantine protocol**:
1.  **Immediate Registry Revocation**: The leaked `signer_kid` is immediately marked as `REVOKED` in the database registry, instantly blocking the API gateway from accepting any new signatures created by that key.
2.  **Quarantine Phase**: We run an immediate query to isolate all historical proofs signed by the compromised key from the suspected breach window to the revocation timestamp:
    ```sql
    SELECT proof_id FROM proofs WHERE signer_kid = 'compromised_id' AND generated_at >= 'breach_timestamp';
    ```
3.  **Audit Ledger Tagging**: These quarantined proofs are tagged in the compliance ledger as `SUSPECT - KEY COMPROMISE`, halting any downstream automated writebacks.
4.  **Verifiability of Safe Proofs**: Because the public key registry preserves the compromise timestamp, proofs signed *before* the breach window remain 100% valid and verifiable, preventing complete database invalidation."

---

## Q4: Why did you choose JSON Schema Draft 2020-12 instead of Pydantic for the protocol specification?
**Answer**:
"Pydantic is an outstanding validation library for Python applications, but it is **language-dependent**. A core architectural goal of the Praxis Proof Protocol (PPP) is **universal verifiability**.
By using **JSON Schema Draft 2020-12**:
1.  **Cross-Platform Portability**: Any verifier written in Go, Rust, Java, or Node.js can immediately load `proof-object.schema.json` and validate proofs natively using standard local schema validators.
2.  **Language Decoupling**: If we choose to completely rewrite the API gateway in Go or Rust in the future to optimize throughput, the core protocol verification contract remains completely unchanged.
3.  **Declarative Constraints**: JSON Schema provides native, declarative assertions for regex patterns (like run-id constraints) and string enums that are universally understood."

---

## Q5: Why does the canonical `proof_hash` exclude the signature and attestation blocks?
**Answer**:
"This is a fundamental cryptographic design principle: **a signature must verify the integrity of the data, but it should not change the data being proven.**
If `signature` or `attestation` were included in the canonical hash:
1.  **Circular Dependency**: You would need to compute the hash to generate the signature, but generating the signature would modify the payload, changing the hash, and invalidating the signature.
2.  **State Invariance**: By excluding the envelopes, we satisfy the mathematical invariant:
    $$\text{proof\_hash}(\text{unsigned}) \equiv \text{proof\_hash}(\text{signed}) \equiv \text{proof\_hash}(\text{attested})$$
    This allows a third party to strip the signature envelope, verify the raw hash, sign it with a different key, or append an attestation block, without invalidating the core identity of the operational decision itself."
