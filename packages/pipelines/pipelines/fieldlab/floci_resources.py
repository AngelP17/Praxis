"""Floci resources — provision and verify local AWS resources."""

from .floci_client import FlociClient

QUEUES = {
    "praxis-incident-events": {},
    "praxis-dead-letter": {},
}

BUCKETS = [
    "praxis-raw-events",
    "praxis-audit-artifacts",
    "praxis-solution-pack-assets",
]

TABLES = {
    "PraxisIncidentState": {
        "KeySchema": [{"AttributeName": "run_id", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "run_id", "AttributeType": "S"}],
        "BillingMode": "PAY_PER_REQUEST",
    },
    "PraxisReplayIndex": {
        "KeySchema": [{"AttributeName": "replay_hash", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "replay_hash", "AttributeType": "S"}],
        "BillingMode": "PAY_PER_REQUEST",
    },
    "PraxisValueCase": {
        "KeySchema": [{"AttributeName": "pack_id", "KeyType": "HASH"}],
        "AttributeDefinitions": [{"AttributeName": "pack_id", "AttributeType": "S"}],
        "BillingMode": "PAY_PER_REQUEST",
    },
}

EVENT_BUSES = ["praxis-workflow-events"]


class FlociResources:
    """Idempotent resource provisioning for Floci local AWS."""

    def __init__(self, client: FlociClient | None = None):
        self.client = client or FlociClient()
        self._report: list[dict] = []

    def provision_all(self) -> list[dict]:
        self._provision_queues()
        self._provision_buckets()
        self._provision_tables()
        self._provision_event_buses()
        return self._report

    def _provision_queues(self):
        for name, attrs in QUEUES.items():
            try:
                self.client.sqs.create_queue(QueueName=name, Attributes=attrs)
                self._report.append({"type": "sqs", "name": name, "status": "created"})
            except self.client.sqs.exceptions.QueueNameExists:
                self._report.append({"type": "sqs", "name": name, "status": "exists"})
            except Exception as e:
                self._report.append(
                    {"type": "sqs", "name": name, "status": "error", "error": str(e)}
                )

    def _provision_buckets(self):
        for name in BUCKETS:
            try:
                self.client.s3.create_bucket(Bucket=name)
                self._report.append({"type": "s3", "name": name, "status": "created"})
            except self.client.s3.exceptions.BucketAlreadyExists:
                self._report.append({"type": "s3", "name": name, "status": "exists"})
            except Exception as e:
                # LocalStack/Floci may return different error shape
                if "BucketAlreadyExists" in str(e) or "already exists" in str(e):
                    self._report.append({"type": "s3", "name": name, "status": "exists"})
                else:
                    self._report.append(
                        {"type": "s3", "name": name, "status": "error", "error": str(e)}
                    )

    def _provision_tables(self):
        for name, spec in TABLES.items():
            try:
                self.client.dynamodb.create_table(TableName=name, **spec)
                self._report.append({"type": "dynamodb", "name": name, "status": "created"})
            except self.client.dynamodb.exceptions.ResourceInUseException:
                self._report.append({"type": "dynamodb", "name": name, "status": "exists"})
            except Exception as e:
                if "already exists" in str(e) or "ResourceInUse" in str(e):
                    self._report.append({"type": "dynamodb", "name": name, "status": "exists"})
                else:
                    self._report.append(
                        {"type": "dynamodb", "name": name, "status": "error", "error": str(e)}
                    )

    def _provision_event_buses(self):
        for name in EVENT_BUSES:
            try:
                self.client.events.create_event_bus(Name=name)
                self._report.append({"type": "eventbridge", "name": name, "status": "created"})
            except Exception as e:
                if "already exists" in str(e) or "EventBusAlreadyExists" in str(e):
                    self._report.append({"type": "eventbridge", "name": name, "status": "exists"})
                else:
                    self._report.append(
                        {"type": "eventbridge", "name": name, "status": "error", "error": str(e)}
                    )

    def verify_all(self) -> dict:
        queues = self.client.sqs.list_queues().get("QueueUrls", [])
        buckets = [b["Name"] for b in self.client.s3.list_buckets().get("Buckets", [])]
        tables = self.client.dynamodb.list_tables().get("TableNames", [])
        buses = [b["Name"] for b in self.client.events.list_event_buses().get("EventBuses", [])]
        return {
            "queues": queues,
            "buckets": buckets,
            "tables": tables,
            "event_buses": buses,
        }
