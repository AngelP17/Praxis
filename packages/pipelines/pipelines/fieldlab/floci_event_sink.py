"""Floci event sink — send events through SQS and archive to S3."""

import json
from datetime import datetime, timezone

from .floci_client import FlociClient


class FlociEventSink:
    """Send operational events to Floci SQS + S3."""

    def __init__(self, client: FlociClient | None = None):
        self.client = client or FlociClient()
        self.queue_url = f"{self.client.endpoint_url}/000000000000/praxis-incident-events"

    def send(self, event: dict) -> dict:
        body = json.dumps(event)
        response = self.client.sqs.send_message(QueueUrl=self.queue_url, MessageBody=body)
        return {"message_id": response.get("MessageId"), "status": "sent"}

    def send_batch(self, events: list[dict]) -> list[dict]:
        return [self.send(ev) for ev in events]

    def archive_to_s3(self, bucket: str, key: str, events: list[dict]) -> dict:
        data = json.dumps(events, indent=2).encode("utf-8")
        self.client.s3.put_object(Bucket=bucket, Key=key, Body=data)
        return {"bucket": bucket, "key": key, "status": "archived", "events": len(events)}

    def archive_raw_events(self, run_id: str, events: list[dict]) -> dict:
        key = f"runs/{run_id}/raw-events.jsonl"
        lines = "\n".join(json.dumps(ev) for ev in events).encode("utf-8")
        self.client.s3.put_object(Bucket="praxis-raw-events", Key=key, Body=lines)
        return {
            "bucket": "praxis-raw-events",
            "key": key,
            "status": "archived",
            "events": len(events),
        }

    def emit_workflow_event(self, detail_type: str, detail: dict) -> dict:
        response = self.client.events.put_events(
            Entries=[
                {
                    "Source": "praxis.fieldlab",
                    "DetailType": detail_type,
                    "Detail": json.dumps(detail),
                    "EventBusName": "praxis-workflow-events",
                }
            ]
        )
        return {"entries": len(response.get("Entries", [])), "status": "published"}

    def ingest_solution_pack_events(self, run_id: str, pack_id: str, events: list[dict]) -> dict:
        """Full ingestion: SQS + S3 raw archive + workflow event."""
        sqs_results = self.send_batch(events)
        s3_result = self.archive_raw_events(run_id, events)
        workflow = self.emit_workflow_event(
            "FieldLabRunEventsIngested",
            {
                "run_id": run_id,
                "pack_id": pack_id,
                "event_count": len(events),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
        return {
            "run_id": run_id,
            "pack_id": pack_id,
            "sqs": sqs_results,
            "s3": s3_result,
            "workflow": workflow,
        }
