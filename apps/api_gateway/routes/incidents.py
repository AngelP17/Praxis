from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from apps.api_gateway.deps import get_db
from apps.api_gateway.schemas.incident import IncidentResponse, IncidentDetailResponse
from apps.api_gateway.services.incident_service import IncidentService

router = APIRouter()


@router.get("/", response_model=list[IncidentResponse], include_in_schema=False)
@router.get("", response_model=list[IncidentResponse])
def list_incidents(db: Session = Depends(get_db)):
    service = IncidentService(db)
    return service.list_incidents()


@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    service = IncidentService(db)
    incident = service.get_incident_detail(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.get("/{incident_id}/events")
def get_incident_events(incident_id: str, db: Session = Depends(get_db)):
    service = IncidentService(db)
    events = service.get_incident_events(incident_id)
    if events is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return events


@router.get("/{incident_id}/decisions")
def get_incident_decisions(incident_id: str, db: Session = Depends(get_db)):
    service = IncidentService(db)
    decisions = service.get_incident_decisions(incident_id)
    if decisions is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return decisions


@router.get("/{incident_id}/tickets")
def get_incident_tickets(incident_id: str, db: Session = Depends(get_db)):
    service = IncidentService(db)
    tickets = service.get_incident_tickets(incident_id)
    if tickets is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return tickets


@router.get("/{incident_id}/timeline")
def get_incident_timeline(incident_id: str, db: Session = Depends(get_db)):
    service = IncidentService(db)
    timeline = service.get_incident_timeline(incident_id)
    if timeline is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return timeline


@router.post("/{incident_id}/resolve")
def resolve_incident(
    incident_id: str, payload: dict[str, Any] | None = None, db: Session = Depends(get_db)
):
    service = IncidentService(db)
    summary = payload.get("summary", "") if payload else ""
    result = service.resolve_incident(incident_id, summary)
    if not result:
        raise HTTPException(status_code=404, detail="Incident not found")
    return result


@router.post("/{incident_id}/postmortem")
def generate_postmortem(incident_id: str, db: Session = Depends(get_db)):
    service = IncidentService(db)
    postmortem = service.generate_postmortem(incident_id)
    if not postmortem:
        raise HTTPException(status_code=404, detail="Incident not found")
    return postmortem
