import asyncio
from uuid import uuid4

from infrastructure.db.models.outbox_message import OutboxMessage
from infrastructure.db.base import Base
from infrastructure.db.session import SessionLocal, _import_models, engine
from apps.api_gateway.config import settings
from apps.api_gateway.services.outbox_relay import OutboxRelayWorker


def setup_module():
    _import_models()
    Base.metadata.create_all(bind=engine)


def test_outbox_eventbridge_without_bus_fails_closed(monkeypatch):
    monkeypatch.setattr(settings, "OUTBOX_DISPATCH_MODE", "eventbridge")

    worker = OutboxRelayWorker(max_attempts=2)
    idempotency_key = f"test-outbox-eventbridge-without-bus:{uuid4()}"
    with SessionLocal() as db:
        message = OutboxMessage(
            topic="praxis.test",
            payload={"ok": True},
            status="pending",
            idempotency_key=idempotency_key,
        )
        db.add(message)
        db.commit()
        message_id = message.id

    asyncio.run(worker.process_pending_messages())

    with SessionLocal() as db:
        message = db.get(OutboxMessage, message_id)
        assert message is not None
        assert message.status in {"failed", "dead_lettered"}
        assert message.attempt_count == 1
        assert message.last_error
