#!/usr/bin/env python3
"""Verify a Praxis proof artifact."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "packages" / "astraea-core"))

from astraea.praxis import PraxisProofVerifier


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify a Praxis proof object")
    parser.add_argument("proof_path", help="Path to praxis_proof.json")
    args = parser.parse_args()

    proof_path = Path(args.proof_path)
    if not proof_path.is_file():
        print(f"Proof file not found: {proof_path}")
        return 1

    proof = json.loads(proof_path.read_text())
    result = PraxisProofVerifier().verify(proof)

    print("Praxis Proof Verification")
    print()
    print(f"Solution Pack: {proof.get('solution_pack')}")
    print(f"Events loaded: {proof.get('evidence', {}).get('raw_events')}")
    print(f"Ontology objects: {proof.get('ontology', {}).get('objects_created')}")
    print(f"Ontology links: {proof.get('ontology', {}).get('links_created')}")
    print(f"Decision replay: {'verified' if proof.get('replay', {}).get('deterministic') else 'failed'}")
    print(f"Evidence trust: {proof.get('evidence', {}).get('evidence_trust')}")
    print(f"Value case: ${proof.get('value_case', {}).get('estimated_annual_value'):,} annualized")
    print(f"Human action: {proof.get('action', {}).get('status')}")
    print(f"Proof hash: {result.proof_hash}")
    print()
    print(f"Status: {result.status}")
    if result.errors:
        print("Errors:")
        for error in result.errors:
            print(f"  - {error}")
    return 0 if result.valid else 1


if __name__ == "__main__":
    raise SystemExit(main())
