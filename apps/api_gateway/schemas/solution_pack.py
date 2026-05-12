from typing import Any

from pydantic import BaseModel


class SolutionPackSummary(BaseModel):
    id: str
    name: str
    industry: str
    primary_pain: str
    demo_length_minutes: int


class SolutionPackDetail(BaseModel):
    id: str
    name: str
    industry: str
    buyer_persona: str
    technical_persona: str
    economic_buyer: str
    primary_pain: str
    systems: list[str]
    signals: list[str]
    business_metrics: list[str]
    target_outcome: str
    demo_length_minutes: int
    scenario: dict[str, Any] = {}


class SolutionPackValidateResponse(BaseModel):
    pack_id: str
    valid: bool
    errors: list[str] = []
    warnings: list[str] = []
    coverage: float = 0.0


class SolutionPackLaunchResponse(BaseModel):
    pack_id: str
    fieldlab_run_id: str
    status: str


class SolutionPackReadinessResponse(BaseModel):
    pack_id: str
    ready: bool
    missing_files: list[str] = []
    required_services: list[str] = []
