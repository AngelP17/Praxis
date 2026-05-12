import json
from pathlib import Path

from astraea.praxis import PraxisProofVerifier


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
