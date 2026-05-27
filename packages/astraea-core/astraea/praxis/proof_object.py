"""Praxis proof object construction.

A proof object connects raw field evidence to ontology mapping, decision output,
human action, replay verification, and value case. It is deliberately deterministic
so the same solution pack inputs produce the same proof hash.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

from .expansion_graph import ExpansionGraph
from .feature_extractor import EventFeatureExtractor
from .intervention_planner import InterventionPlanner
from .ontology_compiler import OntologyCompiler
from .praxis_decision_engine import PraxisDecisionEngine
from .proof_hash import proof_hash, sha256_digest
from .proof_schema import validate_proof_schema
from .roi_calculator import RoiCalculator
from .signing import load_signing_key, sign_proof
from .use_case_score import UseCaseScorer

DEFAULT_VERIFIED_AT = "2026-05-12T00:00:00Z"
ROOT = Path(__file__).resolve().parents[4]


@dataclass(frozen=True)
class ProofInputs:
    solution_pack: str
    events: list[dict[str, Any]]
    customer_context: str = ""
    run_id: str | None = None
    generated_at: str | None = None
    scenario_context: dict[str, Any] | None = None
    roi_model: dict[str, Any] | None = None
    action_status: str = "approved"
    action_actor: str = "operator"


class PraxisProofBuilder:
    """Build canonical Praxis proof objects from solution-pack demo inputs."""

    def build(
        self,
        inputs: ProofInputs,
        sign: bool = False,
        signing_key_path: str | None = None,
    ) -> dict[str, Any]:
        generated_at = inputs.generated_at or DEFAULT_VERIFIED_AT
        run_id = inputs.run_id or f"fieldlab_run_{inputs.solution_pack.replace('-', '_')}"
        run_id = run_id.replace("-", "_")
        scenario_context, roi_model = self.load_pack_context(inputs)
        extractor = EventFeatureExtractor()
        features = extractor.extract(inputs.events, scenario_context)
        ontology = OntologyCompiler().compile(inputs.events, "solution_pack", scenario_context)
        sources = sorted({str(event.get("source", "unknown")) for event in inputs.events})
        customer_context = self._decision_context(scenario_context, inputs.customer_context)
        decision = PraxisDecisionEngine().score(features, ontology, customer_context)
        roi = RoiCalculator().calculate(roi_model)
        use_case_result = UseCaseScorer().score(features.get("use_case", {}), customer_context)
        expansion = ExpansionGraph().top_expansions(inputs.solution_pack, limit=3)
        action_plan = InterventionPlanner().plan_action(
            features["recommended_action"], features.get("asset_id") or None
        )
        action_log = {
            "recommended_action": action_plan["action_type"],
            "mode": str(action_plan["mode"]).lower(),
            "actor": inputs.action_actor,
            "status": str(inputs.action_status).lower(),
            "run_id": run_id,
            "risk": action_plan["risk"],
            "rollback": action_plan["rollback"],
        }
        value_case = {
            "estimated_annual_value": roi["estimated_annual_value"],
            "confidence": use_case_result["score"],
            "bucket": use_case_result["bucket"],
            "primary_value_driver": self._primary_value_driver(scenario_context),
            "roi_calculations": roi["calculations"],
        }
        replay_payload = {
            "events": inputs.events,
            "ontology": ontology,
            "decision": {
                "root_cause_hypothesis": features["root_cause_hypothesis"],
                "priority_score": decision.priority_score,
                "evidence_trust": decision.evidence_trust,
            },
            "action": action_log,
            "value_case": value_case,
        }

        proof: dict[str, Any] = {
            "proof_id": f"proof_praxis_{inputs.solution_pack.replace('-', '_')}_001",
            "run_id": run_id,
            "solution_pack": inputs.solution_pack,
            "customer_context_hash": sha256_digest(inputs.customer_context),
            "evidence": {
                "raw_events": len(inputs.events),
                "sources": sources,
                "source_coverage": round(min(len(sources) / 7, 1.0), 2),
                "corroboration_score": features["corroboration"],
                "freshness_score": features["freshness"],
                "evidence_trust": decision.evidence_trust,
            },
            "ontology": {
                "objects_created": ontology.get("object_count", 0),
                "links_created": len(ontology.get("links", [])),
                "actions_available": len(ontology.get("actions", [])),
                "mapping_confidence": ontology.get("confidence", 0.0),
            },
            "decision": {
                "root_cause_hypothesis": features["root_cause_hypothesis"],
                "priority_score": decision.priority_score,
                "confidence": decision.confidence,
                "requires_human_review": decision.requires_human_review,
                "next_best_questions": [
                    (q.get("question") if isinstance(q, dict) else getattr(q, "question", str(q)))
                    for q in (decision.next_best_questions or [])
                ],
                "signals": {
                    key: features[key]
                    for key in [
                        "severity_score",
                        "business_process_criticality",
                        "customer_visible_impact",
                        "recurrence_risk",
                        "sla_exposure",
                        "actionability",
                    ]
                },
            },
            "action": {
                **action_log,
                "action_log_hash": sha256_digest(action_log),
            },
            "value_case": value_case,
            "expansion": expansion,
            "replay": {
                "replay_hash": sha256_digest(replay_payload),
                "deterministic": True,
                "verified_at": generated_at,
            },
            "generated_at": generated_at,
        }
        proof["proof_hash"] = proof_hash(proof)

        if sign:
            key = load_signing_key(signing_key_path)
            if key:
                proof = sign_proof(proof, key)

        validate_proof_schema(proof)
        return proof

    def load_pack_context(self, inputs: ProofInputs) -> tuple[dict[str, Any], dict[str, Any]]:
        pack_dir = ROOT / "solution-packs" / inputs.solution_pack
        scenario = inputs.scenario_context
        roi_model = inputs.roi_model

        if scenario is None:
            scenario = self._load_yaml(pack_dir / "scenario.yaml")
        if roi_model is None:
            roi_model = self._load_yaml(pack_dir / "roi-model.yaml")
        return scenario or {}, roi_model or {}

    def _load_yaml(self, path: Path) -> dict[str, Any]:
        if not path.is_file():
            return {}
        with path.open() as handle:
            return yaml.safe_load(handle) or {}

    def _decision_context(
        self, scenario_context: dict[str, Any], customer_context: str
    ) -> dict[str, Any]:
        return {
            "stakeholder_urgency": 0.72 if scenario_context.get("economic_buyer") else 0.5,
            "industry": scenario_context.get("industry", ""),
            "buyer_persona": scenario_context.get("buyer_persona", ""),
            "technical_persona": scenario_context.get("technical_persona", ""),
            "context_length": len(customer_context or ""),
        }

    def _primary_value_driver(self, scenario_context: dict[str, Any]) -> str:
        outcome = scenario_context.get("target_outcome")
        if outcome:
            return str(outcome)
        return "reduced operational delay"
