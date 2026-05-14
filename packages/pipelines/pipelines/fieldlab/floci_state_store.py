"""Floci state store — DynamoDB operational state persistence."""

import json
from datetime import datetime, timezone

from .floci_client import FlociClient


class FlociStateStore:
    """Persist and retrieve incident operational state from DynamoDB."""

    def __init__(self, client: FlociClient | None = None):
        self.client = client or FlociClient()
        self.table = self.client.dynamodb_resource.Table("PraxisIncidentState")

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
        return {"run_id": run_id, "status": status, "updated": True}
