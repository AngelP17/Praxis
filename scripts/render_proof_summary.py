#!/usr/bin/env python3
"""Render a compact Markdown summary for a Praxis proof."""

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Render Praxis proof summary")
    parser.add_argument("proof_path", help="Path to praxis_proof.json")
    parser.add_argument("--output", default="artifacts/latest/proof-summary.md")
    args = parser.parse_args()

    proof_path = Path(args.proof_path)
    proof = json.loads(proof_path.read_text())
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    output_path.write_text(
        "\n".join(
            [
                "# Praxis Proof Summary",
                "",
                f"- Solution pack: `{proof['solution_pack']}`",
                f"- Proof hash: `{proof['proof_hash']}`",
                f"- Events: {proof['evidence']['raw_events']}",
                f"- Evidence trust: {proof['evidence']['evidence_trust']}",
                f"- Ontology objects: {proof['ontology']['objects_created']}",
                f"- Ontology links: {proof['ontology']['links_created']}",
                f"- Decision: {proof['decision']['root_cause_hypothesis']}",
                f"- Human action: {proof['action']['status']}",
                f"- Annual value: ${proof['value_case']['estimated_annual_value']:,}",
                "",
            ]
        )
    )
    print(f"Proof summary written: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
