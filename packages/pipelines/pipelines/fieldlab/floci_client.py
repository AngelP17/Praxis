"""Floci client — thin boto3 wrapper for local AWS emulation."""

import boto3
from typing import Any


class FlociClient:
    """Unified boto3 client factory for Floci local AWS services."""

    def __init__(self, endpoint_url: str = "http://localhost:4566", region: str = "us-east-1"):
        self.endpoint_url = endpoint_url
        self.region = region
        self._clients: dict[str, Any] = {}

    def _client(self, service: str) -> Any:
        if service not in self._clients:
            self._clients[service] = boto3.client(
                service,
                endpoint_url=self.endpoint_url,
                region_name=self.region,
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
        return boto3.resource("dynamodb", endpoint_url=self.endpoint_url, region_name=self.region)

    def healthcheck(self) -> dict:
        """Verify Floci is reachable."""
        try:
            self.s3.list_buckets()
            return {"status": "ok", "endpoint": self.endpoint_url}
        except Exception as e:
            return {"status": "error", "error": str(e), "endpoint": self.endpoint_url}
