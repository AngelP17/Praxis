from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, ConfigDict


class AssetRef(BaseModel):
    model_config = ConfigDict(extra="allow")

    asset_id: str | None = None
    site: str | None = None
    line: str | None = None


class OperationalEventIngest(BaseModel):
    model_config = ConfigDict(extra="allow")

    event_id: str | None = Field(None, max_length=50)
    source: str | None = Field(None, max_length=50)
    source_ref: str | None = Field(None, max_length=100)
    event_type: str | None = Field(None, max_length=100)
    asset: AssetRef | None = None
    asset_id: str | None = Field(None, max_length=100)
    site: str | None = Field(None, max_length=100)
    line: str | None = Field(None, max_length=100)
    severity: str | None = Field(None, max_length=20)
    occurred_at: datetime | str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)


class OperationalEventBatch(BaseModel):
    events: list[OperationalEventIngest]