import json
from pathlib import Path
import pytest
from jsonschema import validate, ValidationError

from astraea.praxis import PraxisProofBuilder, ProofInputs

ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "docs/spec" / "proof-object.schema.json"


@pytest.fixture
def schema():
    with open(SCHEMA_PATH) as f:
        return json.load(f)


@pytest.fixture
def base_proof():
    events_path = ROOT / "solution-packs" / "manufacturing-printer-gpo" / "sample-events.jsonl"
    events = [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()]
    return PraxisProofBuilder().build(
        ProofInputs(solution_pack="manufacturing-printer-gpo", events=events)
    )


def test_generated_proof_validates_against_schema(schema, base_proof):
    """The generated proof object must fully validate against the JSON Schema."""
    validate(instance=base_proof, schema=schema)


def test_expected_solution_pack_proofs_validate_against_schema(schema):
    """All committed solution pack proof fixtures must validate against the schema."""
    packs = [
        "manufacturing-printer-gpo",
        "network-edge-failover",
        "identity-onboarding-drift",
        "database-failover-lag",
    ]
    for pack in packs:
        proof_path = ROOT / "solution-packs" / pack / "expected-output" / "proof.json"
        proof = json.loads(proof_path.read_text())
        validate(instance=proof, schema=schema)


def test_invalid_action_mode_fails_schema(schema, base_proof):
    """An action mode outside the allowed lowercase enum list must fail validation."""
    tampered_proof = dict(base_proof)
    tampered_proof["action"] = dict(base_proof["action"])
    tampered_proof["action"]["mode"] = "SUPER_MUTATION"
    with pytest.raises(ValidationError) as excinfo:
        validate(instance=tampered_proof, schema=schema)
    assert "SUPER_MUTATION" in str(excinfo.value)


def test_missing_generated_at_fails_schema(schema, base_proof):
    """Removing the required top-level 'generated_at' field must fail validation."""
    tampered_proof = dict(base_proof)
    tampered_proof.pop("generated_at", None)
    with pytest.raises(ValidationError) as excinfo:
        validate(instance=tampered_proof, schema=schema)
    assert "'generated_at' is a required property" in str(excinfo.value)


def test_invalid_hash_prefix_fails_schema(schema, base_proof):
    """A proof hash lacking the required sha256 prefix must fail validation."""
    tampered_proof = dict(base_proof)
    # Remove the "sha256:" prefix, violating the schema pattern
    tampered_proof["proof_hash"] = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    with pytest.raises(ValidationError) as excinfo:
        validate(instance=tampered_proof, schema=schema)
    assert "does not match" in str(excinfo.value)
