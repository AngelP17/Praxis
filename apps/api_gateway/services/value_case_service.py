from __future__ import annotations

import sys
import uuid
import yaml
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "packages" / "astraea-core"))

from astraea.praxis.roi_calculator import RoiCalculator  # noqa: E402
from astraea.praxis.use_case_score import UseCaseScorer  # noqa: E402
from astraea.praxis.expansion_graph import ExpansionGraph  # noqa: E402

PACKS_DIR = ROOT / "solution-packs"
DEFAULT_PACK = "manufacturing-printer-gpo"

# In-process store for created value cases (keyed by value_case_id)
_STORE: dict[str, dict] = {}


def _load_pack_context(solution_pack: str) -> tuple[dict, dict]:
    pack_dir = PACKS_DIR / solution_pack
    scenario: dict = {}
    roi_model: dict = {}
    scenario_path = pack_dir / "scenario.yaml"
    roi_path = pack_dir / "roi-model.yaml"
    if scenario_path.is_file():
        scenario = yaml.safe_load(scenario_path.read_text()) or {}
    if roi_path.is_file():
        roi_model = yaml.safe_load(roi_path.read_text()) or {}
    return scenario, roi_model


def _compute(solution_pack: str) -> dict:
    scenario, roi_model = _load_pack_context(solution_pack)
    roi = RoiCalculator().calculate(roi_model)

    use_case = {
        "pain_intensity": scenario.get("pain_intensity", 0.72),
        "data_readiness": scenario.get("data_readiness", 0.75),
        "stakeholder_urgency": 0.72 if scenario.get("economic_buyer") else 0.5,
        "workflow_writeback_potential": scenario.get("workflow_writeback_potential", 0.65),
        "measurable_value": scenario.get("measurable_value", 0.80),
        "deployability": scenario.get("deployability", 0.70),
        "security_feasibility": scenario.get("security_feasibility", 0.80),
        "expansion_leverage": scenario.get("expansion_leverage", 0.60),
        "differentiation": scenario.get("differentiation", 0.75),
    }
    scored = UseCaseScorer().score(use_case)
    expansions = ExpansionGraph().top_expansions(solution_pack, limit=3)

    return {
        "solution_pack_id": solution_pack,
        "scenario": scenario,
        "roi_model": roi_model,
        "estimated_annual_value": roi["estimated_annual_value"],
        "calculations": roi["calculations"],
        "variables": roi["variables"],
        "confidence": round(scored["score"], 2),
        "score_bucket": scored["bucket"],
        "expansion_opportunities": [e["name"] for e in expansions],
    }


class ValueCaseService:
    def __init__(self, db: Session):
        self.db = db

    def create_value_case(self, payload: dict) -> dict:
        solution_pack = payload.get("solution_pack_id", DEFAULT_PACK)
        computed = _compute(solution_pack)

        # Override variables with caller-supplied assumptions when provided
        assumptions = payload.get("assumptions_json") or {}
        formulas = payload.get("formulas_json") or {}
        if assumptions or formulas:
            roi_model = computed["roi_model"].copy()
            roi_model.setdefault("variables", {}).update(assumptions)
            if formulas:
                roi_model["formulas"] = formulas
            roi = RoiCalculator().calculate(roi_model)
            computed["estimated_annual_value"] = roi["estimated_annual_value"]
            computed["calculations"] = roi["calculations"]
            computed["variables"] = roi["variables"]

        value_case_id = f"vc_{uuid.uuid4().hex[:12]}"
        record = {
            "value_case_id": value_case_id,
            "solution_pack_id": solution_pack,
            "customer_context_json": payload.get("customer_context_json", {}),
            "assumptions_json": computed["variables"],
            "formulas_json": formulas,
            "estimated_annual_value": computed["estimated_annual_value"],
            "confidence": computed["confidence"],
            "evidence_refs_json": [],
            "_computed": computed,
        }
        _STORE[value_case_id] = record
        return {k: v for k, v in record.items() if not k.startswith("_")}

    def get_value_case(self, value_case_id: str) -> dict:
        if value_case_id in _STORE:
            record = _STORE[value_case_id]
            return {k: v for k, v in record.items() if not k.startswith("_")}

        # Reconstruct from default pack (no persistent DB)
        computed = _compute(DEFAULT_PACK)
        return {
            "value_case_id": value_case_id,
            "solution_pack_id": DEFAULT_PACK,
            "customer_context_json": {},
            "assumptions_json": computed["variables"],
            "formulas_json": {},
            "estimated_annual_value": computed["estimated_annual_value"],
            "confidence": computed["confidence"],
            "evidence_refs_json": [],
        }

    def recalculate(self, value_case_id: str) -> dict:
        record = _STORE.get(value_case_id)
        solution_pack = record["solution_pack_id"] if record else DEFAULT_PACK
        computed = _compute(solution_pack)

        if record:
            record["estimated_annual_value"] = computed["estimated_annual_value"]
            record["confidence"] = computed["confidence"]
            record["_computed"] = computed

        return {
            "value_case_id": value_case_id,
            "estimated_annual_value": computed["estimated_annual_value"],
            "confidence": computed["confidence"],
            "updated_at": datetime.utcnow().isoformat(),
        }

    def get_executive_summary(self, value_case_id: str) -> dict:
        record = _STORE.get(value_case_id)
        solution_pack = record["solution_pack_id"] if record else DEFAULT_PACK
        computed = _compute(solution_pack)
        scenario = computed["scenario"]
        calcs = computed["calculations"]

        headline = scenario.get(
            "headline",
            f"Automated triage for {solution_pack.replace('-', ' ')} incidents reduces cost and delay",
        )

        key_metrics: dict = {}
        variables = computed["variables"]
        if "incidents_per_month" in variables:
            key_metrics["incidents_per_month"] = int(variables["incidents_per_month"])
        if "average_minutes_lost_per_incident" in variables:
            key_metrics["avg_minutes_lost"] = int(variables["average_minutes_lost_per_incident"])
        if "monthly_labor_cost_saved" in calcs:
            key_metrics["monthly_labor_saved"] = calcs["monthly_labor_cost_saved"]
        if "monthly_delay_cost_avoided" in calcs:
            key_metrics["monthly_delay_avoided"] = calcs["monthly_delay_cost_avoided"]

        recommendations = scenario.get("recommended_actions", [
            "Validate root cause hypothesis",
            "Review ontology coverage",
            "Confirm human-approval action",
        ])

        return {
            "value_case_id": value_case_id,
            "solution_pack_id": solution_pack,
            "headline": headline,
            "estimated_annual_value": computed["estimated_annual_value"],
            "key_metrics": key_metrics,
            "recommendations": recommendations,
            "expansion_opportunities": computed["expansion_opportunities"],
        }
