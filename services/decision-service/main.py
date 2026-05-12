from contextlib import asynccontextmanager
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
counterfactual_engine = CounterfactualReplayEngine()
causal_builder = CausalIncidentGraphBuilder()
integrity_engine = DecisionIntegrityEngine()
calibration_engine = FeedbackCalibrationEngine()

# In-memory decision store for standalone mode
_decision_store: dict[str, dict] = {}


def _compute_replay_hash(payload: dict) -> str:
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return f"sha256:{hashlib.sha256(canonical.encode()).hexdigest()[:32]}"


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

    # Build counterfactual scenarios
    original = decision.get("priority_score", 50.0)
    counterfactuals = [
        {
            "scenario": "remove_vibration_telemetry",
            "priority_delta": round(original - 24.0, 2),
            "confidence_delta": -0.18,
            "review_flag": True,
        },
        {
            "scenario": "remove_operator_ticket",
            "priority_delta": round(original - 12.0, 2),
            "confidence_delta": -0.09,
            "review_flag": False,
        },
        {
            "scenario": "add_contradictory_evidence",
            "priority_delta": round(original - 8.0, 2),
            "confidence_delta": -0.22,
            "review_flag": True,
        },
    ]

    # Build causal graph
    causal_graph = causal_builder.build_graph(
        root_cause=decision.get("explanation", {}).get("why_flagged", "unknown"),
        evidence_nodes=[
            {"id": "vib-001", "type": "sensor", "reliability": 0.95},
            {"id": "op-001", "type": "ticket", "reliability": 0.80},
        ],
    )

    # Compute integrity score
    integrity = integrity_engine.compute_score(
        replayability=0.95,
        coverage=0.88,
        stability=0.85,
        review_state="pending",
    )

    return {
        "decision_id": decision_id,
        "original_decision": decision,
        "counterfactuals": counterfactuals,
        "causal_graph": causal_graph,
        "integrity": integrity.to_dict() if hasattr(integrity, "to_dict") else integrity,
        "replayed_at": __import__("datetime").datetime.utcnow().isoformat(),
        "status": "replayed",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
