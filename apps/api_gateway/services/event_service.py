import json

from sqlalchemy import text
from sqlalchemy.orm import Session

from apps.api_gateway.services.operational_intelligence import fetch_ticket_row


def _json_serialize(obj: object) -> str:
    return json.dumps(obj, default=_json_default)


def _json_default(obj: object) -> str:
    if hasattr(obj, "isoformat"):
        return obj.isoformat()
    return str(obj)


class EventService:
    def __init__(self, db: Session):
        self.db = db

    def get_ticket_event_stream(self, ticket_id: str):
        ticket = fetch_ticket_row(self.db, ticket_id)
        if ticket is None:
            return []

        rows = self.db.execute(
            text(
                """
                SELECT
                    event_type,
                    event_ts,
                    actor_type,
                    actor_id,
                    payload_json
                FROM ticket_events
                WHERE ticket_id = :ticket_pk
                ORDER BY event_ts ASC, id ASC
                """
            ),
            {"ticket_pk": ticket["id"]},
        ).mappings()
        events = [
            {
                "event_type": row["event_type"],
                "event_ts": row["event_ts"].isoformat()
                if hasattr(row["event_ts"], "isoformat")
                else row["event_ts"]
                if row["event_ts"]
                else None,
                "actor_type": row["actor_type"],
                "actor_id": row["actor_id"],
                "payload": self._deserialize_payload(row["payload_json"]),
            }
            for row in rows
        ]
        if events:
            return events
        created_at = ticket.get("created_at") or ticket.get("date_opened")
        return [
            {
                "event_type": "ticket_created",
                "event_ts": created_at.isoformat()
                if hasattr(created_at, "isoformat")
                else str(created_at),
                "actor_type": "legacy",
                "actor_id": "flask-app",
                "payload": {
                    "status": ticket.get("status"),
                    "priority": ticket.get("priority"),
                },
            }
        ]

    def record_ticket_event(
        self,
        ticket_pk: int,
        event_type: str,
        actor_id: str,
        payload: dict[str, object] | None = None,
        actor_type: str = "operator",
    ) -> None:
        self.db.execute(
            text(
                """
                INSERT INTO ticket_events (
                    ticket_id,
                    event_type,
                    actor_type,
                    actor_id,
                    payload_json
                )
                VALUES (
                    :ticket_id,
                    :event_type,
                    :actor_type,
                    :actor_id,
                    :payload_json
                )
                """
            ),
            {
                "ticket_id": ticket_pk,
                "event_type": event_type,
                "actor_type": actor_type,
                "actor_id": actor_id,
                "payload_json": json.dumps(payload or {}),
            },
        )

    def _deserialize_payload(self, payload: object) -> object:
        if isinstance(payload, str):
            try:
                return json.loads(payload)
            except json.JSONDecodeError:
                return payload
        return payload

    def _normalize_cloudevent(self, payload: dict[str, object]) -> dict[str, object]:
        if payload.get("specversion") != "1.0" or "data" not in payload:
            return payload

        data = payload.get("data")
        if not isinstance(data, dict):
            data = {}

        return {
            "event_id": payload.get("id"),
            "source": payload.get("source", "unknown"),
            "source_ref": payload.get("subject"),
            "event_type": payload.get("type", "unknown"),
            "asset_id": data.get("asset_id"),
            "site": data.get("site"),
            "line": data.get("line"),
            "severity": data.get("severity", "low"),
            "occurred_at": payload.get("time"),
            "payload": data,
            "normalized_payload": {
                "cloudevent": {
                    "id": payload.get("id"),
                    "source": payload.get("source"),
                    "type": payload.get("type"),
                    "subject": payload.get("subject"),
                    "time": payload.get("time"),
                },
                "scenario_id": data.get("scenario_id"),
                "asset_id": data.get("asset_id"),
                "site": data.get("site"),
                "line": data.get("line"),
                "severity": data.get("severity", "low"),
                "signal": data.get("signal"),
                "confidence": data.get("confidence"),
                "raw": data.get("raw", {}),
            },
        }

    def ingest_event(self, payload: dict[str, object]) -> dict[str, object]:
        from datetime import datetime, timezone
        import uuid

        payload = self._normalize_cloudevent(payload)
        event_id = payload.get("event_id") or f"evt_{uuid.uuid4().hex[:12]}"
        occurred_at = payload.get("occurred_at")
        if isinstance(occurred_at, str):
            occurred_at = datetime.fromisoformat(occurred_at.replace("Z", "+00:00"))
        else:
            occurred_at = datetime.now(timezone.utc)

        self.db.execute(
            text(
                """
                INSERT INTO operational_events (
                    event_id, source, source_ref, event_type, asset_id, site, line,
                    severity, occurred_at, payload, normalized_payload
                )
                VALUES (
                    :event_id, :source, :source_ref, :event_type, :asset_id, :site, :line,
                    :severity, :occurred_at, :payload, :normalized_payload
                )
                ON CONFLICT (event_id) DO UPDATE SET
                    payload = EXCLUDED.payload,
                    normalized_payload = EXCLUDED.normalized_payload,
                    received_at = CURRENT_TIMESTAMP
                RETURNING id
                """
            ),
            {
                "event_id": event_id,
                "source": payload.get("source", "manual"),
                "source_ref": payload.get("source_ref"),
                "event_type": payload.get("event_type", "unknown"),
                "asset_id": payload.get("asset", {}).get("asset_id")
                if isinstance(payload.get("asset"), dict)
                else payload.get("asset_id"),
                "site": payload.get("asset", {}).get("site")
                if isinstance(payload.get("asset"), dict)
                else payload.get("site"),
                "line": payload.get("asset", {}).get("line")
                if isinstance(payload.get("asset"), dict)
                else payload.get("line"),
                "severity": payload.get("severity", "low"),
                "occurred_at": occurred_at,
                "payload": _json_serialize(payload.get("payload", {})),
                "normalized_payload": _json_serialize(
                    payload.get("normalized_payload") or self._normalize_payload(payload)
                ),
            },
        )
        self.db.commit()
        try:
            from apps.api_gateway.services.sse_broadcaster import event_broadcaster
            event_broadcaster.broadcast({
                "event_id": event_id,
                "source": payload.get("source", "manual"),
                "event_type": payload.get("event_type", "unknown"),
                "severity": payload.get("severity", "low"),
                "occurred_at": occurred_at.isoformat() if hasattr(occurred_at, "isoformat") else str(occurred_at),
                "payload": payload.get("payload", {})
            })
        except Exception:
            pass
        return {"event_id": event_id, "status": "ingested"}

    def _normalize_payload(self, payload: dict[str, object]) -> dict[str, object]:
        return {
            "source": payload.get("source"),
            "event_type": payload.get("event_type"),
            "severity": payload.get("severity"),
            "asset_id": payload.get("asset", {}).get("asset_id")
            if isinstance(payload.get("asset"), dict)
            else payload.get("asset_id"),
            "site": payload.get("asset", {}).get("site")
            if isinstance(payload.get("asset"), dict)
            else payload.get("site"),
            "line": payload.get("asset", {}).get("line")
            if isinstance(payload.get("asset"), dict)
            else payload.get("line"),
            "raw": payload.get("payload", {}),
        }

    def list_events(self, source: str | None = None) -> list[dict[str, object]]:
        query = "SELECT event_id, source, event_type, severity, occurred_at, payload FROM operational_events"
        params: dict[str, object] = {}
        if source:
            query += " WHERE source = :source"
            params["source"] = source
        query += " ORDER BY occurred_at DESC LIMIT 500"
        rows = self.db.execute(text(query), params).mappings()
        return [
            {
                "event_id": row["event_id"],
                "source": row["source"],
                "event_type": row["event_type"],
                "severity": row["severity"],
                "occurred_at": row["occurred_at"].isoformat()
                if hasattr(row["occurred_at"], "isoformat")
                else row["occurred_at"]
                if row["occurred_at"]
                else None,
                "payload": self._deserialize_payload(row["payload"]),
            }
            for row in rows
        ]

    def get_event(self, event_id: str) -> dict[str, object] | None:
        row = (
            self.db.execute(
                text(
                    """
                SELECT event_id, source, source_ref, event_type, asset_id, site, line,
                       severity, occurred_at, payload, normalized_payload, replay_hash, created_at
                FROM operational_events
                WHERE event_id = :event_id
                """
                ),
                {"event_id": event_id},
            )
            .mappings()
            .first()
        )
        if not row:
            return None
        return {
            "event_id": row["event_id"],
            "source": row["source"],
            "source_ref": row["source_ref"],
            "event_type": row["event_type"],
            "asset_id": row["asset_id"],
            "site": row["site"],
            "line": row["line"],
            "severity": row["severity"],
            "occurred_at": row["occurred_at"].isoformat()
            if hasattr(row["occurred_at"], "isoformat")
            else row["occurred_at"]
            if row["occurred_at"]
            else None,
            "payload": self._deserialize_payload(row["payload"]),
            "normalized_payload": self._deserialize_payload(row["normalized_payload"]),
            "replay_hash": row["replay_hash"],
            "created_at": row["created_at"].isoformat()
            if hasattr(row["created_at"], "isoformat")
            else row["created_at"]
            if row["created_at"]
            else None,
        }
