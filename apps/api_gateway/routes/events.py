from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from apps.api_gateway.deps import get_db
from apps.api_gateway.services.decision_service import DecisionService
from apps.api_gateway.services.event_service import EventService

router = APIRouter()


@router.get("/tickets/{ticket_id}")
def get_ticket_events(ticket_id: str, db: Session = Depends(get_db)):
    service = EventService(db)
    return service.get_ticket_event_stream(ticket_id)


@router.post("/ingest")
def ingest_event(payload: dict[str, Any], db: Session = Depends(get_db)):
    service = EventService(db)
    return service.ingest_event(payload)


@router.post("/batch")
def ingest_batch(payloads: list[dict[str, Any]], db: Session = Depends(get_db)):
    service = EventService(db)
    return {"events": [service.ingest_event(p) for p in payloads]}


@router.get("")
def list_events(source: str | None = None, db: Session = Depends(get_db)):
    service = EventService(db)
    return service.list_events(source)


@router.get("/{event_id}")
def get_event(event_id: str, db: Session = Depends(get_db)):
    service = EventService(db)
    event = service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/{event_id}/detail")
def get_event_detail(event_id: str, db: Session = Depends(get_db)):
    service = EventService(db)
    event = service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/{event_id}/decision")
def get_event_decision(event_id: str, db: Session = Depends(get_db)):
    service = DecisionService(db)
    decision = service.get_latest_decision_for_event(event_id)
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found for event")
    return decision
