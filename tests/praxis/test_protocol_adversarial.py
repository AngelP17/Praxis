import json
from pathlib import Path
import pytest

from astraea.praxis import PraxisProofBuilder, PraxisProofVerifier, ProofInputs
from astraea.praxis.proof_hash import proof_hash

ROOT = Path(__file__).resolve().parents[2]


@pytest.fixture
def base_proof():
    events_path = ROOT / "solution-packs" / "manufacturing-printer-gpo" / "sample-events.jsonl"
    events = [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()]
    return PraxisProofBuilder().build(
        ProofInputs(solution_pack="manufacturing-printer-gpo", events=events)
    )


def test_modify_evidence_fails(base_proof):
    """Modifying evidence after the hash has been generated must cause verification to fail."""
    tampered = dict(base_proof)
    tampered["evidence"] = dict(base_proof["evidence"])
    tampered["evidence"]["raw_events"] += 1

    verifier = PraxisProofVerifier(level="L0")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert "proof_hash mismatch" in result.errors


def test_modify_ontology_fails(base_proof):
    """Modifying ontology after the hash has been generated must cause verification to fail."""
    tampered = dict(base_proof)
    tampered["ontology"] = dict(base_proof["ontology"])
    tampered["ontology"]["objects_created"] += 1

    verifier = PraxisProofVerifier(level="L0")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert "proof_hash mismatch" in result.errors


def test_modify_decision_score_fails(base_proof):
    """Modifying decision priority score after the hash has been generated must cause verification to fail."""
    tampered = dict(base_proof)
    tampered["decision"] = dict(base_proof["decision"])
    tampered["decision"]["priority_score"] = 0.99

    verifier = PraxisProofVerifier(level="L0")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert "proof_hash mismatch" in result.errors


def test_modify_action_status_fails(base_proof):
    """Modifying action status after the hash has been generated must cause verification to fail."""
    tampered = dict(base_proof)
    tampered["action"] = dict(base_proof["action"])
    tampered["action"]["status"] = "rejected"

    verifier = PraxisProofVerifier(level="L0")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert "proof_hash mismatch" in result.errors


def test_modify_value_case_fails(base_proof):
    """Modifying value case estimated annual value after the hash has been generated must cause verification to fail."""
    tampered = dict(base_proof)
    tampered["value_case"] = dict(base_proof["value_case"])
    tampered["value_case"]["estimated_annual_value"] += 1000.0

    verifier = PraxisProofVerifier(level="L0")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert "proof_hash mismatch" in result.errors


def test_remove_required_field_fails(base_proof):
    """Removing a required top-level field must fail schema validation and verifier."""
    tampered = dict(base_proof)
    tampered.pop("run_id")

    verifier = PraxisProofVerifier(level="L0")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert any("schema validation" in err or "missing fields" in err for err in result.errors)


def test_l1_fails_on_missing_signature(base_proof):
    """Under L1, verification must fail closed if signature block is missing."""
    verifier = PraxisProofVerifier(level="L1")
    result = verifier.verify(base_proof)
    assert result.valid is False
    assert "L1 verification failed: missing signature" in result.errors


def test_l1_fails_on_malformed_signature(base_proof):
    """Under L1, verification must fail closed if signature block is malformed."""
    tampered = dict(base_proof)
    tampered["signature"] = {
        "signing_alg": "ed25519",
        "signer_kid": "key_001",
        "signature_hex": "a" * 128,
        "public_key_hex": "b" * 64,
    }

    verifier = PraxisProofVerifier(level="L1")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert any(
        "signature verification failed" in err or "cryptography not available" in err
        for err in result.errors
    )


def test_l1_fails_on_copied_signature(base_proof):
    """Under L1, copying a valid signature from another proof must fail signature verification."""
    tampered = dict(base_proof)
    tampered["signature"] = {
        "signing_alg": "ed25519",
        "signer_kid": "key_001",
        "signature_hex": "c" * 128,
        "public_key_hex": "d" * 64,
    }
    verifier = PraxisProofVerifier(level="L1")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert any(
        "signature verification failed" in err or "cryptography not available" in err
        for err in result.errors
    )


def test_l2_fails_closed_on_missing_attestation(base_proof):
    """Under L2, verification must fail closed if attestation block is missing."""
    tampered = dict(base_proof)
    tampered["signature"] = {
        "signing_alg": "ed25519",
        "signer_kid": "key_001",
        "signature_hex": "e" * 128,
        "public_key_hex": "f" * 64,
    }
    verifier = PraxisProofVerifier(level="L2")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert any("missing attestation block" in err for err in result.errors)


def test_l2_fails_closed_on_invalid_inclusion_proof(base_proof):
    """Under L2, verification must fail closed if the attestation block is present but invalid."""
    tampered = dict(base_proof)
    tampered["signature"] = {
        "signing_alg": "ed25519",
        "signer_kid": "key_001",
        "signature_hex": "0" * 128,
        "public_key_hex": "0" * 64,
    }
    tampered["attestation"] = {
        "log": "rekor",
        "entry_id": "entry_001",
    }

    verifier = PraxisProofVerifier(level="L2")
    result = verifier.verify(tampered)
    assert result.valid is False
    assert any(
        "invalid Sigstore bundle" in err
        or "missing attestation block" in err
        or "signature verification failed" in err
        for err in result.errors
    )


def test_generate_same_proof_twice_has_same_hash(base_proof):
    """Generating the same proof twice under identical inputs must produce the identical hash."""
    events_path = ROOT / "solution-packs" / "manufacturing-printer-gpo" / "sample-events.jsonl"
    events = [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()]
    proof2 = PraxisProofBuilder().build(
        ProofInputs(solution_pack="manufacturing-printer-gpo", events=events)
    )
    assert base_proof["proof_hash"] == proof2["proof_hash"]


def test_generate_same_proof_after_signing_has_same_hash(base_proof):
    """Canonical proof hash must exclude the signature and attestation envelopes, resulting in the identical hash."""
    signed_proof = dict(base_proof)
    signed_proof["signature"] = {
        "signing_alg": "ed25519",
        "signer_kid": "key_001",
        "signature_hex": "f" * 128,
        "public_key_hex": "e" * 64,
    }

    attested_proof = dict(signed_proof)
    attested_proof["attestation"] = {
        "log": "rekor",
        "entry_id": "entry_001",
        "log_index": 42,
        "inclusion_proof": {"dummy": "proof"},
    }

    assert proof_hash(base_proof) == proof_hash(signed_proof)
    assert proof_hash(base_proof) == proof_hash(attested_proof)
