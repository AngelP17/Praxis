import json
import boto3


class FieldLabConsumer:
    def __init__(self, endpoint_url: str = "http://localhost:4566", region: str = "us-east-1"):
        self.endpoint_url = endpoint_url
        self.region = region
        self.sqs = boto3.client(
            "sqs",
            endpoint_url=endpoint_url,
            region_name=region,
            aws_access_key_id="test",
            aws_secret_access_key="test",
        )
        self.queue_url = f"{endpoint_url}/000000000000/praxis-incident-events"

    def receive_events(self, max_messages: int = 10) -> list[dict]:
        response = self.sqs.receive_message(
            QueueUrl=self.queue_url,
            MaxNumberOfMessages=max_messages,
            WaitTimeSeconds=5,
        )
        messages = response.get("Messages", [])
        events = []
        for msg in messages:
            try:
                body = json.loads(msg.get("Body", "{}"))
                body["_receipt_handle"] = msg.get("ReceiptHandle", "")
                events.append(body)
            except json.JSONDecodeError:
                events.append(
                    {"raw": msg.get("Body", ""), "_receipt_handle": msg.get("ReceiptHandle", "")}
                )
        return events

    def delete_event(self, receipt_handle: str):
        self.sqs.delete_message(
            QueueUrl=self.queue_url,
            ReceiptHandle=receipt_handle,
        )
