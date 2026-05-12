from typing import Any

from pydantic import BaseModel, Field


class SolutionPackModel(BaseModel):
    id: str = Field(..., max_length=120)
    name: str = Field(..., max_length=200)
    industry: str = Field(default="", max_length=100)
    buyer_persona: str = Field(default="", max_length=200)
    technical_persona: str = Field(default="", max_length=200)
    economic_buyer: str = Field(default="", max_length=200)
    primary_pain: str = Field(default="", max_length=500)
    systems: list[str] = Field(default_factory=list)
    signals: list[str] = Field(default_factory=list)
    business_metrics: list[str] = Field(default_factory=list)
    target_outcome: str = Field(default="", max_length=500)
    demo_length_minutes: int = Field(default=5, ge=1, le=60)
    scenario: dict[str, Any] = Field(default_factory=dict)
