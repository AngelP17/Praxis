"""Floci audit archive — S3 storage for proof and audit artifacts."""

import json

from .floci_client import FlociClient


class FlociAuditArchive:
    """Store and retrieve proof/audit artifacts from S3."""

    def __init__(self, client: FlociClient | None = None):
        self.client = client or FlociClient()
        self.bucket = "praxis-audit-artifacts"

    def store_proof(self, run_id: str, proof: dict) -> dict:
        key = f"runs/{run_id}/praxis_proof.json"
        body = json.dumps(proof, indent=2).encode("utf-8")
        self.client.s3.put_object(Bucket=self.bucket, Key=key, Body=body)
        return {"bucket": self.bucket, "key": key, "status": "stored"}

    def store_executive_readout(self, run_id: str, readout: str) -> dict:
        key = f"runs/{run_id}/executive-readout.md"
        self.client.s3.put_object(Bucket=self.bucket, Key=key, Body=readout.encode("utf-8"))
        return {"bucket": self.bucket, "key": key, "status": "stored"}

    def store_replay(self, run_id: str, replay: dict) -> dict:
        key = f"runs/{run_id}/replay.json"
        body = json.dumps(replay, indent=2).encode("utf-8")
        self.client.s3.put_object(Bucket=self.bucket, Key=key, Body=body)
        return {"bucket": self.bucket, "key": key, "status": "stored"}

    def get_proof(self, run_id: str) -> dict | None:
        key = f"runs/{run_id}/praxis_proof.json"
        try:
            response = self.client.s3.get_object(Bucket=self.bucket, Key=key)
            return json.loads(response["Body"].read().decode("utf-8"))
        except Exception:
            return None

    def list_run_artifacts(self, run_id: str) -> list[dict]:
        prefix = f"runs/{run_id}/"
        response = self.client.s3.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
        return [
            {"key": obj["Key"], "size": obj["Size"], "modified": obj["LastModified"].isoformat()}
            for obj in response.get("Contents", [])
        ]
