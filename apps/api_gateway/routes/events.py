from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse
import asyncio
import json

from apps.api_gateway.deps import get_db
from apps.api_gateway.schemas.event import OperationalEventIngest, OperationalEventBatch
from apps.api_gateway.services.decision_service import DecisionService
from apps.api_gateway.services.event_service import EventService

router = APIRouter()


async def event_generator():
    from apps.api_gateway.services.sse_broadcaster import event_broadcaster
    q = event_broadcaster.subscribe()
    try:
        while True:
            data = await q.get()
            yield {
                "event": "event_ingested",
                "data": json.dumps(data)
            }
    except asyncio.CancelledError:
        pass
    finally:
        event_broadcaster.unsubscribe(q)


@router.get("/stream")
async def stream_events():
    """Stream live ingested events via SSE."""
    return EventSourceResponse(event_generator())



@router.post("/ingest", status_code=201)
def ingest_event(payload: OperationalEventIngest, db: Session = Depends(get_db)):
    service = EventService(db)
    return service.ingest_event(payload.model_dump(exclude_none=True))


@router.post("/batch")
def ingest_batch(payload: OperationalEventBatch, db: Session = Depends(get_db)):
    service = EventService(db)
    return {"events": [service.ingest_event(e.model_dump(exclude_none=True)) for e in payload.events]}


@router.get("/tickets/{ticket_id}")
def get_ticket_events(ticket_id: str, db: Session = Depends(get_db)):
    service = EventService(db)
    return service.get_ticket_event_stream(ticket_id)


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
