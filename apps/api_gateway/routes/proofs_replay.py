"""Deterministic replay endpoint.

Provides:
    POST /api/proofs/{pack_id}/replay
    Re-runs the proof pipeline with the same inputs and compares hash_a == hash_b.
"""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api/proofs", tags=["proofs-replay"])


@router.post("/{pack_id}/replay")
async def replay_determinism_check(pack_id: str):
    """Re-run proof generation and compare hashes for determinism verification."""
    import json
    from pathlib import Path

    ROOT = Path(__file__).parent.parent.parent.parent.parent
    events_path = ROOT / "solution-packs" / pack_id / "sample-events.jsonl"

    if not events_path.is_file():
        return {"error": f"No sample events for pack {pack_id}", "equal": False}

    events = [json.loads(line) for line in events_path.read_text().strip().splitlines() if line.strip()]

    try:
        from astraea.praxis import PraxisProofBuilder, ProofInputs

        builder = PraxisProofBuilder()
        inputs = ProofInputs(
            solution_pack=pack_id,
            events=events,
            run_id=f"replay_req_{pack_id}",
        )

        proof_a = builder.build(inputs)
        proof_b = builder.build(inputs)

        return {
            "equal": proof_a["proof_hash"] == proof_b["proof_hash"],
            "hash_a": proof_a["proof_hash"],
            "hash_b": proof_b["proof_hash"],
            "pack_id": pack_id,
            "events": len(events),
        }
    except Exception as e:
        return {"error": str(e), "equal": False}
