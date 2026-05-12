from typing import Optional

from pydantic import BaseModel, Field


class ActionTypeModel(BaseModel):
    action_type: str = Field(..., max_length=100)
    action_key: str = Field(..., max_length=120)
    mode: str = Field(default="HUMAN_APPROVAL")
    requires_approval: bool = Field(default=True)
    risk: str = Field(default="medium")
    audit_required: bool = Field(default=True)
    target_system: Optional[str] = None
    rollback_strategy: Optional[str] = None
