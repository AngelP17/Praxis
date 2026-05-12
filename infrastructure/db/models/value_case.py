from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class ValueCase(Base):
    __tablename__ = "value_cases"

    id = Column(Integer, primary_key=True)
    value_case_id = Column(String(120), unique=True, index=True, nullable=False)
    solution_pack_id = Column(String(120), index=True, nullable=False)
    customer_context_json = Column(JSON, nullable=False, default=dict)
    assumptions_json = Column(JSON, nullable=False, default=dict)
    formulas_json = Column(JSON, nullable=False, default=dict)
    estimated_annual_value = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    evidence_refs_json = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
