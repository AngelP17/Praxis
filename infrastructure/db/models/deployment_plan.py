from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON

from infrastructure.db.base import Base


class DeploymentPlan(Base):
    __tablename__ = "deployment_plans"

    id = Column(Integer, primary_key=True)
    plan_id = Column(String(120), unique=True, index=True, nullable=False)
    solution_pack_id = Column(String(120), index=True, nullable=False)
    value_case_id = Column(String(120), nullable=True)
    phases_json = Column(JSON, nullable=False, default=list)
    timeline_weeks = Column(Integer, default=8)
    environment_json = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
