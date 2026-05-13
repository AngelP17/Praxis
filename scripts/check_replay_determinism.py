#!/usr/bin/env python3
"""Determinism gate: run proof generation twice and assert identical hashes.

Usage:
    python scripts/check_replay_determinism.py --solution-pack manufacturing-printer-gpo
    Exit 0 if hashes match, exit 1 if they diverge.
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "packages" / "astraea-core"))

from pipelines.fieldlab import FlociClient
from astraea.praxis import PraxisProofBuilder, ProofInputs


FAIL = 1
SUCCESS = 0


def load_sample_events(solution_pack: str) -> list[dict]:
    events_path = ROOT / "solution-packs" / solution_pack / "sample-events.jsonl"
    if not events_path.is_file():
        raise FileNotFoundError(f"No sample events at {events_path}")
    return [json.loads(line) for line in events_path.read_text().strip().splitlines() if line.strip()]


def main() -> int:
    parser = argparse.ArgumentParser(description="Determinism gate for Praxis proof generation")
    parser.add_argument(
        "--solution-pack", default="manufacturing-printer-gpo", help="Solution pack ID"
    )
    parser.add_argument(
        "--output-dir",
        default=str(ROOT / "artifacts" / "determinism"),
        help="Directory for generated proofs",
    )
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        events = load_sample_events(args.solution_pack)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return FAIL

    builder = PraxisProofBuilder()
    inputs = ProofInputs(
        solution_pack=args.solution_pack,
        events=events,
        customer_context="",
        run_id=f"fieldlab_determinism_{args.solution_pack}",
    )

    print(f"=== Praxis Determinism Gate ===")
    print(f"Solution pack: {args.solution_pack}")
    print(f"Events loaded: {len(events)}")
    print()

    print("Run 1: generating proof...")
    proof_a = builder.build(inputs)
    hash_a = proof_a["proof_hash"]
    print(f"  Proof hash: {hash_a}")

    print("Run 2: generating proof...")
    proof_b = builder.build(inputs)
    hash_b = proof_b["proof_hash"]
    print(f"  Proof hash: {hash_b}")

    proof_a_path = output_dir / "run_1_praxis_proof.json"
    proof_b_path = output_dir / "run_2_praxis_proof.json"
    proof_a_path.write_text(json.dumps(proof_a, indent=2, sort_keys=True) + "\n")
    proof_b_path.write_text(json.dumps(proof_b, indent=2, sort_keys=True) + "\n")

    if hash_a == hash_b:
        print()
        print("DETERMINISM GATE: PASSED")
        print(f"Both runs produced identical proof hash: {hash_a}")
        return SUCCESS
    else:
        print()
        print("DETERMINISM GATE: FAILED")
        print(f"Run 1 hash: {hash_a}")
        print(f"Run 2 hash: {hash_b}")
        print(f"Proofs saved to {output_dir}/ for inspection")
        return FAIL


if __name__ == "__main__":
    raise SystemExit(main())
