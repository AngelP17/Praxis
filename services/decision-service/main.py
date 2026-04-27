from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "packages", "astraea-core"))

from astraea.pipeline import AstraeaPipeline


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


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Aether Sentinel Decision Service",
    description="Deterministic decision engine wrapper around Astraea",
    version="1.0.0",
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
    return {"status": "healthy", "service": "decision-service"}


@app.post("/api/decisions/evaluate")
async def evaluate(request: EvaluateRequest):
    event_data = request.event
    result = pipeline.process(
        __import__("astraea.shared.schemas", fromlist=["Event"]).Event(**event_data)
    )
    return {
        "decision_id": result.case_id,
        "event_id": result.event_id,
        "priority_score": result.decision.get("priority_score", 0.0),
        "risk_level": result.decision.get("risk_level", "low"),
        "confidence_score": result.decision.get("confidence_score", 0.0),
        "recommendations": result.decision.get("recommendations", []),
        "explanation": result.decision.get("explanation", {}),
        "replay_hash": result.audit.get("replay_hash", ""),
        "result": result.to_dict(),
    }


@app.get("/api/decisions/{decision_id}")
async def get_decision(decision_id: str):
    return {"decision_id": decision_id, "status": "not_implemented_in_standalone"}


@app.post("/api/decisions/{decision_id}/replay")
async def replay_decision(decision_id: str):
    return {"decision_id": decision_id, "status": "not_implemented_in_standalone"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=False)
