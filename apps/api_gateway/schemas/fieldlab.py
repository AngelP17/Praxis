from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class FieldLabRunCreate(BaseModel):
    solution_pack_id: str
    customer_profile: dict[str, Any] = {}
    floci_endpoint: str = "http://localhost:4566"


class FieldLabRunResponse(BaseModel):
    run_id: str
    solution_pack_id: str
    customer_profile: dict[str, Any]
    status: str
    floci_endpoint: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    summary_json: Optional[dict[str, Any]] = None
    created_at: Optional[datetime] = None


class FieldLabEventIngest(BaseModel):
    events: list[dict[str, Any]]


class FieldLabActionCapture(BaseModel):
    action: str = "approve_remediation"
    status: str = "approved"
    actor: str = "operator"
    note: str = ""


class FieldLabRunList(BaseModel):
    runs: list[FieldLabRunResponse]


class FieldLabReplayResponse(BaseModel):
    run_id: str
    decisions: list[dict[str, Any]]
    events: list[dict[str, Any]]
    replayed_at: str


class ExecutiveReadoutResponse(BaseModel):
    run_id: str
    solution_pack_id: str
    incident_summary: dict[str, Any]
    evidence_trust: float
    estimated_annual_value: float
    expansion_opportunities: list[str]
    generated_at: str
