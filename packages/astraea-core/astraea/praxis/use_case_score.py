class UseCaseScorer:
    WEIGHTS = {
        "pain_intensity": 0.18,
        "data_readiness": 0.15,
        "stakeholder_urgency": 0.14,
        "workflow_writeback_potential": 0.13,
        "measurable_value": 0.12,
        "deployability": 0.10,
        "security_feasibility": 0.08,
        "expansion_leverage": 0.05,
        "differentiation": 0.05,
    }

    def score(self, use_case: dict, customer_context: dict = None) -> dict:
        values = {
            "pain_intensity": use_case.get("pain_intensity", 0.5),
            "data_readiness": use_case.get("data_readiness", 0.5),
            "stakeholder_urgency": use_case.get("stakeholder_urgency", 0.5),
            "workflow_writeback_potential": use_case.get("workflow_writeback_potential", 0.5),
            "measurable_value": use_case.get("measurable_value", 0.5),
            "deployability": use_case.get("deployability", 0.5),
            "security_feasibility": use_case.get("security_feasibility", 0.5),
            "expansion_leverage": use_case.get("expansion_leverage", 0.5),
            "differentiation": use_case.get("differentiation", 0.5),
        }

        total = sum(self.WEIGHTS[k] * values[k] for k in self.WEIGHTS)
        total = round(total, 4)

        return {
            "score": total,
            "bucket": self._bucket(total),
            "factors": values,
        }

    def _bucket(self, score: float) -> str:
        if score >= 0.80:
            return "pilot now"
        if score >= 0.65:
            return "demo and scope"
        if score >= 0.45:
            return "discovery required"
        return "disqualify or defer"
