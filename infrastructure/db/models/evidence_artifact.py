from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from infrastructure.db.base import Base


class EvidenceArtifact(Base):
    __tablename__ = "evidence_artifacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(
        Integer,
        ForeignKey("incidents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    artifact_type = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    path = Column(Text, nullable=False)
    checksum = Column(String(64), nullable=True)
    metadata_json = Column(JSON, nullable=True, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="evidence_artifacts")
