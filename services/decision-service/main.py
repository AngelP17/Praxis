from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import os
import sys
import hashlib
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "packages", "astraea-core"))

from astraea.pipeline import AstraeaPipeline
from astraea.reasoning.provenance import ProvenanceEngine, ProvenanceRecord
from astraea.reasoning.counterfactual import CounterfactualReplayEngine
from astraea.reasoning.causal_replay import CausalIncidentGraphBuilder
from astraea.decision.integrity import DecisionIntegrityEngine
from astraea.decision.calibration import FeedbackCalibrationEngine


class EvaluateRequest(BaseModel):
    event: dict[str, Any]


class EvaluateResponse(BaseModel):
    decision_id: str
    event_id: str
    priority_score: float
    risk_level: str
    confidence_score: float
    recommendations: list[dict[str, Any]]
    explanation: dict[str, Any]
    replay_hash: str


pipeline = AstraeaPipeline()
provenance_engine = ProvenanceEngine()
calibration_engine = FeedbackCalibrationEngine()

# In-memory decision store for standalone mode
_decision_store: dict[str, dict] = {}


def _compute_replay_hash(payload: dict) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return f"sha256:{hashlib.sha256(canonical.encode()).hexdigest()[:32]}"


def _build_demo_incident_graph(decision_id: str):
    reference_time = datetime.now(UTC)
    builder = CausalIncidentGraphBuilder(decision_id, reference_time=reference_time)
    signal_ts = reference_time - timedelta(minutes=3)
    ticket_ts = reference_time - timedelta(minutes=5)
    runbook_ts = reference_time - timedelta(days=2)
    asset_ts = reference_time - timedelta(hours=1)

    builder.add_signal(
        node_id="vib-001",
        source_id="press-line-3.plc",
        source_reliability=0.95,
        timestamp=signal_ts,
        confidence=0.91,
        severity="high",
        payload={"metric": "vibration", "threshold": 8.0, "value": 12.4},
    )
    builder.add_ticket(
        node_id="ticket-001",
        source_id="operator-42",
        source_reliability=0.8,
        timestamp=ticket_ts,
        confidence=0.82,
        severity="high",
        payload={"summary": "Shipping labels not printing"},
    )
    builder.add_runbook(
        node_id="runbook-001",
        source_id="bearing-replacement-runbook",
        timestamp=runbook_ts,
        payload={"step": "Route to mechanical team"},
    )
    builder.add_asset(
        node_id="asset-001",
        source_id="press-line-3",
        timestamp=asset_ts,
        payload={"line": "line-3", "machine": "press-3"},
    )
    builder.link_corroborates("ticket-001", "vib-001")
    builder.link_causal("vib-001", "asset-001")
    builder.link_causal("asset-001", "runbook-001")
    builder.set_root_cause("vib-001")
    return builder


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Praxis Decision Service",
    description="Deterministic decision engine wrapper around Astraea",
    version="1.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "decision-service", "version": "1.2.0"}


@app.post("/api/decisions/evaluate")
async def evaluate(request: EvaluateRequest):
    event_data = request.event
    result = pipeline.process(
        __import__("astraea.shared.schemas", fromlist=["Event"]).Event(**event_data)
    )

    decision_id = result.case_id
    decision = {
        "decision_id": decision_id,
        "event_id": result.event_id,
        "priority_score": result.decision.get("priority_score", 0.0),
        "risk_level": result.decision.get("risk_level", "low"),
        "confidence_score": result.decision.get("confidence_score", 0.0),
        "recommendations": result.decision.get("recommendations", []),
        "explanation": result.decision.get("explanation", {}),
        "replay_hash": result.audit.get("replay_hash", ""),
        "result": result.to_dict(),
    }
    _decision_store[decision_id] = decision
    return decision


@app.get("/api/decisions/{decision_id}")
async def get_decision(decision_id: str):
    decision = _decision_store.get(decision_id)
    if not decision:
        # Generate a synthetic decision for the standalone demo
        decision = {
            "decision_id": decision_id,
            "event_id": f"evt_{decision_id.lower().replace('-', '_')}",
            "priority_score": 88.5,
            "risk_level": "high",
            "confidence_score": 0.82,
            "recommendations": [
                {
                    "rank": 1,
                    "action_type": "runbook",
                    "action_label": "Route to mechanical team and schedule bearing replacement",
                    "rationale": "Bearing degradation detected with high confidence from vibration telemetry",
                    "risk_level": "high",
                    "confidence": 0.82,
                }
            ],
            "explanation": {
                "why_flagged": "Vibration telemetry indicates bearing degradation",
                "top_factors": ["severity", "urgency", "business_impact"],
                "feature_weights": {
                    "severity": 0.9,
                    "urgency": 0.85,
                    "business_impact": 0.8,
                },
            },
            "replay_hash": _compute_replay_hash({"decision_id": decision_id}),
            "status": "generated",
            "integrity_score": {
                "replayability": 0.95,
                "coverage": 0.88,
                "stability": 0.85,
                "review_state": "pending",
                "composite": 0.88,
            },
            "provenance": [
                ProvenanceRecord(
                    artifact_id="vib-telemetry-001",
                    artifact_type="sensor",
                    generated_by="press-line-3.plc",
                    reliability_score=0.95,
                    freshness_seconds=120.0,
                ).to_dict(),
                ProvenanceRecord(
                    artifact_id="operator-ticket-001",
                    artifact_type="ticket",
                    generated_by="operator-42",
                    reliability_score=0.80,
                    freshness_seconds=300.0,
                ).to_dict(),
            ],
        }
        _decision_store[decision_id] = decision
    return decision


@app.post("/api/decisions/{decision_id}/replay")
async def replay_decision(decision_id: str):
    decision = await get_decision(decision_id)
    causal_builder = _build_demo_incident_graph(decision_id)
    incident_graph = causal_builder.build()
    counterfactuals = CounterfactualReplayEngine(incident_graph).run().to_dict()
    causal_graph = causal_builder.replay().to_dict()
    integrity = DecisionIntegrityEngine(incident_graph).compute(decision_id).to_dict()

    return {
        "decision_id": decision_id,
        "original_decision": decision,
        "counterfactuals": counterfactuals,
        "causal_graph": causal_graph,
        "integrity": integrity,
        "replayed_at": datetime.now(UTC).isoformat(),
        "status": "replayed",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
