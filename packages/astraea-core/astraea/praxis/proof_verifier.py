"""Verification for Praxis proof artifacts."""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
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

    def __init__(self, level: str = "L0"):
        if level not in ("L0", "L1", "L2"):
            raise ValueError(f"Invalid verification level: {level}. Must be one of L0, L1, L2.")
        self.level = level

    def verify(self, proof: dict[str, Any]) -> ProofVerificationResult:
        errors: list[str] = []

        # 1. L0 Schema Validation (using jsonschema)
        try:
            from jsonschema import validate, ValidationError
            schema_path = self._find_schema_path()
            with open(schema_path) as f:
                schema = json.load(f)
            validate(instance=proof, schema=schema)
        except ImportError:
            # Fallback if jsonschema is not installed (e.g. in minimal environments)
            missing = sorted(self.REQUIRED_TOP_LEVEL - set(proof))
            if missing:
                errors.append(f"missing fields: {', '.join(missing)}")
        except ValidationError as e:
            errors.append(f"schema validation error: {e.message}")
        except Exception as e:
            errors.append(f"schema load/validation failed: {str(e)}")

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
        else:
            # L0 signature check (optional, verify only if present and possible)
            if sig:
                if HAS_CRYPTOGRAPHY:
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
                else:
                    errors.append("cryptography not available; cannot verify signature")

        # L2 Attestation validation (Sigstore bundle check)
        if self.level == "L2":
            attestation = proof.get("attestation")
            if not attestation:
                errors.append("L2 verification failed: missing attestation block (experimental fails closed)")
            else:
                log = attestation.get("log")
                entry_id = attestation.get("entry_id")
                log_index = attestation.get("log_index")
                inclusion_proof = attestation.get("inclusion_proof")
                if not (log and entry_id and log_index is not None and inclusion_proof):
                    errors.append("L2 verification failed: invalid Sigstore bundle or experimental failure")

        valid = not errors
        return ProofVerificationResult(
            valid=valid,
            status="PROOF VALID" if valid else "PROOF INVALID",
            errors=errors,
            proof_hash=computed_hash,
        )

    def _find_schema_path(self) -> Path:
        # Try relative to __file__
        cur = Path(__file__).resolve()
        for parent in cur.parents:
            potential = parent / "docs" / "spec" / "proof-object.schema.json"
            if potential.is_file():
                return potential
        # fallback to current workspace or search up
        potential = Path.cwd() / "docs" / "spec" / "proof-object.schema.json"
        if potential.is_file():
            return potential
        # fallback 4 directories up
        potential = Path(__file__).resolve().parent.parent.parent.parent / "docs" / "spec" / "proof-object.schema.json"
        if potential.is_file():
            return potential
        raise FileNotFoundError("Could not locate proof-object.schema.json")
