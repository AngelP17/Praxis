from fastapi import APIRouter, Depends
from apps.api_gateway.deps import get_db
from apps.api_gateway.services.deployment_plan_service import DeploymentPlanService
from apps.api_gateway.schemas.deployment_plan import (
    DeploymentPlanCreate,
    DeploymentPlanResponse,
    DeploymentPlanRiskResponse,
    SecurityReviewResponse,
)

router = APIRouter()


@router.post("", response_model=DeploymentPlanResponse)
def create_deployment_plan(body: DeploymentPlanCreate, db=Depends(get_db)):
    svc = DeploymentPlanService(db)
    return svc.create_plan(body.dict())


@router.get("/{plan_id}", response_model=DeploymentPlanResponse)
def get_deployment_plan(plan_id: str, db=Depends(get_db)):
    svc = DeploymentPlanService(db)
    return svc.get_plan(plan_id)


@router.get("/{plan_id}/risks", response_model=DeploymentPlanRiskResponse)
def get_deployment_risks(plan_id: str, db=Depends(get_db)):
    svc = DeploymentPlanService(db)
    return svc.get_risks(plan_id)


@router.get("/{plan_id}/security-review", response_model=SecurityReviewResponse)
def get_security_review(plan_id: str, db=Depends(get_db)):
    svc = DeploymentPlanService(db)
    return svc.get_security_review(plan_id)
