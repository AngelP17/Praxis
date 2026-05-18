from datetime import datetime, timezone
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field


class CloudEvent(BaseModel):
    specversion: Literal["1.0"] = "1.0"
    id: str = Field(default_factory=lambda: f"evt_{uuid4().hex[:12]}")
    source: str
    type: str
    subject: str | None = None
    time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    datacontenttype: str = "application/json"
    data: dict[str, Any]


class PrinterOfflineData(BaseModel):
    asset_id: str
    hostname: str
    site: str
    severity: Literal["low", "medium", "high", "critical"] = "high"
    signal: Literal["offline"] = "offline"
    detected_by: str = "printer_adapter"
    confidence: float = 0.9
    raw: dict[str, Any] = Field(default_factory=dict)


def printer_offline_event(
    asset_id: str = "printer.weifps01",
    hostname: str = "WEIFPS01",
    site: str = "TX",
) -> CloudEvent:
    return CloudEvent(
        source="praxis.adapters.printer",
        type="com.praxis.asset.printer.offline",
        subject=f"asset:{asset_id}",
        data=PrinterOfflineData(
            asset_id=asset_id,
            hostname=hostname,
            site=site,
            raw={"ping": "failed", "last_seen_minutes": 14},
        ).model_dump(),
    )
