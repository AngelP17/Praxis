from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from apps.api_gateway.deps import get_db
from apps.api_gateway.schemas.decision import DecisionResponse
from apps.api_gateway.services.decision_service import DecisionService

router = APIRouter()


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


@router.post("/evaluate")
def evaluate_decision(payload: dict[str, Any], db: Session = Depends(get_db)):
    service = DecisionService(db)
    return service.evaluate_event(payload)


@router.get("/{decision_id}")
def get_decision_by_id(decision_id: int, db: Session = Depends(get_db)):
    service = DecisionService(db)
    decision = service.get_decision_by_id(decision_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    return decision


@router.get("/{decision_id}/detail")
def get_decision_detail(decision_id: int, db: Session = Depends(get_db)):
    return get_decision_by_id(decision_id, db)


@router.get("/event/{event_id}")
def get_decision_for_event(event_id: str, db: Session = Depends(get_db)):
    service = DecisionService(db)
    decision = service.get_latest_decision_for_event(event_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found for event")
    return decision


@router.post("/{decision_id}/replay")
def replay_decision(decision_id: int, db: Session = Depends(get_db)):
    service = DecisionService(db)
    replay = service.replay_decision(decision_id)
    if not replay:
        raise HTTPException(status_code=404, detail="Replay not found")
    return replay


@router.post("/{decision_id}/approve")
def approve_decision(
    decision_id: int, payload: dict[str, Any] | None = None, db: Session = Depends(get_db)
):
    service = DecisionService(db)
    note = payload.get("note", "") if payload else ""
    return service.record_feedback(decision_id, "approve", note)


@router.post("/{decision_id}/reject")
def reject_decision(
    decision_id: int, payload: dict[str, Any] | None = None, db: Session = Depends(get_db)
):
    service = DecisionService(db)
    note = payload.get("note", "") if payload else ""
    return service.record_feedback(decision_id, "reject", note)


@router.post("/{decision_id}/override")
def override_decision(decision_id: int, payload: dict[str, Any], db: Session = Depends(get_db)):
    service = DecisionService(db)
    note = payload.get("note", "")
    return service.record_feedback(decision_id, "override", note)
