from fastapi import APIRouter, Depends
from apps.api_gateway.deps import get_db
from apps.api_gateway.services.solution_pack_service import SolutionPackService
from apps.api_gateway.services.cache import cache_response
from apps.api_gateway.schemas.solution_pack import (
    SolutionPackSummary,
    SolutionPackDetail,
    SolutionPackValidateResponse,
    SolutionPackLaunchResponse,
    SolutionPackReadinessResponse,
)

router = APIRouter()


@router.get("", response_model=list[SolutionPackSummary])
@cache_response(ttl_seconds=300)
def list_solution_packs(db=Depends(get_db)):
    svc = SolutionPackService(db)
    return svc.list_packs()


@router.get("/{pack_id}", response_model=SolutionPackDetail)
@cache_response(ttl_seconds=300)
def get_solution_pack(pack_id: str, db=Depends(get_db)):
    svc = SolutionPackService(db)
    return svc.get_pack(pack_id)


@router.post("/{pack_id}/validate", response_model=SolutionPackValidateResponse)
def validate_pack(pack_id: str, db=Depends(get_db)):
    svc = SolutionPackService(db)
    return svc.validate_pack(pack_id)


@router.post("/{pack_id}/launch", response_model=SolutionPackLaunchResponse)
def launch_pack(pack_id: str, db=Depends(get_db)):
    svc = SolutionPackService(db)
    return svc.launch_pack(pack_id)


@router.get("/{pack_id}/readiness", response_model=SolutionPackReadinessResponse)
def get_pack_readiness(pack_id: str, db=Depends(get_db)):
    svc = SolutionPackService(db)
    return svc.get_readiness(pack_id)
