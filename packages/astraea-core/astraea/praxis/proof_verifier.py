"""Verification for Praxis proof artifacts."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .proof_hash import proof_hash

try:
    from cryptography.exceptions import InvalidSignature as CryptoInvalidSignature
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    HAS_CRYPTOGRAPHY = True
except ImportError:
    HAS_CRYPTOGRAPHY = False


@dataclass(frozen=True)
class ProofVerificationResult:
    valid: bool
    status: str
    errors: list[str]
    proof_hash: str


class PraxisProofVerifier:
    """Validate structure and deterministic hash integrity for proof objects."""

    REQUIRED_TOP_LEVEL = {
        "proof_id",
        "run_id",
        "solution_pack",
        "customer_context_hash",
        "evidence",
        "ontology",
        "decision",
        "action",
        "value_case",
        "replay",
        "proof_hash",
    }

    def verify(self, proof: dict[str, Any]) -> ProofVerificationResult:
        errors: list[str] = []
        missing = sorted(self.REQUIRED_TOP_LEVEL - set(proof))
        if missing:
            errors.append(f"missing fields: {', '.join(missing)}")

        evidence = proof.get("evidence", {})
        if evidence.get("raw_events", 0) <= 0:
            errors.append("evidence.raw_events must be greater than zero")
        if evidence.get("evidence_trust", 0) < 0.6:
            errors.append("evidence.evidence_trust below verification threshold")

        ontology = proof.get("ontology", {})
        if ontology.get("objects_created", 0) <= 0:
            errors.append("ontology.objects_created must be greater than zero")
        if ontology.get("links_created", 0) <= 0:
            errors.append("ontology.links_created must be greater than zero")

        decision = proof.get("decision", {})
        if not decision.get("root_cause_hypothesis"):
            errors.append("decision.root_cause_hypothesis is required")

        replay = proof.get("replay", {})
        if not replay.get("deterministic"):
            errors.append("replay.deterministic must be true")

        computed_hash = proof_hash(proof)
        if proof.get("proof_hash") != computed_hash:
            errors.append("proof_hash mismatch")

        sig = proof.get("signature") if HAS_CRYPTOGRAPHY else None
        if sig:
            try:
                public_key = Ed25519PublicKey.from_public_bytes(
                    bytes.fromhex(sig.get("public_key_hex", ""))
                )
                public_key.verify(
                    bytes.fromhex(sig.get("signature_hex", "")),
                    computed_hash.encode("utf-8"),
                )
            except (CryptoInvalidSignature, ValueError, KeyError):
                errors.append("ed25519 signature verification failed")
        elif sig and not HAS_CRYPTOGRAPHY:
            errors.append("cryptography not available; cannot verify signature")

        valid = not errors
        return ProofVerificationResult(
            valid=valid,
            status="PROOF VALID" if valid else "PROOF INVALID",
            errors=errors,
            proof_hash=computed_hash,
        )
