import json
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
from astraea.praxis import ExpansionGraph, PraxisProofBuilder, ProofInputs


ROOT = Path(__file__).resolve().parents[3]


class FieldLabService:
    def __init__(self, db: Session, floci_endpoint: str = "http://localhost:4566"):
        self.db = db
        self.floci = FlociClient(endpoint_url=floci_endpoint)
        self.resources = FlociResources(client=self.floci)
        self.sink = FlociEventSink(client=self.floci)
        self.store = FlociStateStore(client=self.floci)
        self.archive = FlociAuditArchive(client=self.floci)
        self.bus = FlociWorkflowBus(client=self.floci)

    def ensure_resources(self) -> list[dict]:
        """Idempotently provision Floci resources."""
        return self.resources.provision_all()

    def create_run(self, payload: dict) -> dict:
        run_id = f"flr_{uuid.uuid4().hex[:12]}"
        pack_id = payload.get("solution_pack_id", "")
        profile = payload.get("customer_profile", {})

        # Provision resources if not already present
        self.ensure_resources()

        # Write state to DynamoDB
        self.store.write_run_state(run_id, pack_id, "created", profile)

        # Emit workflow event
        self.bus.run_started(run_id, pack_id)

        return {
            "run_id": run_id,
            "solution_pack_id": pack_id,
            "customer_profile": profile,
            "status": "created",
            "floci_endpoint": self.floci.endpoint_url,
            "started_at": None,
            "completed_at": None,
            "summary_json": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def list_runs(self) -> list[dict]:
        items = self.store.list_runs()
        return [
            {
                "run_id": item["run_id"],
                "solution_pack_id": item.get("pack_id", ""),
                "status": item.get("status", "unknown"),
                "updated_at": item.get("updated_at", ""),
            }
            for item in items
        ]

    def get_run(self, run_id: str) -> dict:
        item = self.store.get_run_state(run_id)
        if item:
            return {
                "run_id": item["run_id"],
                "solution_pack_id": item.get("pack_id", ""),
                "customer_profile": item.get("metadata", {}),
                "status": item.get("status", "unknown"),
                "floci_endpoint": self.floci.endpoint_url,
                "started_at": item.get("updated_at", ""),
                "completed_at": None,
                "summary_json": None,
                "created_at": item.get("updated_at", ""),
            }
        # Fallback for runs not yet in DynamoDB
        return {
            "run_id": run_id,
            "solution_pack_id": "manufacturing-printer-gpo",
            "customer_profile": {},
            "status": "running",
            "floci_endpoint": self.floci.endpoint_url,
            "started_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": None,
            "summary_json": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    def ingest_events(self, run_id: str, events: list[dict]) -> dict:
        item = self.store.get_run_state(run_id)
        pack_id = item.get("pack_id", "") if item else ""

        result = self.sink.ingest_solution_pack_events(run_id, pack_id, events)
        self.store.update_run_status(run_id, "events_ingested", {"event_count": len(events)})
        return result

    def execute_run(self, run_id: str) -> dict:
        proof = self._build_run_proof(run_id)
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
        item = self.store.get_run_state(run_id)
        proof = self._build_run_proof(run_id)
        metadata = item.get("metadata", {}) if item else {}
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
        item = self.store.get_run_state(run_id)
        metadata = item.get("metadata", {}) if item else {}
        captured = {
            "action": action.get("action", "approve_remediation"),
            "status": action.get("status", "approved"),
            "actor": action.get("actor", "operator"),
            "note": action.get("note", ""),
            "captured_at": datetime.now(timezone.utc).isoformat(),
        }
        metadata["captured_action"] = captured
        self.store.update_run_status(run_id, "action_captured", metadata)
        proof = self._build_run_proof(run_id)
        return {
            "run_id": run_id,
            "status": "action_captured",
            "action": proof["action"],
            "proof_hash": proof["proof_hash"],
        }

    def get_replay(self, run_id: str) -> dict:
        replay = self.archive.get_proof(run_id)
        return {
            "run_id": run_id,
            "decisions": [],
            "events": [],
            "replayed_at": datetime.now(timezone.utc).isoformat(),
            "proof_available": replay is not None,
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
        """Store proof artifact to S3 and emit completion event."""
        result = self.archive.store_proof(run_id, proof)
        pack_id = proof.get("solution_pack", "")
        proof_hash = proof.get("proof_hash", "")
        self.bus.run_completed(run_id, pack_id, proof_hash)
        self.store.update_run_status(run_id, "proof_emitted", {"proof_hash": proof_hash})
        return result

    def _build_run_proof(self, run_id: str) -> dict:
        item = self.store.get_run_state(run_id)
        pack_id = (
            item.get("pack_id", "manufacturing-printer-gpo") if item else "manufacturing-printer-gpo"
        )
        metadata = item.get("metadata", {}) if item else {}
        captured_action = metadata.get("captured_action", {})
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
