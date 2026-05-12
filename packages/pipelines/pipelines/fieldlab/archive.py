import json
import boto3
from datetime import datetime


class FieldLabArchive:
    def __init__(self, endpoint_url: str = "http://localhost:4566", region: str = "us-east-1"):
        self.endpoint_url = endpoint_url
        self.region = region
        self.s3 = boto3.client("s3", endpoint_url=endpoint_url, region_name=region)
        self.dynamodb = boto3.client("dynamodb", endpoint_url=endpoint_url, region_name=region)

    def archive_event(self, event: dict) -> dict:
        timestamp = datetime.utcnow().strftime("%Y/%m/%d/%H%M%S")
        event_id = event.get("event_id", f"evt_{datetime.utcnow().timestamp()}")
        key = f"events/{timestamp}/{event_id}.json"
        self.s3.put_object(
            Bucket="praxis-raw-events",
            Key=key,
            Body=json.dumps(event).encode("utf-8"),
        )
        return {"bucket": "praxis-raw-events", "key": key}

    def archive_audit(self, audit_data: dict) -> dict:
        timestamp = datetime.utcnow().strftime("%Y/%m/%d/%H%M%S")
        audit_id = audit_data.get("audit_id", f"aud_{datetime.utcnow().timestamp()}")
        key = f"audit/{timestamp}/{audit_id}.json"
        self.s3.put_object(
            Bucket="praxis-audit-artifacts",
            Key=key,
            Body=json.dumps(audit_data).encode("utf-8"),
        )
        return {"bucket": "praxis-audit-artifacts", "key": key}

    def put_incident_state(self, incident_id: str, state: dict) -> dict:
        self.dynamodb.put_item(
            TableName="PraxisIncidentState",
            Item={
                "incident_id": {"S": incident_id},
                "state_json": {"S": json.dumps(state)},
                "updated_at": {"S": datetime.utcnow().isoformat()},
            },
        )
        return {"table": "PraxisIncidentState", "incident_id": incident_id}
