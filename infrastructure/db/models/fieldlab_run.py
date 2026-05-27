from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON

from infrastructure.db.base import Base


class FieldLabRun(Base):
    __tablename__ = "fieldlab_runs"

    id = Column(Integer, primary_key=True)
    run_id = Column(String(80), unique=True, index=True, nullable=False)
    solution_pack_id = Column(String(120), index=True, nullable=False)
    customer_profile = Column(JSON, nullable=False, default=dict)
    status = Column(String(40), default="created")
    floci_endpoint = Column(String(255), default="http://localhost:4566")
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    summary_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
