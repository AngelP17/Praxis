from sqlalchemy.orm import Session
from apps.api_gateway.services.ontology_service import OntologyService


class DiscoveryService:
    def __init__(self, db: Session):
        self.db = db

    def discover(self, payload: dict) -> dict:
        signals = payload.get("customer_signals", [])
        adapter = payload.get("adapter_profile", "generic")
        context = payload.get("customer_context", {})

        onto_svc = OntologyService(self.db)
        onto_result = onto_svc.compile_ontology(
            {
                "records": signals,
                "adapter_profile": adapter,
                "customer_context": context,
            }
        )

        questions = self._generate_questions(signals, context)

        return {
            "object_candidates": onto_result.get("object_types", []),
            "inferred_links": onto_result.get("links", []),
            "mapping_confidence": onto_result.get("confidence", 0.5),
            "next_best_questions": questions,
            "recommended_solution_pack": self._recommend_pack(signals, context),
        }

    def _generate_questions(self, signals: list[dict], context: dict) -> list[dict]:
        questions = []
        if not any("downtime" in str(s).lower() for s in signals):
            questions.append(
                {
                    "field": "downtime_minutes",
                    "question": "How many production minutes were lost or delayed?",
                    "reason": "Highest impact on ROI and severity score",
                    "expected_confidence_gain": 0.18,
                }
            )
        if not any("owner" in str(s).lower() for s in signals):
            questions.append(
                {
                    "field": "asset_owner",
                    "question": "Who owns the affected asset or system?",
                    "reason": "Required for routing and implementation plan",
                    "expected_confidence_gain": 0.11,
                }
            )
        if not questions:
            questions.append(
                {
                    "field": "business_impact",
                    "question": "What business process was affected?",
                    "reason": "Required for value case calculation",
                    "expected_confidence_gain": 0.14,
                }
            )
        return questions

    def _recommend_pack(self, signals: list[dict], context: dict) -> str:
        signal_text = " ".join(str(s).lower() for s in signals)
        if "printer" in signal_text or "print" in signal_text:
            return "manufacturing-printer-gpo"
        if (
            "network" in signal_text
            or "wan" in signal_text
            or "isp" in signal_text
            or "starlink" in signal_text
            or "failover" in signal_text
        ):
            return "network-edge-failover"
        if (
            "identity" in signal_text
            or "onboarding" in signal_text
            or "iam" in signal_text
            or "gpo" in signal_text
            or "access" in signal_text
            or "erp" in signal_text
        ):
            return "identity-onboarding-drift"
        if (
            "database" in signal_text
            or "db" in signal_text
            or "replica" in signal_text
            or "replication" in signal_text
            or "lag" in signal_text
        ):
            return "database-failover-lag"
        return "unknown"
