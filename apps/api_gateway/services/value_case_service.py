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

from infrastructure.db.models.value_case import ValueCase  # noqa: E402

PACKS_DIR = ROOT / "solution-packs"
DEMO_PACK_IDS = [
    "manufacturing-printer-gpo",
    "network-edge-failover",
    "identity-onboarding-drift",
    "database-failover-lag",
]
DEFAULT_PACK = DEMO_PACK_IDS[0]


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


def _row_to_record(row: ValueCase) -> dict:
    return {
        "value_case_id": row.value_case_id,
        "solution_pack_id": row.solution_pack_id,
        "customer_context_json": row.customer_context_json or {},
        "assumptions_json": row.assumptions_json or {},
        "formulas_json": row.formulas_json or {},
        "estimated_annual_value": row.estimated_annual_value,
        "confidence": row.confidence,
        "evidence_refs_json": row.evidence_refs_json or [],
    }


def _record_from_compute(value_case_id: str, solution_pack: str, computed: dict) -> dict:
    return {
        "value_case_id": value_case_id,
        "solution_pack_id": solution_pack,
        "customer_context_json": {
            "scenario": computed["scenario"].get("name", solution_pack.replace("-", " ")),
            "economic_buyer": computed["scenario"].get("economic_buyer", "Operations leadership"),
        },
        "assumptions_json": computed["variables"],
        "formulas_json": computed["roi_model"].get("formulas", {}),
        "estimated_annual_value": computed["estimated_annual_value"],
        "confidence": computed["confidence"],
        "evidence_refs_json": [
            f"proof://{solution_pack}/roi-model",
            f"proof://{solution_pack}/sample-events",
        ],
    }


def _pack_for_value_case_id(value_case_id: str) -> str:
    for pack_id in DEMO_PACK_IDS:
        if pack_id in value_case_id:
            return pack_id
    return DEFAULT_PACK


class ValueCaseService:
    """Durable value-case store backed by the `value_cases` table.

    Deterministic demo cases are seeded into the database on first use so the
    demo journey stays populated, while created/recalculated cases persist
    across process restarts instead of living in process memory.
    """

    def __init__(self, db: Session):
        self.db = db
        self._seed_value_cases()

    def _seed_value_cases(self) -> None:
        seeded = False
        for pack_id in DEMO_PACK_IDS:
            vc_id = f"vc_demo_{pack_id}"
            if self.db.query(ValueCase).filter_by(value_case_id=vc_id).first():
                continue
            computed = _compute(pack_id)
            self._persist(_record_from_compute(vc_id, pack_id, computed))
            seeded = True
        if seeded:
            self.db.commit()

    def _persist(self, record: dict) -> ValueCase:
        row = self.db.query(ValueCase).filter_by(value_case_id=record["value_case_id"]).first()
        if row is None:
            row = ValueCase(value_case_id=record["value_case_id"])
            self.db.add(row)
        row.solution_pack_id = record["solution_pack_id"]
        row.customer_context_json = record["customer_context_json"]
        row.assumptions_json = record["assumptions_json"]
        row.formulas_json = record["formulas_json"]
        row.estimated_annual_value = record["estimated_annual_value"]
        row.confidence = record["confidence"]
        row.evidence_refs_json = record["evidence_refs_json"]
        return row

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
        }
        self._persist(record)
        self.db.commit()
        return record

    def get_value_case(self, value_case_id: str) -> dict:
        row = self.db.query(ValueCase).filter_by(value_case_id=value_case_id).first()
        if row is not None:
            return _row_to_record(row)

        pack_id = _pack_for_value_case_id(value_case_id)
        computed = _compute(pack_id)
        record = _record_from_compute(value_case_id, pack_id, computed)
        self._persist(record)
        self.db.commit()
        return record

    def recalculate(self, value_case_id: str) -> dict:
        row = self.db.query(ValueCase).filter_by(value_case_id=value_case_id).first()
        solution_pack = row.solution_pack_id if row else _pack_for_value_case_id(value_case_id)
        computed = _compute(solution_pack)

        if row is None:
            record = _record_from_compute(value_case_id, solution_pack, computed)
            row = self._persist(record)
        else:
            row.estimated_annual_value = computed["estimated_annual_value"]
            row.confidence = computed["confidence"]
            row.assumptions_json = computed["variables"]
        self.db.commit()

        return {
            "value_case_id": value_case_id,
            "estimated_annual_value": computed["estimated_annual_value"],
            "confidence": computed["confidence"],
            "updated_at": datetime.utcnow().isoformat(),
        }

    def get_executive_summary(self, value_case_id: str) -> dict:
        row = self.db.query(ValueCase).filter_by(value_case_id=value_case_id).first()
        solution_pack = row.solution_pack_id if row else _pack_for_value_case_id(value_case_id)
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

        recommendations = scenario.get(
            "recommended_actions",
            [
                "Validate root cause hypothesis",
                "Review ontology coverage",
                "Confirm human-approval action",
            ],
        )

        return {
            "value_case_id": value_case_id,
            "solution_pack_id": solution_pack,
            "headline": headline,
            "estimated_annual_value": computed["estimated_annual_value"],
            "key_metrics": key_metrics,
            "recommendations": recommendations,
            "expansion_opportunities": computed["expansion_opportunities"],
        }
