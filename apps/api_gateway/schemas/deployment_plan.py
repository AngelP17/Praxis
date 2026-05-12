from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class DeploymentPlanCreate(BaseModel):
    solution_pack_id: str
    value_case_id: Optional[str] = None
    environment: dict[str, Any] = {}
    timeline_weeks: int = 8


class DeploymentPlanResponse(BaseModel):
    plan_id: str
    solution_pack_id: str
    value_case_id: Optional[str] = None
    phases: list[dict[str, Any]]
    timeline_weeks: int
    created_at: Optional[datetime] = None


class DeploymentPlanRiskResponse(BaseModel):
    plan_id: str
    risks: list[dict[str, Any]]
    overall_risk_level: str


class SecurityReviewResponse(BaseModel):
    plan_id: str
    security_posture: str
    compliance_checks: list[dict[str, Any]]
    vulnerabilities: list[dict[str, Any]]
    recommendations: list[str]
