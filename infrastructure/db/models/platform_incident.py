from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, Text

from infrastructure.db.base import Base


class PlatformIncident(Base):
    __tablename__ = "platform_incidents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    platform_incident_id = Column(String(50), unique=True, nullable=False, index=True)
    source_ref = Column(String(100), nullable=True)
    namespace = Column(String(100), nullable=True)
    service = Column(String(100), nullable=True)
    runbook = Column(String(100), nullable=True)
    slo_met = Column(Boolean, default=True)
    duration_seconds = Column(Integer, nullable=True)
    started_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    raw_payload = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
