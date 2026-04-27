from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from infrastructure.db.base import Base


class OperationalEvent(Base):
    __tablename__ = "operational_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(50), unique=True, nullable=False, index=True)
    source = Column(String(50), nullable=False, index=True)
    source_ref = Column(String(100), nullable=True)
    event_type = Column(String(100), nullable=False, index=True)
    asset_id = Column(String(100), nullable=True, index=True)
    site = Column(String(100), nullable=True)
    line = Column(String(100), nullable=True)
    severity = Column(String(20), nullable=False, default="low")
    occurred_at = Column(DateTime, nullable=False, index=True)
    received_at = Column(DateTime, default=datetime.utcnow)
    payload = Column(JSON, nullable=False, default=dict)
    normalized_payload = Column(JSON, nullable=True)
    replay_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident_links = relationship(
        "IncidentEvent",
        back_populates="operational_event",
        cascade="all, delete-orphan",
    )
    decisions = relationship(
        "DecisionRecord", back_populates="event", cascade="all, delete-orphan"
    )
