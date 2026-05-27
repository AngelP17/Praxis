from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON

from infrastructure.db.base import Base


class OperationalObject(Base):
    __tablename__ = "operational_objects"

    id = Column(Integer, primary_key=True)
    object_key = Column(String(120), unique=True, index=True, nullable=False)
    object_type = Column(String(80), index=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    properties_json = Column(JSON, nullable=False, default=dict)
    source_refs_json = Column(JSON, nullable=False, default=list)
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
