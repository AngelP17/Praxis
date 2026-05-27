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
    ticket_id: str | None = None
    event_id: str | None = None
    priority_score: float
    severity_score: float | None = None
    urgency_score: float | None = None
    business_impact_score: float | None = None
    sla_risk_score: float | None = None
    recurrence_score: float | None = None
    dependency_criticality_score: float | None = None
    actionability_score: float | None = None
    uncertainty_penalty: float | None = None
    root_cause_hypothesis: str
    confidence_score: float
    decision_ts: datetime
    recommendations: list[RecommendationResponse] = Field(default_factory=list)
    explanation: DecisionExplanationResponse | None = None
    replay_hash: str | None = None

    model_config = {"from_attributes": True}


class DecisionReplayResponse(BaseModel):
    decision: DecisionResponse
    original_event: dict
    replayed_decision: dict
    stored_replay_hash: str
    replayed_hash: str
    determinism: bool
    deterministic: bool
    feedback: list[dict]
    replayed_at: datetime


class DecisionFeedbackResponse(BaseModel):
    decision_id: int
    feedback_type: str
    status: str


class DecisionFeedbackRequest(BaseModel):
    note: str = Field(default="", description="Operator notes/feedback description")
