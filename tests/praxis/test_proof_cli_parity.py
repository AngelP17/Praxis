import json
import sys
from pathlib import Path

from astraea.praxis import PraxisProofBuilder, PraxisProofVerifier, ProofInputs

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "packages" / "cli" / "praxis_verify"))

from praxis_verify.cli import verify_proof  # noqa: E402


def test_core_and_independent_cli_agree_on_l0_proof():
    events_path = ROOT / "solution-packs" / "manufacturing-printer-gpo" / "sample-events.jsonl"
    events = [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()]
    proof = PraxisProofBuilder().build(
        ProofInputs(solution_pack="manufacturing-printer-gpo", events=events)
    )

    core = PraxisProofVerifier(level="L0").verify(proof)
    cli = verify_proof(proof, level="L0")

    assert cli.valid == core.valid
    assert cli.conformance == core.conformance
    assert cli.proof_hash == core.proof_hash
