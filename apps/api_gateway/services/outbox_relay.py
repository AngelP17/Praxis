import asyncio
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy import select

from infrastructure.db.session import SessionLocal
from infrastructure.db.models.outbox_message import OutboxMessage
from apps.api_gateway.config import settings

logger = logging.getLogger("outbox_relay")


class OutboxRelayWorker:
    def __init__(self, poll_interval: float = 2.0, max_attempts: int = 5):
        self.poll_interval = poll_interval
        self.max_attempts = max_attempts
        self._running = False
        self._task = None

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._loop())
        logger.info("Outbox relay worker started")

    async def stop(self) -> None:
        if not self._running:
            return
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Outbox relay worker stopped")

    async def _loop(self) -> None:
        while self._running:
            try:
                await self.process_pending_messages()
            except Exception as e:
                logger.error(f"Error in outbox relay loop: {e}", exc_info=True)
            try:
                await asyncio.sleep(self.poll_interval)
            except asyncio.CancelledError:
                break

    async def process_pending_messages(self) -> None:
        # Lazy imports to avoid startup dependency cycles
        from pipelines.fieldlab.floci_workflow_bus import FlociWorkflowBus
        from pipelines.fieldlab.floci_client import FlociClient

        with SessionLocal() as db:
            # Query pending messages
            now = datetime.now(timezone.utc)
            stmt = (
                select(OutboxMessage)
                .where(OutboxMessage.status.in_(["pending", "failed"]))
                .where((OutboxMessage.next_attempt_at.is_(None)) | (OutboxMessage.next_attempt_at <= now))
                .where(OutboxMessage.attempt_count < self.max_attempts)
                .order_by(OutboxMessage.created_at.asc())
                .limit(50)
            )
            messages = db.execute(stmt).scalars().all()

            if not messages:
                return

            logger.info(f"Found {len(messages)} pending outbox messages to process")

            dispatch_mode = settings.OUTBOX_DISPATCH_MODE or (
                "eventbridge" if settings.ENV == "production" else "simulation"
            )

            # Try to initialize Floci Workflow Bus for real EventBridge dispatch.
            bus = None
            if dispatch_mode == "eventbridge":
                try:
                    # We construct FlociClient with short timeout to avoid hangs
                    client = FlociClient(endpoint_url=settings.FLOCI_ENDPOINT)
                    # Quick call check
                    bus = FlociWorkflowBus(client=client)
                except Exception as e:
                    logger.debug(f"Floci environment connection issue: {e}")

            for msg in messages:
                try:
                    logger.info(f"Relaying outbox message {msg.id} to topic: {msg.topic}")

                    if dispatch_mode == "simulation":
                        logger.info(
                            f"SIMULATION DISPATCH: Decoupled outbox event {msg.id} dispatched [Topic: {msg.topic}] payload: {msg.payload}"
                        )
                        msg.status = "simulated"
                        msg.last_error = None
                        continue

                    if bus is None:
                        raise RuntimeError("outbox EventBridge dispatch requested but no workflow bus is configured")

                    bus.emit(
                        detail_type=msg.topic,
                        detail=msg.payload
                    )
                    logger.info(f"Successfully published outbox message {msg.id} to EventBridge")

                    msg.status = "published"
                    msg.published_at = datetime.now(timezone.utc)
                    msg.last_error = None
                except Exception as ex:
                    logger.error(f"Failed to process outbox message {msg.id}: {ex}", exc_info=True)
                    msg.attempt_count = (msg.attempt_count or 0) + 1
                    msg.status = "dead_lettered" if msg.attempt_count >= self.max_attempts else "failed"
                    msg.last_error = str(ex)[:500]
                    msg.next_attempt_at = datetime.now(timezone.utc) + timedelta(seconds=min(60, 2 ** msg.attempt_count))
                    if msg.status == "dead_lettered":
                        msg.dead_lettered_at = datetime.now(timezone.utc)

            db.commit()


# Singelton instance to be imported and run in lifespan
outbox_worker = OutboxRelayWorker()
