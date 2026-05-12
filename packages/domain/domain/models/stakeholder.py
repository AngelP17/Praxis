from typing import Optional
from pydantic import BaseModel, Field


class StakeholderModel(BaseModel):
    stakeholder_key: str = Field(..., max_length=120)
    display_name: str = Field(..., max_length=200)
    role: str = Field(..., max_length=100)
    department: Optional[str] = Field(default=None, max_length=100)
    is_economic_buyer: bool = Field(default=False)
    is_technical_buyer: bool = Field(default=False)
    is_end_user: bool = Field(default=False)
    urgency_score: float = Field(default=0.5, ge=0.0, le=1.0)
