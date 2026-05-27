from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from sse_starlette.sse import EventSourceResponse
import asyncio
import json

from apps.api_gateway.deps import get_db
from apps.api_gateway.schemas.decision import (
    DecisionResponse,
    DecisionReplayResponse,
    DecisionFeedbackResponse,
    DecisionFeedbackRequest,
)
from apps.api_gateway.services.decision_service import DecisionService

router = APIRouter()


async def decision_generator():
    from apps.api_gateway.services.sse_broadcaster import decision_broadcaster
    q = decision_broadcaster.subscribe()
    try:
        while True:
            data = await q.get()
            yield {
                "event": "decision_evaluated",
                "data": json.dumps(data)
            }
    except asyncio.CancelledError:
        pass
    finally:
        decision_broadcaster.unsubscribe(q)


@router.get("/stream")
async def stream_decisions():
    """Stream live evaluated decisions via SSE."""
    return EventSourceResponse(decision_generator())



@router.post("/evaluate", response_model=DecisionResponse)
def evaluate_decision(payload: dict[str, Any], db: Session = Depends(get_db)):
    service = DecisionService(db)
    return service.evaluate_event(payload)


@router.get("/tickets/{ticket_id}", response_model=DecisionResponse)
def get_decision_for_ticket(ticket_id: str, db: Session = Depends(get_db)):
    service = DecisionService(db)
    decision = service.get_latest_decision(ticket_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


@router.post("/recompute/{ticket_id}", response_model=DecisionResponse)
def recompute_decision(ticket_id: str, db: Session = Depends(get_db)):
    service = DecisionService(db)
    return service.recompute_decision(ticket_id)


@router.get("/event/{event_id}", response_model=DecisionResponse)
def get_decision_for_event(event_id: str, db: Session = Depends(get_db)):
    service = DecisionService(db)
    decision = service.get_latest_decision_for_event(event_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found for event")
    return decision


@router.get("/{decision_id}", response_model=DecisionResponse)
def get_decision_by_id(decision_id: int, db: Session = Depends(get_db)):
    service = DecisionService(db)
    decision = service.get_decision_by_id(decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


@router.get("/{decision_id}/detail", response_model=DecisionResponse)
def get_decision_detail(decision_id: int, db: Session = Depends(get_db)):
    return get_decision_by_id(decision_id, db)


@router.post("/{decision_id}/replay", response_model=DecisionReplayResponse)
def replay_decision(decision_id: int, db: Session = Depends(get_db)):
    service = DecisionService(db)
    replay = service.replay_decision(decision_id)
    if not replay:
        raise HTTPException(status_code=404, detail="Replay not found")
    return replay


@router.post("/{decision_id}/approve", response_model=DecisionFeedbackResponse)
def approve_decision(
    decision_id: int, payload: DecisionFeedbackRequest | None = None, db: Session = Depends(get_db)
):
    service = DecisionService(db)
    note = payload.note if payload else ""
    return service.record_feedback(decision_id, "approve", note)


@router.post("/{decision_id}/reject", response_model=DecisionFeedbackResponse)
def reject_decision(
    decision_id: int, payload: DecisionFeedbackRequest | None = None, db: Session = Depends(get_db)
):
    service = DecisionService(db)
    note = payload.note if payload else ""
    return service.record_feedback(decision_id, "reject", note)


@router.post("/{decision_id}/override", response_model=DecisionFeedbackResponse)
def override_decision(
    decision_id: int, payload: DecisionFeedbackRequest, db: Session = Depends(get_db)
):
    service = DecisionService(db)
    note = payload.note
    return service.record_feedback(decision_id, "override", note)
