"""Verification for Praxis proof artifacts."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .proof_hash import proof_hash
from .proof_schema import schema_errors

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
    level: str
    conformance: str


class PraxisProofVerifier:
    """Validate structure and deterministic hash integrity for proof objects."""

    def __init__(self, level: str = "L0"):
        if level not in ("L0", "L1", "L2"):
            raise ValueError(
                f"Invalid verification level: {level}. Must be one of L0, L1, L2."
            )
        self.level = level

    def verify(self, proof: dict[str, Any]) -> ProofVerificationResult:
        errors: list[str] = []

        # JSON Schema is part of L0, not an optional enhancement.
        errors.extend(schema_errors(proof))

        # 2. Extract sections for deep semantic validation
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

        # 3. Hash validation
        computed_hash = proof_hash(proof)
        if proof.get("proof_hash") != computed_hash:
            errors.append("proof_hash mismatch")

        # 4. Level-specific validations
        sig = proof.get("signature")
        if self.level in ("L1", "L2"):
            if not sig:
                errors.append(f"{self.level} verification failed: missing signature")
            elif not HAS_CRYPTOGRAPHY:
                errors.append("cryptography not available; cannot verify signature")
            else:
                try:
                    public_key = Ed25519PublicKey.from_public_bytes(
                        bytes.fromhex(sig.get("public_key_hex", ""))
                    )
                    public_key.verify(
                        bytes.fromhex(sig.get("signature_hex", "")),
                        computed_hash.encode("utf-8"),
                    )
                except (CryptoInvalidSignature, ValueError, KeyError, TypeError):
                    errors.append("ed25519 signature verification failed")
        # L2 is specified but unsupported until cryptographic bundle verification exists.
        if self.level == "L2":
            errors.append(
                "unsupported_attestation_verification: L2 Sigstore/Rekor inclusion "
                "verification is not implemented"
            )

        valid = not errors
        return ProofVerificationResult(
            valid=valid,
            status="PROOF VALID" if valid else "PROOF INVALID",
            errors=errors,
            proof_hash=computed_hash,
            level=self.level,
            conformance=self.level if valid else "INVALID",
        )
