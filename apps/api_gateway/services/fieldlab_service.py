import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

from pipelines.fieldlab import (
    FlociClient,
    FlociResources,
    FlociEventSink,
    FlociStateStore,
    FlociAuditArchive,
    FlociWorkflowBus,
)
from sqlalchemy.orm import Session

from apps.api_gateway.config import settings
from astraea.praxis import ExpansionGraph, PraxisProofBuilder, ProofInputs


ROOT = Path(__file__).resolve().parents[3]

# In-process store used when Floci is unavailable
_MEMORY_STORE: dict[str, dict] = {}
_MEMORY_ACTIONS: dict[str, dict] = {}

# Cached Floci availability check (refreshed every 30s)
_FLOCI_CACHE: dict = {"available": None, "checked_at": 0}


def _floci_is_available(endpoint_url: str = "http://localhost:4566") -> bool:
    now = time.time()
    if _FLOCI_CACHE["checked_at"] and (now - _FLOCI_CACHE["checked_at"]) < 30:
        return bool(_FLOCI_CACHE["available"])
    _FLOCI_CACHE["checked_at"] = now
    try:
        floci = FlociClient(endpoint_url=endpoint_url)
        health = floci.healthcheck()
        _FLOCI_CACHE["available"] = health.get("status") == "ok"
    except Exception:
        _FLOCI_CACHE["available"] = False
    return bool(_FLOCI_CACHE["available"])


class FieldLabService:
    def __init__(self, db: Session, floci_endpoint: str = "http://localhost:4566"):
        self.db = db
        self.floci_endpoint = floci_endpoint
        self._floci_available = _floci_is_available(floci_endpoint)
        if self._floci_available:
            self._floci = FlociClient(
                endpoint_url=floci_endpoint,
                region=settings.AWS_REGION,
                access_key_id=settings.AWS_ACCESS_KEY_ID,
                secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
            self.resources = FlociResources(client=self._floci)
            self.sink = FlociEventSink(client=self._floci)
            self.store = FlociStateStore(client=self._floci)
            self.archive = FlociAuditArchive(client=self._floci)
            self.bus = FlociWorkflowBus(client=self._floci)

    def ensure_resources(self) -> list[dict]:
        if not self._floci_available:
            return [{"status": "skipped", "reason": "floci_unavailable"}]
        return self.resources.provision_all()

    def create_run(self, payload: dict) -> dict:
        run_id = f"flr_{uuid.uuid4().hex[:12]}"
        pack_id = payload.get("solution_pack_id", "")
        profile = payload.get("customer_profile", {})

        _MEMORY_STORE[run_id] = {
            "run_id": run_id,
            "pack_id": pack_id,
            "status": "created",
            "metadata": profile,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        if self._floci_available:
            try:
                self.ensure_resources()
                self.store.write_run_state(run_id, pack_id, "created", profile)
                self.bus.run_started(run_id, pack_id)
            except Exception:
                pass

        return {
            "run_id": run_id,
            "solution_pack_id": pack_id,
            "customer_profile": profile,
            "status": "created",
            "floci_endpoint": self.floci_endpoint,
            "started_at": None,
            "completed_at": None,
            "summary_json": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def list_runs(self) -> list[dict]:
        items = list(_MEMORY_STORE.values())
        if self._floci_available:
            try:
                dynamo_items = self.store.list_runs()
                items = [
                    {
                        "run_id": i["run_id"],
                        "pack_id": i.get("pack_id", ""),
                        "status": i.get("status", "unknown"),
                        "updated_at": i.get("updated_at", ""),
                        "metadata": i.get("metadata", {}),
                    }
                    for i in dynamo_items
                ]
            except Exception:
                pass
        return [
            {
                "run_id": item["run_id"],
                "solution_pack_id": item.get("pack_id", ""),
                "customer_profile": item.get("metadata", {}),
                "status": item.get("status", "unknown"),
                "floci_endpoint": self.floci_endpoint,
                "started_at": None,
                "completed_at": None,
                "summary_json": None,
                "created_at": item.get("updated_at", ""),
            }
            for item in items
        ]

    def get_run(self, run_id: str) -> dict:
        item = _MEMORY_STORE.get(run_id)
        if self._floci_available:
            try:
                dynamo_item = self.store.get_run_state(run_id)
                if dynamo_item:
                    item = dynamo_item
            except Exception:
                pass
        if item:
            return {
                "run_id": item["run_id"],
                "solution_pack_id": item.get("pack_id", ""),
                "customer_profile": item.get("metadata", {}),
                "status": item.get("status", "unknown"),
                "floci_endpoint": self.floci_endpoint,
                "started_at": item.get("updated_at", ""),
                "completed_at": None,
                "summary_json": None,
                "created_at": item.get("updated_at", ""),
            }
        return {
            "run_id": run_id,
            "solution_pack_id": "manufacturing-printer-gpo",
            "customer_profile": {},
            "status": "running",
            "floci_endpoint": self.floci_endpoint,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": None,
            "summary_json": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def ingest_events(self, run_id: str, events: list[dict]) -> dict:
        item = _MEMORY_STORE.get(run_id) or {}
        pack_id = item.get("pack_id", "")
        _MEMORY_STORE[run_id] = {
            **item,
            "status": "events_ingested",
            "metadata": {**item.get("metadata", {}), "event_count": len(events)},
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if self._floci_available:
            try:
                result = self.sink.ingest_solution_pack_events(run_id, pack_id, events)
                self.store.update_run_status(
                    run_id, "events_ingested", {"event_count": len(events)}
                )
                return result
            except Exception:
                pass
        return {
            "sqs": len(events),
            "s3": {"key": f"runs/{run_id}/events.jsonl"},
            "workflow": {"status": "simulated"},
        }

    def execute_run(self, run_id: str) -> dict:
        """Execute a FieldLab run, optionally using Lambda for production-grade compute.

        Args:
            run_id: FieldLab run identifier

        Returns:
            Dict containing run status, proof, and metadata
        """
        if settings.USE_LAMBDA_COMPUTE and self._floci_available:
            try:
                # Get run details
                item = _MEMORY_STORE.get(run_id, {})
                pack_id = item.get("pack_id", "")
                events = item.get("events", [])
                customer_context = item.get("customer_context", "")
                scenario_context = item.get("scenario_context")
                roi_model = item.get("roi_model")

                # Invoke Lambda for proof computation
                import os
                import sys

                # Import Lambda handler module
                sys.path.insert(
                    0, os.path.join(os.path.dirname(__file__), "..", "..", "packages", "fieldlab")
                )
                from lambda_handler import lambda_handler

                # Prepare Lambda event
                lambda_event = {
                    "pack_id": pack_id,
                    "events": events,
                    "customer_context": customer_context,
                    "scenario_context": scenario_context,
                    "roi_model": roi_model,
                    "run_id": run_id,
                    "action_status": item.get("action_status", "approved"),
                    "action_actor": item.get("action_actor", "operator"),
                }

                # Call Lambda handler (context is unused for local execution)
                result = lambda_handler(lambda_event, None)
                proof = json.loads(result["body"])

                item = _MEMORY_STORE.get(run_id, {})
                _MEMORY_STORE[run_id] = {
                    **item,
                    "status": "executed",
                    "metadata": {
                        **item.get("metadata", {}),
                        "priority_score": proof["decision"]["priority_score"],
                        "evidence_trust": proof["evidence"]["evidence_trust"],
                        "estimated_annual_value": proof["value_case"]["estimated_annual_value"],
                        "proof_hash": proof["proof_hash"],
                    },
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }

                # Log to CloudWatch
                if hasattr(self, "cw"):
                    self.cw.log_metric("lambda_compute_success", 1.0)

                return {
                    "run_id": run_id,
                    "status": "executed",
                    "proof": proof,
                    "decisions_generated": 1,
                    "priority_score": proof["decision"]["priority_score"],
                    "evidence_trust": proof["evidence"]["evidence_trust"],
                    "root_cause_hypothesis": proof["decision"]["root_cause_hypothesis"],
                    "ontology_objects": proof["ontology"]["objects_created"],
                    "actions_captured": 1,
                    "action_mode": proof["action"]["mode"],
                    "estimated_annual_value": proof["value_case"]["estimated_annual_value"],
                }
            except Exception:
                pass

        # Fallback to local FastAPI compute
        proof = self._build_run_proof(run_id)
        item = _MEMORY_STORE.get(run_id, {})
        _MEMORY_STORE[run_id] = {
            **item,
            "status": "executed",
            "metadata": {
                **item.get("metadata", {}),
                "priority_score": proof["decision"]["priority_score"],
                "evidence_trust": proof["evidence"]["evidence_trust"],
                "estimated_annual_value": proof["value_case"]["estimated_annual_value"],
                "proof_hash": proof["proof_hash"],
            },
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if self._floci_available:
            try:
                self.store.update_run_status(
                    run_id,
                    "executed",
                    {
                        "priority_score": proof["decision"]["priority_score"],
                        "evidence_trust": proof["evidence"]["evidence_trust"],
                        "estimated_annual_value": proof["value_case"]["estimated_annual_value"],
                        "proof_hash": proof["proof_hash"],
                    },
                )
            except Exception:
                pass
        return {
            "run_id": run_id,
            "status": "executed",
            "proof": proof,
            "decisions_generated": 1,
            "priority_score": proof["decision"]["priority_score"],
            "evidence_trust": proof["evidence"]["evidence_trust"],
            "root_cause_hypothesis": proof["decision"]["root_cause_hypothesis"],
            "ontology_objects": proof["ontology"]["objects_created"],
            "actions_captured": 1,
            "action_mode": proof["action"]["mode"],
            "estimated_annual_value": proof["value_case"]["estimated_annual_value"],
        }

    def get_run_events(self, run_id: str) -> dict:
        proof = self._build_run_proof(run_id)
        item = _MEMORY_STORE.get(run_id, {})
        metadata = item.get("metadata", {})
        status = item.get("status", "computed") if item else "computed"
        events = [
            {
                "event_type": "FieldLabRunStarted",
                "status": "complete",
                "actor": "system",
                "proof_impact": "run_id",
            },
            {
                "event_type": "FieldLabRunEventsIngested",
                "status": "complete",
                "actor": "fieldlab",
                "proof_impact": f"{proof['evidence']['raw_events']} raw events",
            },
            {
                "event_type": "DecisionGenerated",
                "status": "complete",
                "actor": "praxis-decision-engine",
                "proof_impact": proof["decision"]["priority_score"],
            },
            {
                "event_type": "ActionCaptured",
                "status": proof["action"]["status"],
                "actor": proof["action"]["actor"],
                "proof_impact": proof["action"]["action_log_hash"],
            },
            {
                "event_type": "ValueCaseReady",
                "status": "complete",
                "actor": "roi-calculator",
                "proof_impact": proof["value_case"]["estimated_annual_value"],
            },
            {
                "event_type": "FieldLabRunCompleted",
                "status": status,
                "actor": "fieldlab",
                "proof_impact": proof["proof_hash"],
            },
        ]
        return {
            "run_id": run_id,
            "solution_pack_id": proof["solution_pack"],
            "status": status,
            "metadata": metadata,
            "events": events,
        }

    def capture_action(self, run_id: str, action: dict) -> dict:
        captured = {
            "action": action.get("action", "approve_remediation"),
            "status": action.get("status", "approved"),
            "actor": action.get("actor", "operator"),
            "note": action.get("note", ""),
            "captured_at": datetime.now(timezone.utc).isoformat(),
        }
        _MEMORY_ACTIONS[run_id] = captured
        item = _MEMORY_STORE.get(run_id, {})
        metadata = {**item.get("metadata", {}), "captured_action": captured}
        _MEMORY_STORE[run_id] = {
            **item,
            "status": "action_captured",
            "metadata": metadata,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if self._floci_available:
            try:
                self.store.update_run_status(run_id, "action_captured", metadata)
            except Exception:
                pass
        proof = self._build_run_proof(run_id)
        return {
            "run_id": run_id,
            "status": "action_captured",
            "action": proof["action"],
            "proof_hash": proof["proof_hash"],
        }

    def get_replay(self, run_id: str) -> dict:
        if self._floci_available:
            try:
                replay = self.archive.get_proof(run_id)
                return {
                    "run_id": run_id,
                    "decisions": [],
                    "events": [],
                    "replayed_at": datetime.now(timezone.utc).isoformat(),
                    "proof_available": replay is not None,
                }
            except Exception:
                pass
        return {
            "run_id": run_id,
            "decisions": [],
            "events": [],
            "replayed_at": datetime.now(timezone.utc).isoformat(),
            "proof_available": False,
        }

    def get_executive_readout(self, run_id: str) -> dict:
        proof = self._build_run_proof(run_id)
        pack_id = proof["solution_pack"]
        scenario = PraxisProofBuilder().load_pack_context(
            ProofInputs(solution_pack=pack_id, events=[])
        )[0]
        expansions = proof.get("expansion") or ExpansionGraph().top_expansions(pack_id)
        return {
            "run_id": run_id,
            "solution_pack_id": pack_id,
            "incident_summary": {
                "incident_id": proof["proof_id"],
                "primary_impact": scenario.get("primary_pain", ""),
                "root_cause_hypothesis": proof["decision"]["root_cause_hypothesis"],
                "recommended_action": proof["action"]["recommended_action"],
            },
            "evidence_trust": proof["evidence"]["evidence_trust"],
            "estimated_annual_value": proof["value_case"]["estimated_annual_value"],
            "expansion_opportunities": [item["name"] for item in expansions],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def emit_proof(self, run_id: str, proof: dict) -> dict:
        if self._floci_available:
            try:
                result = self.archive.store_proof(run_id, proof)
                pack_id = proof.get("solution_pack", "")
                proof_hash = proof.get("proof_hash", "")
                self.bus.run_completed(run_id, pack_id, proof_hash)
                self.store.update_run_status(run_id, "proof_emitted", {"proof_hash": proof_hash})
                return result
            except Exception:
                pass
        return {"run_id": run_id, "status": "proof_emitted", "stored": "memory_only"}

    def _build_run_proof(self, run_id: str) -> dict:
        item = _MEMORY_STORE.get(run_id, {})
        pack_id = item.get("pack_id", "manufacturing-printer-gpo")
        metadata = item.get("metadata", {})
        captured_action = _MEMORY_ACTIONS.get(run_id, metadata.get("captured_action", {}))
        events = self._load_pack_events(pack_id)
        customer_context = self._load_customer_context(pack_id)
        return PraxisProofBuilder().build(
            ProofInputs(
                solution_pack=pack_id,
                events=events,
                customer_context=customer_context,
                run_id=run_id,
                action_status=captured_action.get("status", "approved"),
                action_actor=captured_action.get("actor", "operator"),
            )
        )

    def _load_pack_events(self, pack_id: str) -> list[dict]:
        events_path = ROOT / "solution-packs" / pack_id / "sample-events.jsonl"
        if not events_path.is_file():
            return []
        return [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()]

    def _load_customer_context(self, pack_id: str) -> str:
        context_path = ROOT / "solution-packs" / pack_id / "customer-context.md"
        return context_path.read_text() if context_path.is_file() else ""
