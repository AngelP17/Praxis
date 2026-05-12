from typing import Any

from fastapi import APIRouter, Depends

from apps.api_gateway.deps import get_db
from apps.api_gateway.schemas.proof import (
    ProofCreateRequest,
    ProofResponse,
    ProofVerificationResponse,
)
from apps.api_gateway.services.proof_service import ProofService


router = APIRouter()


@router.post("", response_model=ProofResponse)
def create_proof(body: ProofCreateRequest, db=Depends(get_db)):
    svc = ProofService(db)
    return svc.build_proof(body.model_dump())


@router.get("/{pack_id}", response_model=ProofResponse)
def get_pack_proof(pack_id: str, db=Depends(get_db)):
    svc = ProofService(db)
    return svc.get_pack_proof(pack_id)


@router.post("/verify", response_model=ProofVerificationResponse)
def verify_proof(proof: dict[str, Any], db=Depends(get_db)):
    svc = ProofService(db)
    return svc.verify_proof(proof)
