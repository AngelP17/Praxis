from fastapi import APIRouter, Depends
from apps.api_gateway.deps import get_db
from apps.api_gateway.services.fieldlab_service import FieldLabService
from apps.api_gateway.schemas.fieldlab import (
    FieldLabActionCapture,
    FieldLabRunCreate,
    FieldLabRunResponse,
    FieldLabEventIngest,
    FieldLabRunList,
    FieldLabReplayResponse,
    ExecutiveReadoutResponse,
)


router = APIRouter()


@router.post("/runs", response_model=FieldLabRunResponse, status_code=201)
def create_run(body: FieldLabRunCreate, db=Depends(get_db)):
    svc = FieldLabService(db)
    return svc.create_run(body.dict())


@router.get("/runs", response_model=FieldLabRunList)
def list_runs(db=Depends(get_db)):
    svc = FieldLabService(db)
    return {"runs": svc.list_runs()}


@router.get("/runs/{run_id}", response_model=FieldLabRunResponse)
def get_run(run_id: str, db=Depends(get_db)):
    svc = FieldLabService(db)
    return svc.get_run(run_id)


@router.post("/runs/{run_id}/events")
def ingest_events(run_id: str, body: FieldLabEventIngest, db=Depends(get_db)):
    svc = FieldLabService(db)
    return svc.ingest_events(run_id, body.events)


@router.get("/runs/{run_id}/events")
def get_run_events(run_id: str, db=Depends(get_db)):
    svc = FieldLabService(db)
    return svc.get_run_events(run_id)


@router.post("/runs/{run_id}/execute")
def execute_run(run_id: str, db=Depends(get_db)):
    svc = FieldLabService(db)
    return svc.execute_run(run_id)


@router.post("/runs/{run_id}/action")
def capture_action(run_id: str, body: FieldLabActionCapture, db=Depends(get_db)):
    svc = FieldLabService(db)
    return svc.capture_action(run_id, body.model_dump())


@router.get("/runs/{run_id}/replay", response_model=FieldLabReplayResponse)
def get_replay(run_id: str, db=Depends(get_db)):
    svc = FieldLabService(db)
    return svc.get_replay(run_id)


@router.get("/runs/{run_id}/executive-readout", response_model=ExecutiveReadoutResponse)
def get_executive_readout(run_id: str, db=Depends(get_db)):
    svc = FieldLabService(db)
    return svc.get_executive_readout(run_id)
