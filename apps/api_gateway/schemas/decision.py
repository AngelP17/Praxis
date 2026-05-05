from datetime import datetime
from pydantic import BaseModel, Field


class RecommendationResponse(BaseModel):
    id: int | None = None
    rank: int
    action_type: str
    action_label: str
    rationale: str
    risk_level: str
    expected_benefit: str | None = None
    confidence: float
    recommended_runbook_id: str | None = None
    status: str | None = None

    model_config = {"from_attributes": True}


class DecisionExplanationResponse(BaseModel):
    integrity_score: dict | None = None
    provenance_graph: dict | None = None
    counterfactuals: dict | None = None
    calibration_trace: list[dict] = Field(default_factory=list)
    top_causal_factors: list[dict] = Field(default_factory=list)
    missing_evidence: list[str] = Field(default_factory=list)


class DecisionResponse(BaseModel):
    id: int
    ticket_id: str
    priority_score: float
    severity_score: float
    urgency_score: float
    business_impact_score: float
    sla_risk_score: float
    recurrence_score: float
    dependency_criticality_score: float
    actionability_score: float
    uncertainty_penalty: float
    root_cause_hypothesis: str
    confidence_score: float
    decision_ts: datetime
    recommendations: list[RecommendationResponse] = Field(default_factory=list)
    explanation: DecisionExplanationResponse | None = None
    replay_hash: str | None = None

    model_config = {"from_attributes": True}
