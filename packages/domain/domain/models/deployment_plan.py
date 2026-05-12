from typing import Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class DeploymentPlanModel(BaseModel):
    plan_id: str = Field(..., max_length=120)
    solution_pack_id: str = Field(..., max_length=120)
    value_case_id: Optional[str] = Field(default=None, max_length=120)
    phases: list[dict[str, Any]] = Field(default_factory=list)
    timeline_weeks: int = Field(default=8, ge=1, le=52)
    environment: dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
