from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class CustomerContext(Base):
    __tablename__ = "customer_contexts"

    id = Column(Integer, primary_key=True)
    context_id = Column(String(120), unique=True, index=True, nullable=False)
    customer_name = Column(String(200), nullable=False)
    industry = Column(String(100), default="")
    profile_json = Column(JSON, nullable=False, default=dict)
    stakeholder_map_json = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
