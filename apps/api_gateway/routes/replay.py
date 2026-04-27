from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api_gateway.deps import get_db
from apps.api_gateway.services.replay_service import ReplayService

router = APIRouter()


@router.get("/tickets/{ticket_id}")
def get_replay(ticket_id: str, db: Session = Depends(get_db)):
    replay = ReplayService(db).get_replay(ticket_id)
    if replay is None:
        raise HTTPException(status_code=404, detail="Replay not found")
    return replay


@router.get("/incidents/{incident_id}")
def replay_incident(incident_id: str, db: Session = Depends(get_db)):
    service = ReplayService(db)
    replay = service.replay_incident(incident_id)
    if not replay:
        raise HTTPException(status_code=404, detail="Replay not found")
    return replay


@router.get("/decisions/{decision_id}")
def replay_decision(decision_id: int, db: Session = Depends(get_db)):
    service = ReplayService(db)
    replay = service.replay_decision(decision_id)
    if not replay:
        raise HTTPException(status_code=404, detail="Replay not found")
    return replay
