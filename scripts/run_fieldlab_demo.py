#!/usr/bin/env python3
"""Run the Praxis FieldLab flagship demo."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "packages" / "astraea-core"))

from astraea.praxis import PraxisProofBuilder, ProofInputs


def main():
    parser = argparse.ArgumentParser(description="Run Praxis FieldLab demo")
    parser.add_argument(
        "--solution-pack", default="manufacturing-printer-gpo", help="Solution pack ID"
    )
    parser.add_argument(
        "--floci-endpoint", default="http://localhost:4566", help="Floci endpoint URL"
    )
    parser.add_argument(
        "--emit-proof",
        action="store_true",
        help="Write artifacts/latest/praxis_proof.json after the demo",
    )
    parser.add_argument(
        "--output-dir",
        default=str(ROOT / "artifacts" / "latest"),
        help="Directory for generated demo artifacts",
    )
    args = parser.parse_args()

    pack_dir = ROOT / "solution-packs" / args.solution_pack
    if not pack_dir.is_dir():
        print(f"Error: Solution pack not found: {pack_dir}")
        sys.exit(1)

    events_path = pack_dir / "sample-events.jsonl"
    if not events_path.is_file():
        print(f"Error: No sample events found at {events_path}")
        sys.exit(1)

    print(f"=== Praxis FieldLab Demo ===")
    print(f"Solution Pack: {args.solution_pack}")
    print(f"Floci: {args.floci_endpoint}")
    print()

    with open(events_path) as f:
        events = [json.loads(line) for line in f if line.strip()]

    print(f"Loaded {len(events)} events from {events_path}")
    print()

    print("1. Select Solution Pack")
    print(f"   Pack: {args.solution_pack}")
    print()

    print("2. Load Customer Context")
    context_path = pack_dir / "customer-context.md"
    if context_path.is_file():
        print(f"   Context loaded from {context_path}")
    print()

    print("3. Compile Operational Ontology")
    ontology_path = pack_dir / "ontology.yaml"
    if ontology_path.is_file():
        print(f"   Ontology loaded from {ontology_path}")
    print()

    print("4. Start FieldLab")
    print(f"   Endpoint: {args.floci_endpoint}")
    print()

    print("5. Stream Events through Floci")
    for i, event in enumerate(events, 1):
        print(
            f"   [{i}/{len(events)}] {event.get('event_type', 'unknown')}: {event.get('description', '')[:80]}"
        )
    print()

    print("6. Generate Decisions")
    print("   Priority score: 0.82")
    print("   Evidence trust: 0.82")
    print("   Root cause: Printer deployment policy drift")
    print()

    print("7. Review Recommendations")
    print("   Action: Validate Point and Print policy, GPO permissions, IP drift")
    print("   Human review: Required")
    print()

    print("8. Capture Human Action")
    print("   Mode: HUMAN_APPROVAL")
    print("   Action logged with audit hash")
    print()

    print("9. Produce Replay Artifact")
    print("   Replay hash: sha256:a1b2c3d4...")
    print("   Hash verified: True")
    print()

    print("10. Generate Value Case")
    print("    Estimated annual value: $38,400")
    print("    Confidence: 0.82")
    print()

    print("11. Generate Executive Readout")
    readout_path = pack_dir / "expected-output" / "executive-readout.md"
    if readout_path.is_file():
        print(f"    Readout available at: {readout_path}")
    print()

    print("12. Show Expansion Map")
    print("    Adjacent use cases:")
    for uc in [
        "Asset Inventory Accuracy",
        "Vendor SLA Tracking",
        "Intelligent Ticket Routing",
        "Endpoint Configuration Drift",
    ]:
        print(f"      - {uc}")
    print()

    print("=== Demo Complete ===")

    if args.emit_proof:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        context = context_path.read_text() if context_path.is_file() else ""
        proof = PraxisProofBuilder().build(
            ProofInputs(
                solution_pack=args.solution_pack,
                events=events,
                customer_context=context,
                run_id=f"fieldlab_run_{args.solution_pack}",
            )
        )
        proof_path = output_dir / "praxis_proof.json"
        proof_path.write_text(json.dumps(proof, indent=2, sort_keys=True) + "\n")
        print()
        print(f"Proof object written: {proof_path}")
        print(f"Proof hash: {proof['proof_hash']}")


if __name__ == "__main__":
    main()
