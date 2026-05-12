#!/usr/bin/env python3
"""Compare Praxis benchmark result files."""

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Compare Praxis benchmark results")
    parser.add_argument("baseline")
    parser.add_argument("candidate")
    args = parser.parse_args()

    baseline = json.loads(Path(args.baseline).read_text())
    candidate = json.loads(Path(args.candidate).read_text())
    delta = candidate.get("proofs_valid", 0) - baseline.get("proofs_valid", 0)
    print(f"Proof validity delta: {delta}")
    print(f"Candidate replay determinism: {candidate.get('replay_determinism')}")
    return 0 if candidate.get("proofs_valid", 0) >= baseline.get("proofs_valid", 0) else 1


if __name__ == "__main__":
    raise SystemExit(main())
