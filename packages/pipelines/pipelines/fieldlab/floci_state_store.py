"""Floci state store — DynamoDB operational state persistence with streaming support."""

import json
import threading
from datetime import datetime, timezone
from typing import Any, Callable

from .floci_client import FlociClient


class FlociStateStore:
    """Persist and retrieve incident operational state from DynamoDB."""

    def __init__(self, client: FlociClient | None = None):
        self.client = client or FlociClient()
        self.table = self.client.dynamodb_resource.Table("PraxisIncidentState")
        self._listeners: list[Callable[..., Any]] = []
        self._stream_enabled = False
        self._stream_arn = ""
        self._polling = True
        self._poller_thread: threading.Thread | None = None

    def write_run_state(
        self, run_id: str, pack_id: str, status: str, metadata: dict | None = None
    ) -> dict:
        item = {
            "run_id": run_id,
            "pack_id": pack_id,
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "metadata": json.dumps(metadata or {}),
        }
        self.table.put_item(Item=item)
        return {"run_id": run_id, "status": status, "stored": True}

    def get_run_state(self, run_id: str) -> dict | None:
        response = self.table.get_item(Key={"run_id": run_id})
        item = response.get("Item")
        if item:
            item["metadata"] = json.loads(item.get("metadata", "{}"))
        return item

    def list_runs(self, limit: int = 100) -> list[dict]:
        response = self.table.scan(Limit=limit)
        items = response.get("Items", [])
        for item in items:
            item["metadata"] = json.loads(item.get("metadata", "{}"))
        return items

    def update_run_status(self, run_id: str, status: str, metadata: dict | None = None) -> dict:
        updates = {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
        if metadata:
            updates["metadata"] = json.dumps(metadata)
        self.table.update_item(
            Key={"run_id": run_id},
            UpdateExpression="SET #s = :status, updated_at = :updated_at, #m = :metadata",
            ExpressionAttributeNames={"#s": "status", "#m": "metadata"},
            ExpressionAttributeValues={
                ":status": status,
                ":updated_at": updates["updated_at"],
                ":metadata": updates.get("metadata", "{}"),
            },
        )
        self._notify_listeners(run_id, status, updates)
        return {"run_id": run_id, "status": status, "updated": True}

    def enable_streaming(self) -> dict:
        """Enable DynamoDB Streams on the incident state table for real-time change capture."""
        try:
            ddb = self.client._client("dynamodb")
            response = ddb.update_table(
                TableName="PraxisIncidentState",
                StreamSpecification={
                    "StreamEnabled": True,
                    "StreamViewType": "NEW_AND_OLD_IMAGES",
                },
            )
            self._stream_arn = response.get("TableDescription", {}).get(
                "LatestStreamArn", ""
            )
            self._stream_enabled = True
            self.client.cw.log_metric("dynamodb_streams/enabled", 1.0)
            return {
                "status": "enabled",
                "table": "PraxisIncidentState",
                "stream_arn": self._stream_arn,
            }
        except Exception as e:
            self.client.cw.log_error("dynamodb_streams/enable_failed")
            return {"status": "error", "error": str(e)}

    def subscribe_to_changes(self, callback: Callable[..., Any]) -> threading.Thread:
        """Subscribe to real-time DynamoDB changes via a polling thread.

        Args:
            callback: Called with (run_id: str, status: str, metadata: dict)
                       when a change is detected.

        Returns:
            Thread object that can be stopped with .stop()
        """
        self._listeners.append(callback)
        return self._poller_thread

    def _notify_listeners(self, run_id: str, status: str, metadata: dict) -> None:
        """Notify all registered listeners of a state change."""
        for listener in self._listeners:
            try:
                listener(run_id, status, metadata)
            except Exception:
                pass

    def start_stream_poller(self, interval: float = 5.0) -> threading.Thread:
        """Start a background thread that polls for DynamoDB changes.

        This simulates DynamoDB Streams behavior when the actual Floci
        DynamoDB Streams feature is unavailable.
        """
        last_state: dict[str, dict[str, Any]] = {}

        def _poll_loop() -> None:
            while getattr(self, "_polling", True):
                try:
                    items = self.list_runs()
                    for item in items:
                        run_id = item.get("run_id", "")
                        status = item.get("status", "")
                        meta = item.get("metadata", {})
                        prev = last_state.get(run_id, {})
                        if prev.get("status") != status or prev.get("metadata") != meta:
                            self._notify_listeners(run_id, status, meta)
                        last_state[run_id] = {
                            "status": status,
                            "metadata": meta,
                        }
                except Exception:
                    pass
                threading.Event().wait(interval)

        self._polling = True
        self._poller_thread = threading.Thread(target=_poll_loop, daemon=True)
        self._poller_thread.start()
        return self._poller_thread

    def stop_stream_poller(self) -> None:
        """Stop the background change poller."""
        self._polling = False
        if hasattr(self, "_poller_thread") and self._poller_thread:
            self._poller_thread.join(timeout=2)
