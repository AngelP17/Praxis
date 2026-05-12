from typing import Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class OperationalObjectModel(BaseModel):
    object_key: str = Field(..., max_length=200)
    object_type: str = Field(..., max_length=100)
    display_name: str = Field(..., max_length=300)
    properties_json: dict[str, Any] = Field(default_factory=dict)
    source_refs_json: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    created_at: Optional[datetime] = None
