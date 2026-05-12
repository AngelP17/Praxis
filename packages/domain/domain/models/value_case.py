from typing import Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ValueCaseModel(BaseModel):
    value_case_id: str = Field(..., max_length=120)
    solution_pack_id: str = Field(..., max_length=120)
    customer_context_json: dict[str, Any] = Field(default_factory=dict)
    assumptions_json: dict[str, Any] = Field(default_factory=dict)
    formulas_json: dict[str, Any] = Field(default_factory=dict)
    estimated_annual_value: float = Field(default=0.0, ge=0.0)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    evidence_refs_json: list[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
