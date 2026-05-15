"""Floci client — thin boto3 wrapper for local AWS emulation with IAM role enforcement."""

import boto3
import logging
import time
from botocore.config import Config as BotoConfig
from typing import Any

from .floci_iam import IamRoleService

_FLOCI_CONFIG = BotoConfig(
    connect_timeout=5,
    read_timeout=5,
    retries={"max_attempts": 1},
)

logger = logging.getLogger(__name__)

# Action-to-service mapping for IAM enforcement
SERVICE_ACTION_MAP: dict[str, str] = {
    "s3.list_buckets": "s3:ListBucket",
    "s3.get_object": "s3:GetObject",
    "s3.put_object": "s3:PutObject",
    "s3.delete_object": "s3:DeleteObject",
    "sqs.send_message": "sqs:SendMessage",
    "sqs.receive_message": "sqs:ReceiveMessage",
    "dynamodb.put_item": "dynamodb:PutItem",
    "dynamodb.get_item": "dynamodb:GetItem",
    "dynamodb.update_item": "dynamodb:UpdateItem",
    "dynamodb.scan": "dynamodb:Scan",
    "events.put_events": "events:PutEvents",
}


class CloudWatchLogger:
    """CloudWatch metrics and logging integration for Floci."""

    def __init__(self, client: Any):
        self.client = client
        self._cloudwatch = None
        self.namespace = "Praxis/FieldLab"

    @property
    def cloudwatch(self):
        if self._cloudwatch is None:
            self._cloudwatch = boto3.client(
                "cloudwatch",
                endpoint_url=self.client.endpoint_url,
                region_name=self.client.region,
                aws_access_key_id=self.client.access_key_id,
                aws_secret_access_key=self.client.secret_access_key,
                config=_FLOCI_CONFIG,
            )
        return self._cloudwatch

    def log_metric(self, metric_name: str, value: float, unit: str = "Count") -> None:
        """Send a metric to CloudWatch."""
        try:
            self.cloudwatch.put_metric_data(
                Namespace=self.namespace,
                MetricData=[{
                    "MetricName": metric_name,
                    "Value": value,
                    "Unit": unit,
                    "Timestamp": time.time(),
                }]
            )
        except Exception as e:
            logger.warning(f"Failed to log metric {metric_name}: {e}")

    def log_error(self, error_type: str, run_id: str | None = None) -> None:
        """Log an error metric to CloudWatch."""
        self.log_metric(f"Errors/{error_type}", 1.0)


class FlociClient:
    """Unified boto3 client factory for Floci local AWS services with IAM enforcement."""

    def __init__(
        self,
        endpoint_url: str = "http://localhost:4566",
        region: str = "us-east-1",
        access_key_id: str = "test",
        secret_access_key: str = "test",
        iam_role: str = "writer",
    ):
        self.endpoint_url = endpoint_url
        self.region = region
        self.access_key_id = access_key_id
        self.secret_access_key = secret_access_key
        self._clients: dict[str, Any] = {}
        self.cw = CloudWatchLogger(self)
        self.iam = IamRoleService(iam_role)
        self._role = iam_role

    def assert_allowed(self, action_key: str) -> None:
        """Assert that the current IAM role permits a given Floci operation."""
        aws_action = SERVICE_ACTION_MAP.get(action_key)
        if aws_action:
            self.iam.authorize(aws_action)

    def switch_role(self, role: str) -> "FlociClient":
        """Return a new FlociClient instance with a different IAM role."""
        return FlociClient(
            endpoint_url=self.endpoint_url,
            region=self.region,
            access_key_id=self.access_key_id,
            secret_access_key=self.secret_access_key,
            iam_role=role,
        )

    def _client(self, service: str) -> Any:
        if service not in self._clients:
            self._clients[service] = boto3.client(
                service,
                endpoint_url=self.endpoint_url,
                region_name=self.region,
                aws_access_key_id=self.access_key_id,
                aws_secret_access_key=self.secret_access_key,
                config=_FLOCI_CONFIG,
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
            config=_FLOCI_CONFIG,
        )

    def healthcheck(self) -> dict:
        """Verify Floci is reachable."""
        try:
            self.s3.list_buckets()
            return {"status": "ok", "endpoint": self.endpoint_url}
        except Exception as e:
            return {"status": "error", "error": str(e), "endpoint": self.endpoint_url}
