from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from infrastructure.db.base import Base


class IncidentEvent(Base):
    __tablename__ = "incident_events"

    incident_id = Column(
        Integer, ForeignKey("incidents.id", ondelete="CASCADE"), primary_key=True
    )
    event_id = Column(
        Integer,
        ForeignKey("operational_events.id", ondelete="CASCADE"),
        primary_key=True,
    )
    relationship_type = Column(String(30), nullable=False, default="related")
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="operational_events")
    operational_event = relationship(
        "OperationalEvent", back_populates="incident_links"
    )
