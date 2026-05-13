"""Floci workflow bus — EventBridge routing for FieldLab workflow events."""

import json
from datetime import datetime, timezone

from .floci_client import FlociClient


class FlociWorkflowBus:
    """Route workflow events through EventBridge for downstream consumers."""

    def __init__(self, client: FlociClient | None = None):
        self.client = client or FlociClient()
        self.event_bus = "praxis-workflow-events"

    def emit(self, detail_type: str, detail: dict) -> dict:
        response = self.client.events.put_events(
            Entries=[
                {
                    "Source": "praxis.fieldlab",
                    "DetailType": detail_type,
                    "Detail": json.dumps(detail),
                    "EventBusName": self.event_bus,
                }
            ]
        )
        return {
            "detail_type": detail_type,
            "entries": len(response.get("Entries", [])),
            "status": "published",
        }

    def run_started(self, run_id: str, pack_id: str) -> dict:
        return self.emit(
            "FieldLabRunStarted",
            {
                "run_id": run_id,
                "pack_id": pack_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    def run_completed(self, run_id: str, pack_id: str, proof_hash: str) -> dict:
        return self.emit(
            "FieldLabRunCompleted",
            {
                "run_id": run_id,
                "pack_id": pack_id,
                "proof_hash": proof_hash,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    def decision_generated(self, run_id: str, decision_id: str, priority_score: float) -> dict:
        return self.emit(
            "DecisionGenerated",
            {
                "run_id": run_id,
                "decision_id": decision_id,
                "priority_score": priority_score,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    def action_captured(self, run_id: str, action: str, mode: str, actor: str) -> dict:
        return self.emit(
            "ActionCaptured",
            {
                "run_id": run_id,
                "action": action,
                "mode": mode,
                "actor": actor,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    def value_case_ready(self, run_id: str, pack_id: str, annual_value: float) -> dict:
        return self.emit(
            "ValueCaseReady",
            {
                "run_id": run_id,
                "pack_id": pack_id,
                "annual_value": annual_value,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )
