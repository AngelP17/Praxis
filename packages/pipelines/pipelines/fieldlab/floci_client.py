"""Floci client — thin boto3 wrapper for local AWS emulation."""

import boto3
from typing import Any


class FlociClient:
    """Unified boto3 client factory for Floci local AWS services."""

    def __init__(
        self,
        endpoint_url: str = "http://localhost:4566",
        region: str = "us-east-1",
        access_key_id: str = "test",
        secret_access_key: str = "test",
    ):
        self.endpoint_url = endpoint_url
        self.region = region
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self._clients: dict[str, Any] = {}

    def _client(self, service: str) -> Any:
        if service not in self._clients:
            self._clients[service] = boto3.client(
                service,
                endpoint_url=self.endpoint_url,
                region_name=self.region,
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key,
            )
        return self._clients[service]

    @property
    def sqs(self):
        return self._client("sqs")

    @property
    def s3(self):
        return self._client("s3")

    @property
    def dynamodb(self):
        return self._client("dynamodb")

    @property
    def events(self):
        return self._client("events")

    @property
    def dynamodb_resource(self):
        return boto3.resource(
            "dynamodb",
            endpoint_url=self.endpoint_url,
            region_name=self.region,
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
        )

    def healthcheck(self) -> dict:
        """Verify Floci is reachable."""
        try:
            self.s3.list_buckets()
            return {"status": "ok", "endpoint": self.endpoint_url}
        except Exception as e:
            return {"status": "error", "error": str(e), "endpoint": self.endpoint_url}
