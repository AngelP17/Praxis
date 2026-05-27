import json
from pathlib import Path

import pytest

from astraea.praxis import (
    PraxisProofBuilder,
    PraxisProofVerifier,
    ProofInputs,
    generate_signing_key,
    sign_proof,
)


ROOT = Path(__file__).resolve().parents[2]


def test_proof_verifier_accepts_expected_pack_proof():
    proof_path = (
        ROOT
        / "solution-packs"
        / "manufacturing-printer-gpo"
        / "expected-output"
        / "proof.json"
    )
    proof = json.loads(proof_path.read_text())

    result = PraxisProofVerifier().verify(proof)

    assert result.valid is True
    assert result.status == "PROOF VALID"
    assert result.proof_hash == proof["proof_hash"]


def test_proof_verifier_rejects_tampering():
    proof_path = (
        ROOT
        / "solution-packs"
        / "manufacturing-printer-gpo"
        / "expected-output"
        / "proof.json"
    )
    proof = json.loads(proof_path.read_text())
    proof["value_case"]["estimated_annual_value"] = 1

    result = PraxisProofVerifier().verify(proof)

    assert result.valid is False
    assert "proof_hash mismatch" in result.errors


def _generated_proof():
    events_path = ROOT / "solution-packs" / "manufacturing-printer-gpo" / "sample-events.jsonl"
    events = [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()]
    return PraxisProofBuilder().build(
        ProofInputs(solution_pack="manufacturing-printer-gpo", events=events)
    )


def test_l1_accepts_valid_ed25519_signature_without_changing_hash():
    proof = _generated_proof()
    original_hash = proof["proof_hash"]
    signed = sign_proof(dict(proof), generate_signing_key("proof-test-key"))

    result = PraxisProofVerifier(level="L1").verify(signed)

    assert result.valid is True
    assert result.conformance == "L1"
    assert signed["proof_hash"] == original_hash


def test_l2_is_unsupported_even_with_valid_signature_and_attestation():
    signed = sign_proof(dict(_generated_proof()), generate_signing_key("proof-test-key"))
    signed["attestation"] = {
        "log": "rekor",
        "entry_id": "entry",
        "log_index": 1,
        "inclusion_proof": {"hashes": []},
    }

    result = PraxisProofVerifier(level="L2").verify(signed)

    assert result.valid is False
    assert any("unsupported_attestation_verification" in error for error in result.errors)


def test_invalid_level_rejected():
    with pytest.raises(ValueError, match="Invalid verification level"):
        PraxisProofVerifier(level="L3")
