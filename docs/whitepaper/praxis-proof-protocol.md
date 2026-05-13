# Praxis Proof Protocol — Whitepaper

**A Protocol for Verifiable AI Decision Provenance in Operational Environments**

_April 2026_

---

## Abstract

Operational AI systems increasingly influence or automate decisions that affect physical infrastructure, compliance workflows, and revenue-critical business processes. Yet these systems typically lack auditable provenance: there is no standardized, cryptographically verifiable record of what evidence was considered, what decision was reached, what action was taken, and whether the same inputs would produce the same output.

Praxis introduces the Praxis Proof Protocol (PPP) — the first open specification for AI decision provenance. A PPP proof object binds raw field evidence, compiled ontology, decision output, human action attestation, and replay verification into a deterministic, hash-chained JSON artifact. Proofs are independently verifiable by any conforming implementation, can be Ed25519-signed for non-repudiation, and can be countersigned in a public transparency log for long-term auditability.

The reference implementation demonstrates the protocol end-to-end: a local FieldLab (Floci) runtime ingests customer-specific operational signals, compiles an ontology, scores decisions, gates human action, and emits a signed, verifiable proof. The entire pipeline is deterministic and enforced by CI gates on every commit.

## 1. Problem Statement

Organizations deploying AI in operational contexts face four unresolved challenges:

1. **Provenance:** When an AI system recommends an action — restart a server, escalate an incident, approve a vendor change — there is no standardized record of the evidence chain that produced that recommendation.

2. **Auditability:** Regulators and internal compliance teams cannot independently verify that a decision was justified by the evidence available at the time.

3. **Drift Detection:** Without deterministic replay, there is no way to detect whether a model update, prompt change, or configuration drift silently altered decision quality.

4. **Dispute Resolution:** When two stakeholders disagree about a decision, they lack a shared, verifiable artifact to anchor the conversation.

Existing work in ML provenance graphs, model cards, and explainability tooling addresses portions of these problems but does not provide an end-to-end cryptographic chain linking raw evidence to final action.

## 2. Threat Model

| Threat | Severity | Mitigation |
|--------|----------|-----------|
| Tampered evidence post-decision | High | Evidence is hash-chained into the proof |
| Forged or repudiated decision | High | Ed25519 signature over proof hash |
| Algorithm drift over time | Medium | Deterministic replay with CI gate |
| Replay of old proof as new | Medium | Run ID uniqueness + timestamp verification |
| Key compromise | Medium | Signer KID rotation, transparency log audit |
| Malicious verifier | Low | Verifier is open-source, independent implementations encouraged |

## 3. Architecture

```
Customer Signals (logs, tickets, alerts)
        │
        ▼
  ┌─────────────┐
  │  FieldLab    │  Floci runtime: SQS, S3, DynamoDB, EventBridge
  │  Ingestion   │  (locally reproducible via Docker)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Ontology    │  Maps messy records → typed objects, links, actions
  │  Compiler    │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Decision    │  Weighted priority scoring, evidence trust, root cause
  │  Engine      │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Human       │  Operator review gate (no autonomous action)
  │  Approval    │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Proof       │  Canonical JSON + SHA-256 hash chain
  │  Builder     │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Signer      │  Ed25519 signature over proof_hash
  │  (optional)  │
  └──────┬──────┘
         │
         ▼
  ┌─────────────────────────┐
  │  Verifiable Proof       │
  │  praxis_proof.json       │
  └─────────────────────────┘
```

## 4. Protocol Specification

The full protocol specification is maintained at `docs/spec/praxis-proof-protocol.md`. A formal JSON Schema is at `docs/spec/proof-object.schema.json`.

### Key Design Decisions

- **Canonical JSON:** All hashing uses `sort_keys=True, separators=(",", ":"), ensure_ascii=True` for deterministic output regardless of JSON library or language.
- **Hash Chain:** Sub-objects (evidence, action log, replay payload) are independently hashed, then the proof hash covers the assembled body.
- **Signature Envelope:** Ed25519 signing covers `proof_hash` only, not the entire proof body, enabling partial verification without full JSON parsing.
- **Conformance Levels:** L0 (deterministic), L1 (signed), L2 (transparency-log attested) allow incremental adoption.

## 5. Determinism Guarantees

Praxis proofs are bit-deterministic. The same solution pack and input events always produce the identical `proof_hash`. This is enforced by a CI gate that generates two independent proofs from the same inputs and asserts hash equality.

See `DETERMINISM.md` for the full specification and verification procedure.

## 6. Conformance and Verification

Any conforming verifier must pass the following checks:

1. Structure: all required fields present
2. Content: evidence count > 0, ontology objects/links > 0, root cause non-empty
3. Hash integrity: recomputed proof_hash matches stored value
4. Signature (L1): Ed25519 signature over proof_hash validates
5. Transparency (L2): inclusion proof against the named transparency log

The reference verifier is published as `praxis-verify` on PyPI:

```bash
uvx praxis-verify ./praxis_proof.json
# Exit 0: valid, conformance L1
# Exit 1: invalid, prints errors
```

## 7. Related Work

- **Sigstore:** Provides keyless signing and transparency log infrastructure used by PPP for optional L2 attestation.
- **ML Provenance Graphs:** Capture data lineage but not decision-level hash integrity.
- **Constitutional AI (Anthropic):** Provides safety guarantees at the model level; PPP provides provenance at the decision artifact level.
- **Verifiable Credentials (W3C):** A related but distinct approach focused on identity claims rather than decision artifacts.
- **ZK ML:** Promising for proving model inference correctness but not yet practical for production operational pipelines.

## 8. Limitations

- **Proof covers decision output, not model internals:** PPP verifies that a decision was made on specific evidence, not that the scoring model was optimal.
- **Human-in-the-loop dependency:** The protocol assumes a human operator reviews and approves actions. Fully autonomous decision provenance is a separate challenge.
- **Single-party trust model (L0/L1):** Without transparency log attestation (L2), verification requires trusting the signer's public key. L2 addresses this through public transparency logs.
- **Key management:** Private key compromise before rotation would allow forged signatures. Sigstore's keyless approach partially mitigates this.

## 9. Future Work

- **Multi-party threshold signing:** Require N-of-M operators to approve high-severity actions.
- **Cross-language verifier in Rust:** Prove the spec is language-independent.
- **Replay-as-a-Service:** Hosted endpoint that accepts a proof URL and re-runs verification for non-technical reviewers.
- **TEE-based proof generation:** Run the proof builder in a Trusted Execution Environment for hardware-backed attestation.
- **On-chain proof anchoring:** Publish proof hashes to a blockchain for immutable timestamps.

## 10. Conclusion

The Praxis Proof Protocol is the first open specification for cryptographically verifiable AI decision provenance. It combines deterministic replay, Ed25519 signatures, and transparency log attestation into a single, practical protocol for operational AI systems.

The reference implementation — a local FieldLab runtime, a deterministic proof builder, a third-party CLI verifier, and a CI gate that enforces determinism on every commit — demonstrates the protocol end-to-end.

For forward-deployed engineering teams, solutions architects, and applied AI practitioners building systems where audit trails matter, PPP provides a concrete, verifiable answer to the question: **"How do we know the system made the right call?"**

---

**Status:** Draft v0.1  
**Repository:** [github.com/AngelP17/Praxis](https://github.com/AngelP17/Praxis)  
**License:** MIT  
**Contact:** Open an issue or discussion on the repository.
