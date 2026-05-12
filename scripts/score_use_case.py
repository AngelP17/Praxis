#!/usr/bin/env python3
"""Score a customer use case using the Praxis Use Case Qualification Scorer."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "packages" / "astraea-core"))


def main():
    parser = argparse.ArgumentParser(description="Score a customer use case")
    parser.add_argument("--pain", type=float, default=0.5, help="Pain intensity (0-1)")
    parser.add_argument("--data", type=float, default=0.5, help="Data readiness (0-1)")
    parser.add_argument("--urgency", type=float, default=0.5, help="Stakeholder urgency (0-1)")
    parser.add_argument("--writeback", type=float, default=0.5, help="Writeback potential (0-1)")
    parser.add_argument("--value", type=float, default=0.5, help="Measurable value (0-1)")
    parser.add_argument("--deploy", type=float, default=0.5, help="Deployability (0-1)")
    parser.add_argument("--security", type=float, default=0.5, help="Security feasibility (0-1)")
    parser.add_argument("--expansion", type=float, default=0.5, help="Expansion leverage (0-1)")
    parser.add_argument("--differentiation", type=float, default=0.5, help="Differentiation (0-1)")
    args = parser.parse_args()

    from astraea.praxis.use_case_score import UseCaseScorer  # noqa: E402

    scorer = UseCaseScorer()
    result = scorer.score(
        {
            "pain_intensity": args.pain,
            "data_readiness": args.data,
            "stakeholder_urgency": args.urgency,
            "workflow_writeback_potential": args.writeback,
            "measurable_value": args.value,
            "deployability": args.deploy,
            "security_feasibility": args.security,
            "expansion_leverage": args.expansion,
            "differentiation": args.differentiation,
        }
    )

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
