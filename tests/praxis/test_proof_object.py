import json
from pathlib import Path

from astraea.praxis import PraxisProofBuilder, ProofInputs


ROOT = Path(__file__).resolve().parents[2]


def test_proof_object_contains_field_loop_sections():
    events_path = ROOT / "solution-packs" / "manufacturing-printer-gpo" / "sample-events.jsonl"
    events = [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()]

    proof = PraxisProofBuilder().build(
        ProofInputs(solution_pack="manufacturing-printer-gpo", events=events)
    )

    assert proof["proof_id"] == "proof_praxis_manufacturing_printer_gpo_001"
    assert proof["evidence"]["raw_events"] == 12
    assert proof["ontology"]["objects_created"] > 0
    assert proof["decision"]["priority_score"] == 0.7708
    assert proof["decision"]["root_cause_hypothesis"] == "printer_deployment_policy_drift"
    assert proof["decision"]["requires_human_review"] is True
    assert proof["action"]["mode"] == "HUMAN_APPROVAL"
    assert proof["action"]["status"] == "approved"
    assert proof["value_case"]["estimated_annual_value"] == 38481.6
    assert proof["value_case"]["confidence"] == 0.7601
    assert proof["proof_hash"].startswith("sha256:")
