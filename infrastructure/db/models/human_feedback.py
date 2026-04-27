from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from infrastructure.db.base import Base


class HumanFeedback(Base):
    __tablename__ = "human_feedback"

    id = Column(Integer, primary_key=True, autoincrement=True)
    decision_id = Column(
        Integer,
        ForeignKey("decision_records.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    actor = Column(String(100), nullable=False)
    feedback_type = Column(String(30), nullable=False)
    feedback_value = Column(String(30), nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    decision = relationship("DecisionRecord", back_populates="human_feedback")
