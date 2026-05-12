import uuid
from datetime import datetime
from sqlalchemy.orm import Session


class ValueCaseService:
    def __init__(self, db: Session):
        self.db = db

    def create_value_case(self, payload: dict) -> dict:
        value_case_id = f"vc_{uuid.uuid4().hex[:12]}"
        formulas = payload.get("formulas_json", {})
        assumptions = payload.get("assumptions_json", {})

        estimated_annual_value = self._calculate_annual_value(formulas, assumptions)

        return {
            "value_case_id": value_case_id,
            "solution_pack_id": payload.get("solution_pack_id", ""),
            "customer_context_json": payload.get("customer_context_json", {}),
            "assumptions_json": assumptions,
            "formulas_json": formulas,
            "estimated_annual_value": estimated_annual_value,
            "confidence": 0.75,
            "evidence_refs_json": [],
        }

    def get_value_case(self, value_case_id: str) -> dict:
        return {
            "value_case_id": value_case_id,
            "solution_pack_id": "manufacturing-printer-gpo",
            "customer_context_json": {},
            "assumptions_json": {
                "incidents_per_month": 12,
                "loaded_labor_rate_per_hour": 48,
                "shipment_delay_cost_per_hour": 250,
            },
            "formulas_json": {},
            "estimated_annual_value": 38400.0,
            "confidence": 0.75,
            "evidence_refs_json": [],
        }

    def recalculate(self, value_case_id: str) -> dict:
        return {
            "value_case_id": value_case_id,
            "estimated_annual_value": 38400.0,
            "confidence": 0.82,
            "updated_at": datetime.utcnow().isoformat(),
        }

    def get_executive_summary(self, value_case_id: str) -> dict:
        return {
            "value_case_id": value_case_id,
            "solution_pack_id": "manufacturing-printer-gpo",
            "headline": "Standardizing printer deployment governance reduces shipping delays and support costs",
            "estimated_annual_value": 38400.0,
            "key_metrics": {
                "incidents_per_month": 12,
                "avg_minutes_lost": 35,
                "monthly_labor_saved": 316.80,
                "monthly_delay_avoided": 1750.00,
            },
            "recommendations": [
                "Validate Point and Print policy",
                "Audit GPO read permissions",
                "Monitor local IP printer drift",
            ],
            "expansion_opportunities": [
                "Asset governance",
                "Vendor SLA tracking",
                "Endpoint configuration drift",
            ],
        }

    def _calculate_annual_value(self, formulas: dict, assumptions: dict) -> float:
        defaults = {
            "incidents_per_month": 12,
            "average_minutes_lost_per_incident": 35,
            "loaded_labor_rate_per_hour": 48,
            "shipment_delay_cost_per_hour": 250,
            "current_triage_minutes": 45,
            "praxis_triage_minutes": 12,
        }
        params = {**defaults, **assumptions}

        monthly_labor = (
            params["incidents_per_month"]
            * ((params["current_triage_minutes"] - params["praxis_triage_minutes"]) / 60)
            * params["loaded_labor_rate_per_hour"]
        )
        monthly_delay = (
            params["incidents_per_month"]
            * (params["average_minutes_lost_per_incident"] / 60)
            * params["shipment_delay_cost_per_hour"]
        )
        return round(12 * (monthly_labor + monthly_delay), 2)
