import json
import boto3


class FieldLabProducer:
    def __init__(self, endpoint_url: str = "http://localhost:4566", region: str = "us-east-1"):
        self.endpoint_url = endpoint_url
        self.region = region
        self.sqs = boto3.client("sqs", endpoint_url=endpoint_url, region_name=region)
        self.s3 = boto3.client("s3", endpoint_url=endpoint_url, region_name=region)
        self.queue_url = f"{endpoint_url}/000000000000/praxis-incident-events"

    def send_event(self, event: dict) -> dict:
        response = self.sqs.send_message(
            QueueUrl=self.queue_url,
            MessageBody=json.dumps(event),
        )
        return {"message_id": response.get("MessageId", ""), "status": "sent"}

    def send_batch(self, events: list[dict]) -> list[dict]:
        results = []
        for event in events:
            results.append(self.send_event(event))
        return results

    def upload_to_s3(self, bucket: str, key: str, data: str | bytes) -> dict:
        if isinstance(data, str):
            data = data.encode("utf-8")
        self.s3.put_object(Bucket=bucket, Key=key, Body=data)
        return {"bucket": bucket, "key": key, "status": "uploaded"}

    def publish_eventbridge(self, detail_type: str, detail: dict) -> dict:
        events_client = boto3.client(
            "events", endpoint_url=self.endpoint_url, region_name=self.region
        )
        response = events_client.put_events(
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
