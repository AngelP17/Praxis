from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from infrastructure.db.base import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_key = Column(String(50), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(50), default="open", index=True)
    severity = Column(String(20), default="low")
    risk_level = Column(String(20), default="low")
    root_cause_hypothesis = Column(String(100))
    site_scope = Column(String(255))
    asset_scope = Column(String(255))
    business_impact_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    opened_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=True)
    created_by = Column(String(50), default="system")
    metadata_json = Column(JSON, nullable=True, default=dict)

    ticket_links = relationship(
        "IncidentTicketLink", back_populates="incident", cascade="all, delete-orphan"
    )
    operational_events = relationship(
        "IncidentEvent", back_populates="incident", cascade="all, delete-orphan"
    )
    evidence_artifacts = relationship(
        "EvidenceArtifact", back_populates="incident", cascade="all, delete-orphan"
    )
    decisions = relationship(
        "DecisionRecord", back_populates="incident", cascade="all, delete-orphan"
    )
