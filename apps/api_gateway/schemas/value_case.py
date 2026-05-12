from typing import Any
from pydantic import BaseModel


class ValueCaseCreate(BaseModel):
    solution_pack_id: str
    customer_context_json: dict[str, Any] = {}
    assumptions_json: dict[str, Any] = {}
    formulas_json: dict[str, Any] = {}


class ValueCaseResponse(BaseModel):
    value_case_id: str
    solution_pack_id: str
    customer_context_json: dict[str, Any]
    assumptions_json: dict[str, Any]
    formulas_json: dict[str, Any]
    estimated_annual_value: float
    confidence: float
    evidence_refs_json: list[str]


class ValueCaseRecalculateResponse(BaseModel):
    value_case_id: str
    estimated_annual_value: float
    confidence: float
    updated_at: str


class ExecutiveSummaryResponse(BaseModel):
    value_case_id: str
    solution_pack_id: str
    headline: str
    estimated_annual_value: float
    key_metrics: dict[str, Any]
    recommendations: list[str]
    expansion_opportunities: list[str]
