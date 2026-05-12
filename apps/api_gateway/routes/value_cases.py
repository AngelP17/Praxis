from fastapi import APIRouter, Depends
from apps.api_gateway.deps import get_db
from apps.api_gateway.services.value_case_service import ValueCaseService
from apps.api_gateway.schemas.value_case import (
    ValueCaseCreate,
    ValueCaseResponse,
    ValueCaseRecalculateResponse,
    ExecutiveSummaryResponse,
)

router = APIRouter()


@router.post("", response_model=ValueCaseResponse)
def create_value_case(body: ValueCaseCreate, db=Depends(get_db)):
    svc = ValueCaseService(db)
    return svc.create_value_case(body.dict())


@router.get("/{value_case_id}", response_model=ValueCaseResponse)
def get_value_case(value_case_id: str, db=Depends(get_db)):
    svc = ValueCaseService(db)
    return svc.get_value_case(value_case_id)


@router.post("/{value_case_id}/recalculate", response_model=ValueCaseRecalculateResponse)
def recalculate_value_case(value_case_id: str, db=Depends(get_db)):
    svc = ValueCaseService(db)
    return svc.recalculate(value_case_id)


@router.get("/{value_case_id}/executive-summary", response_model=ExecutiveSummaryResponse)
def get_executive_summary(value_case_id: str, db=Depends(get_db)):
    svc = ValueCaseService(db)
    return svc.get_executive_summary(value_case_id)
