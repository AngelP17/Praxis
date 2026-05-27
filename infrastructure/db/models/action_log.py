from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey

from infrastructure.db.base import Base


class ActionLog(Base):
    __tablename__ = "action_logs"

    id = Column(Integer, primary_key=True)
    action_key = Column(String(120), unique=True, index=True, nullable=False)
    action_type = Column(String(80), index=True, nullable=False)
    actor = Column(String(120), nullable=False)
    target_object_key = Column(String(120), nullable=True)
    decision_id = Column(Integer, ForeignKey("decision_records.id"), nullable=True)
    mode = Column(String(40), default="HUMAN_APPROVAL")
    payload_json = Column(JSON, nullable=False, default=dict)
    result_json = Column(JSON, nullable=True)
    audit_hash = Column(String(96), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
