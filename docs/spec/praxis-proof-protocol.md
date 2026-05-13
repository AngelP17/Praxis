# Praxis Proof Protocol v0.1

**Status:** Draft  
**Editors:** Praxis Forward-Deployed Engineering  
**Date:** 2026-05-13  
**License:** MIT

## Abstract

The Praxis Proof Protocol (PPP) defines a verifiable format and process for AI-assisted operational decisions. A Praxis proof object binds raw field evidence, compiled ontology, decision output, human action attestation, and replay verification into a deterministic, hash-chained artifact that can be independently re-verified by any conforming implementation.

This document specifies the wire format, hashing rules, conformance levels, and verification algorithm. It is the canonical reference for implements of Praxis verification, including the reference verifier at `packages/cli/praxis_verify`.

## 1. Definitions

| Term | Definition |
|------|-----------|
| **Proof Object** | A JSON document conforming to this specification that records one end-to-end operational decision cycle. |
| **Evidence** | Raw operational signals from customer systems (logs, tickets, alerts, operator notes). |
| **Ontology** | A structured model mapping raw evidence to typed objects, relationships, and available actions. |
| **Decision** | A scored, weighted priority assessment with root cause hypothesis and confidence. |
| **Action** | A human-approved or governed remediation step with audit hash. |
| **Replay** | A deterministic re-computation of the decision path given the same inputs. |
| **Value Case** | A CFO-ready annualized value estimate with confidence and primary driver. |
| **Proof Hash** | The SHA-256 digest of the entire proof object (minus the `proof_hash` and `signature` fields) in canonical JSON form. |
| **Conformance Level** | The attestation tier of a proof: L0 (deterministic), L1 (signed), L2 (transparency-log attested). |

## 2. Wire Format

A Praxis proof object is a single JSON object. The canonical specification is defined by the JSON Schema at `docs/spec/proof-object.schema.json`.

### 2.1 Required Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `proof_id` | string | Unique proof identifier (e.g., `proof_praxis_manufacturing_printer_gpo_001`) |
| `run_id` | string | FieldLab run identifier |
| `solution_pack` | string | Solution pack ID that produced this proof |
| `customer_context_hash` | string | SHA-256 digest of the customer context string |
| `evidence` | object | Evidence scoring and source metadata |
| `ontology` | object | Compiled ontology objects, links, actions, and mapping confidence |
| `decision` | object | Root cause hypothesis, priority score, confidence, next-best questions |
| `action` | object | Recommended action, mode, actor, status, and action log hash |
| `value_case` | object | Estimated annual value, confidence, primary value driver |
| `replay` | object | Replay hash, determinism flag, verification timestamp |
| `proof_hash` | string | SHA-256 digest of the canonical proof object (see Section 3) |
| `generated_at` | string | ISO 8601 UTC timestamp of proof generation |

### 2.2 Optional Signature Fields (L1 Conformance)

| Field | Type | Description |
|-------|------|-------------|
| `signature` | object | Ed25519 signature envelope |
| `signature.signing_alg` | string | Always `"ed25519"` |
| `signature.signer_kid` | string | Key identifier for the signing key |
| `signature.signature_hex` | string | Hex-encoded Ed25519 signature over `proof_hash` |
| `signature.public_key_hex` | string | Hex-encoded Ed25519 public key |

### 2.3 Optional Attestation Fields (L2 Conformance)

| Field | Type | Description |
|-------|------|-------------|
| `attestation` | object | Transparency log attestation |
| `attestation.log` | string | Log name (e.g., `"rekor"`) |
| `attestation.entry_id` | string | Log entry identifier |
| `attestation.log_index` | number | Log index |
| `attestation.inclusion_proof` | object | Inclusion proof (implementation-defined) |

## 3. Hashing Rules

### 3.1 Canonical JSON

All hashing uses canonical JSON encoding with the following properties:

```
sort_keys=True, separators=(",", ":"), ensure_ascii=True
```

### 3.2 SHA-256 Digests

Individual sub-objects (customer context, action log, replay payload) are hashed independently:

```
sha256_digest(payload) = "sha256:" + hex(sha256(canonical_json(payload)))
```

### 3.3 Proof Hash

The proof hash covers the entire proof object, excluding the `proof_hash` field itself and any signature/attestation fields:

```
normalized = dict(proof)
normalized.pop("proof_hash", None)
normalized.pop("signature", None)
normalized.pop("attestation", None)
proof_hash = sha256_digest(normalized)
```

## 4. Verification Algorithm

A conforming verifier **MUST** perform the following checks in order:

1. **Structure Validation:** All required top-level fields are present.
2. **Content Validation:** Evidence count > 0, ontology objects/links > 0, root cause non-empty, determinism flag is true.
3. **Hash Integrity:** Recompute `proof_hash` from the canonical proof body and compare with the stored value.
4. **Signature Verification (L1 only):** If `signature` is present, verify the Ed25519 signature over `proof_hash` using `public_key_hex`.
5. **Transparency Verification (L2 only):** If `attestation` is present, verify the inclusion proof against the named transparency log.

The verifier **MUST** exit 0 only if all applicable checks pass.

## 5. Conformance Levels

| Level | Requirements | Verification |
|-------|-------------|-------------|
| **L0 Deterministic** | Valid structure, hash integrity, determinism flag | Hash recomputation |
| **L1 Signed** | L0 + Ed25519 signature envelope | Signature verification |
| **L2 Attested** | L1 + transparency log entry | Inclusion proof verification |

## 6. Threat Model

| Threat | Mitigation |
|--------|-----------|
| Tampered proof body | Hash chain covers all evidence through replay |
| Forged signature | Ed25519 public key verification |
| Replay attack | Run ID uniqueness + timestamp freshness |
| Algorithm drift | Deterministic replay with CI gate |
| Key compromise | Signer KID rotation + transparency log audit |

## 7. Non-Goals

- On-chain proof storage (out of scope for v0.1)
- Zero-knowledge proofs of decision correctness
- Multi-party threshold signing
- Real-time streaming attestation (SSE-based live verification is provided by the reference implementation as a UX feature, not a protocol requirement)

## 8. Reference Implementation

- **Proof Builder:** `packages/astraea-core/astraea/praxis/proof_object.py`
- **Proof Verifier:** `packages/astraea-core/astraea/praxis/proof_verifier.py`
- **CLI Verifier:** `packages/cli/praxis_verify/` (PyPI: `praxis-verify`)
- **One-liner:** `uvx praxis-verify ./praxis_proof.json`

## 9. References

- [SHA-256 (FIPS 180-4)](https://csrc.nist.gov/pubs/fips/180-4/final)
- [Ed25519 (RFC 8032)](https://www.rfc-editor.org/rfc/rfc8032)
- [Sigstore](https://www.sigstore.dev/)
- [Rekor Transparency Log](https://github.com/sigstore/rekor)
