from sqlalchemy import Column, ForeignKey, Integer, String

from infrastructure.db.base import Base


class TicketLabel(Base):
    __tablename__ = "ticket_labels"

    ticket_id = Column(String(20), primary_key=True, index=True)
    label_id = Column(Integer, ForeignKey("labels.id"), primary_key=True)
