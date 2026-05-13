"""SSE streaming endpoint for live proof generation visualization.

Provides:
    GET /api/proofs/{pack_id}/stream
    Emits server-sent events for each stage of proof generation:
    s3.write -> sqs.send -> dynamo.put -> events.emit -> proof.hash -> proof.sign
"""

from __future__ import annotations

import asyncio
import json
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/api/proofs", tags=["proofs-sse"])

STAGES = [
    "s3.write",
    "sqs.send",
    "dynamo.put",
    "events.emit",
    "proof.hash",
    "proof.sign",
]

STAGE_LABELS: dict[str, str] = {
    "s3.write": "Archiving raw events to S3",
    "sqs.send": "Queuing incident events via SQS",
    "dynamo.put": "Writing state to DynamoDB",
    "events.emit": "Emitting workflow events via EventBridge",
    "proof.hash": "Computing deterministic proof hash",
    "proof.sign": "Signing proof with Ed25519",
}


async def generate_proof_events(pack_id: str):
    """Yield SSE events simulating the proof generation pipeline."""
    import time
    import hashlib

    run_id = f"fieldlab_run_sse_{pack_id}"

    for i, stage in enumerate(STAGES):
        await asyncio.sleep(0.8)
        stage_hash = hashlib.sha256(f"{run_id}:{stage}:{time.time()}".encode()).hexdigest()[:16]
        yield {
            "event": "stage",
            "data": json.dumps({
                "stage": stage,
                "label": STAGE_LABELS.get(stage, stage),
                "index": i,
                "total": len(STAGES),
                "progress": (i + 1) / len(STAGES),
                "run_id": run_id,
                "stage_hash": stage_hash,
                "timestamp": int(time.time() * 1000),
            }),
        }

    # Emit completion
    proof_hash = hashlib.sha256(f"proof:{run_id}:{pack_id}".encode()).hexdigest()
    yield {
        "event": "completed",
        "data": json.dumps({
            "run_id": run_id,
            "solution_pack": pack_id,
            "proof_hash": f"sha256:{proof_hash}",
            "conformance": "L1",
            "events_processed": 12,
            "ontology_objects": 9,
            "priority_score": 0.84,
            "evidence_trust": 0.83,
            "estimated_value": 38400,
            "download_url": f"/api/proofs/{pack_id}",
            "verify_command": f"curl -s http://localhost:8000/api/proofs/{pack_id} | uvx praxis-verify -",
        }),
    }


@router.get("/{pack_id}/stream")
async def stream_proof(pack_id: str):
    """Stream proof generation events via SSE."""
    return EventSourceResponse(generate_proof_events(pack_id))
