#!/usr/bin/env python3
"""Run the Praxis FieldLab flagship demo with real Floci runtime."""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "packages" / "astraea-core"))

from pipelines.fieldlab import (
    FlociClient,
    FlociResources,
    FlociEventSink,
    FlociStateStore,
    FlociAuditArchive,
    FlociWorkflowBus,
)
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

    # Initialize Floci clients
    floci = FlociClient(endpoint_url=args.floci_endpoint)
    resources = FlociResources(client=floci)
    sink = FlociEventSink(client=floci)
    store = FlociStateStore(client=floci)
    archive = FlociAuditArchive(client=floci)
    bus = FlociWorkflowBus(client=floci)

    # Health check
    health = floci.healthcheck()
    if health["status"] != "ok":
        print(f"WARNING: Floci health check failed: {health}")
        print("Falling back to simulated path (Floci not running).")
        print()
        use_floci = False
    else:
        print(f"Floci health: {health['status']} ({health['endpoint']})")
        use_floci = True
        print()

    print("1. Select Solution Pack")
    print(f"   Pack: {args.solution_pack}")
    print()

    print("2. Load Customer Context")
    context_path = pack_dir / "customer-context.md"
    context = ""
    if context_path.is_file():
        context = context_path.read_text()
        print(f"   Context loaded from {context_path}")
    print()

    proof = PraxisProofBuilder().build(
        ProofInputs(
            solution_pack=args.solution_pack,
            events=events,
            customer_context=context,
            run_id=f"fieldlab_run_{args.solution_pack}",
        )
    )
    decision = proof["decision"]
    action = proof["action"]
    value_case = proof["value_case"]
    replay = proof["replay"]
    expansions = proof.get("expansion", [])

    print("3. Compile Operational Ontology")
    ontology_path = pack_dir / "ontology.yaml"
    if ontology_path.is_file():
        print(f"   Ontology loaded from {ontology_path}")
    print()

    print("4. Start FieldLab")
    print(f"   Endpoint: {args.floci_endpoint}")
    run_id = f"fieldlab_run_{args.solution_pack}"
    if use_floci:
        provisioned = resources.provision_all()
        created = sum(1 for r in provisioned if r["status"] == "created")
        exists = sum(1 for r in provisioned if r["status"] == "exists")
        print(f"   Resources: {created} created, {exists} already exist")
        store.write_run_state(run_id, args.solution_pack, "started", {"event_count": len(events)})
        bus.run_started(run_id, args.solution_pack)
    print()

    print("5. Stream Events through Floci")
    if use_floci:
        result = sink.ingest_solution_pack_events(run_id, args.solution_pack, events)
        print(f"   SQS: {len(result['sqs'])} events queued")
        print(f"   S3:  {result['s3']['key']} archived")
        print(f"   EventBridge: {result['workflow']['status']}")
    else:
        for i, event in enumerate(events, 1):
            print(
                f"   [{i}/{len(events)}] {event.get('event_type', 'unknown')}: {event.get('description', '')[:80]}"
            )
    print()

    print("6. Generate Decisions")
    print(f"   Priority score: {decision['priority_score']:.4f}")
    print(f"   Evidence trust: {proof['evidence']['evidence_trust']:.4f}")
    print(f"   Root cause: {decision['root_cause_hypothesis'].replace('_', ' ')}")
    if use_floci:
        bus.decision_generated(run_id, "dec_001", decision["priority_score"])
    print()

    print("7. Review Recommendations")
    print(f"   Action: {action['recommended_action'].replace('_', ' ')}")
    print(f"   Human review: {'Required' if decision['requires_human_review'] else 'Not required'}")
    for question in decision.get("next_best_questions", [])[:2]:
        print(f"   VOI: {question['question']}")
    print()

    print("8. Capture Human Action")
    print(f"   Mode: {action['mode']}")
    print("   Action logged with audit hash")
    if use_floci:
        bus.action_captured(run_id, action["recommended_action"], action["mode"], action["actor"])
    print()

    print("9. Produce Replay Artifact")
    print(f"   Replay hash: {replay['replay_hash']}")
    print(f"   Hash verified: {replay['deterministic']}")
    print()

    print("10. Generate Value Case")
    print(f"    Estimated annual value: ${value_case['estimated_annual_value']:,.2f}")
    print(f"    Confidence: {value_case['confidence']:.4f}")
    if use_floci:
        bus.value_case_ready(run_id, args.solution_pack, value_case["estimated_annual_value"])
    print()

    print("11. Generate Executive Readout")
    readout_path = pack_dir / "expected-output" / "executive-readout.md"
    if readout_path.is_file():
        print(f"    Readout available at: {readout_path}")
    print()

    print("12. Show Expansion Map")
    print("    Adjacent use cases:")
    for uc in expansions:
        print(f"      - {uc['name']} ({uc['expansion_score']:.4f})")
    print()

    print("=== Demo Complete ===")

    if args.emit_proof:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        proof_path = output_dir / "praxis_proof.json"
        proof_path.write_text(json.dumps(proof, indent=2, sort_keys=True) + "\n")
        print()
        print(f"Proof object written: {proof_path}")
        print(f"Proof hash: {proof['proof_hash']}")

        if use_floci:
            archive.store_proof(run_id, proof)
            bus.run_completed(run_id, args.solution_pack, proof["proof_hash"])
            store.update_run_status(run_id, "proof_emitted", {"proof_hash": proof["proof_hash"]})
            print(f"Proof archived to S3: praxis-audit-artifacts/runs/{run_id}/praxis_proof.json")


if __name__ == "__main__":
    main()
