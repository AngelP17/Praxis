#!/usr/bin/env python3
"""Praxis proof verifier CLI — independent third-party verification for PPP v0.1.

Usage:
    praxis-verify ./praxis_proof.json
    uvx praxis-verify ./praxis_proof.json
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

try:
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    from cryptography.exceptions import InvalidSignature

    HAS_CRYPTOGRAPHY = True
except ImportError:
    HAS_CRYPTOGRAPHY = False


@dataclass(frozen=True)
class VerificationResult:
    valid: bool
    conformance: str
    proof_hash: str
    signature_verified: bool | None
    errors: list[str]


def normalize_numbers(payload: Any) -> Any:
    if isinstance(payload, dict):
        return {key: normalize_numbers(value) for key, value in payload.items()}
    if isinstance(payload, list):
        return [normalize_numbers(value) for value in payload]
    if isinstance(payload, float) and payload.is_integer():
        return int(payload)
    return payload


def canonical_json(payload: Any) -> str:
    return json.dumps(
        normalize_numbers(payload), sort_keys=True, separators=(",", ":"), ensure_ascii=True
    )


def sha256_hex(data: str) -> str:
    import hashlib

    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def sha256_digest(payload: Any) -> str:
    return f"sha256:{sha256_hex(canonical_json(payload))}"


def compute_proof_hash(proof: dict[str, Any]) -> str:
    normalized = dict(proof)
    normalized.pop("proof_hash", None)
    normalized.pop("signature", None)
    normalized.pop("attestation", None)
    return sha256_digest(normalized)


def load_schema() -> dict[str, Any]:
    packaged = Path(__file__).with_name("proof-object.schema.json")
    if packaged.is_file():
        return json.loads(packaged.read_text(encoding="utf-8"))
    for parent in Path(__file__).resolve().parents:
        candidate = parent / "docs" / "spec" / "proof-object.schema.json"
        if candidate.is_file():
            return json.loads(candidate.read_text(encoding="utf-8"))
    raise FileNotFoundError("proof-object.schema.json not found")


def verify_proof(proof: dict[str, Any], level: str = "L0") -> VerificationResult:
    if level not in {"L0", "L1", "L2"}:
        raise ValueError("level must be one of L0, L1, L2")
    errors: list[str] = []

    validator = Draft202012Validator(load_schema())
    for error in sorted(validator.iter_errors(proof), key=lambda item: list(item.absolute_path)):
        errors.append(f"schema validation error: {error.message}")

    evidence = proof.get("evidence", {})
    if evidence.get("raw_events", 0) <= 0:
        errors.append("evidence.raw_events must be > 0")
    if evidence.get("evidence_trust", 0) < 0.6:
        errors.append("evidence.evidence_trust below threshold")

    ontology = proof.get("ontology", {})
    if ontology.get("objects_created", 0) <= 0:
        errors.append("ontology.objects_created must be > 0")
    if ontology.get("links_created", 0) <= 0:
        errors.append("ontology.links_created must be > 0")

    decision = proof.get("decision", {})
    if not decision.get("root_cause_hypothesis"):
        errors.append("decision.root_cause_hypothesis is required")

    replay = proof.get("replay", {})
    if not replay.get("deterministic"):
        errors.append("replay.deterministic must be true")

    computed_hash = compute_proof_hash(proof)
    if proof.get("proof_hash") != computed_hash:
        errors.append(f"proof_hash mismatch: expected {computed_hash}")

    signature_verified = None
    sig = proof.get("signature")
    if level in {"L1", "L2"} and not sig:
        errors.append(f"{level} verification failed: missing signature")
    elif level in {"L1", "L2"} and not HAS_CRYPTOGRAPHY:
        errors.append("cryptography package not installed; cannot verify ed25519 signature")
    elif level in {"L1", "L2"} and sig:
        try:
            public_key = Ed25519PublicKey.from_public_bytes(bytes.fromhex(sig["public_key_hex"]))
            public_key.verify(
                bytes.fromhex(sig["signature_hex"]), proof["proof_hash"].encode("utf-8")
            )
            signature_verified = True
        except (InvalidSignature, ValueError, KeyError):
            signature_verified = False
            errors.append("ed25519 signature verification failed")

    if level == "L2":
        errors.append(
            "unsupported_attestation_verification: L2 Sigstore/Rekor inclusion "
            "verification is not implemented"
        )

    valid = not errors
    conformance = level
    if not valid:
        conformance = "INVALID"

    return VerificationResult(
        valid=valid,
        conformance=conformance,
        proof_hash=computed_hash,
        signature_verified=signature_verified,
        errors=errors,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify a Praxis proof object (PPP v0.1)")
    parser.add_argument("proof_path", help="Path to praxis_proof.json")
    parser.add_argument("--level", choices=("L0", "L1", "L2"), default="L0")
    parser.add_argument(
        "--quiet", "-q", action="store_true", help="Suppress output, exit code only"
    )
    args = parser.parse_args()

    proof_path = Path(args.proof_path)
    if not proof_path.is_file():
        if not args.quiet:
            print(f"Error: proof file not found: {proof_path}", file=sys.stderr)
        return 1

    try:
        proof = json.loads(proof_path.read_text())
    except json.JSONDecodeError as e:
        if not args.quiet:
            print(f"Error: invalid JSON: {e}", file=sys.stderr)
        return 1

    result = verify_proof(proof, level=args.level)

    if not args.quiet:
        print("Praxis Proof Verification")
        print(f"  Proof file: {proof_path}")
        print(f"  Solution pack: {proof.get('solution_pack', 'unknown')}")
        print(f"  Events: {proof.get('evidence', {}).get('raw_events', 0)}")
        print(
            f"  Ontology: {proof.get('ontology', {}).get('objects_created', 0)} objects, "
            f"{proof.get('ontology', {}).get('links_created', 0)} links"
        )
        print(f"  Decision: priority {proof.get('decision', {}).get('priority_score', 0):.2f}")
        print(f"  Action: {proof.get('action', {}).get('status', 'unknown')}")
        print(
            f"  Value: ${proof.get('value_case', {}).get('estimated_annual_value', 0):,.0f} annualized"
        )
        print(f"  Replay hash: {proof.get('replay', {}).get('replay_hash', '')}")
        print(f"  Proof hash: {result.proof_hash}")
        if result.signature_verified is not None:
            print(f"  Signature: {'VALID' if result.signature_verified else 'INVALID'} (ed25519)")
        print(f"  Conformance: {result.conformance}")
        print()
        print(f"Status: {'PASS' if result.valid else 'FAIL'}")
        if result.errors:
            for error in result.errors:
                print(f"  - {error}")

    return 0 if result.valid else 1


if __name__ == "__main__":
    raise SystemExit(main())
