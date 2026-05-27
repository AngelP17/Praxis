from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, JSON, String

from infrastructure.db.base import Base


class OutboxMessage(Base):
    __tablename__ = "outbox_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    topic = Column(String(200), nullable=False, index=True)
    payload = Column(JSON, nullable=False)
    status = Column(String(30), nullable=False, default="pending", index=True)
    attempt_count = Column(Integer, nullable=False, default=0)
    idempotency_key = Column(String(128), nullable=True, unique=True, index=True)
    last_error = Column(String(500), nullable=True)
    next_attempt_at = Column(DateTime(timezone=True), nullable=True)
    dead_lettered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    published_at = Column(DateTime, nullable=True)
