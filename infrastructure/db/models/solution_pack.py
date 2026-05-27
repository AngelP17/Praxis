from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON

from infrastructure.db.base import Base


class SolutionPack(Base):
    __tablename__ = "solution_packs"

    id = Column(Integer, primary_key=True)
    pack_id = Column(String(120), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    industry = Column(String(100), default="")
    status = Column(String(40), default="active")
    scenario_json = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
