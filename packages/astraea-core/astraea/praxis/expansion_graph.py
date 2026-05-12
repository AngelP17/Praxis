class ExpansionGraph:
    WEIGHTS = {
        "shared_data_model": 0.25,
        "stakeholder_overlap": 0.20,
        "measurable_value": 0.20,
        "implementation_reuse": 0.15,
        "urgency": 0.10,
        "executive_visibility": 0.10,
    }

    ADJACENT_USE_CASES = {
        "manufacturing-printer-gpo": [
            {
                "id": "asset-inventory-accuracy",
                "name": "Asset Inventory Accuracy",
                "shared_data_model": 0.90,
                "stakeholder_overlap": 0.70,
                "measurable_value": 0.65,
                "implementation_reuse": 0.80,
                "urgency": 0.50,
                "executive_visibility": 0.60,
            },
            {
                "id": "vendor-sla-tracking",
                "name": "Vendor SLA Tracking",
                "shared_data_model": 0.70,
                "stakeholder_overlap": 0.75,
                "measurable_value": 0.60,
                "implementation_reuse": 0.60,
                "urgency": 0.55,
                "executive_visibility": 0.65,
            },
            {
                "id": "ticket-routing",
                "name": "Intelligent Ticket Routing",
                "shared_data_model": 0.80,
                "stakeholder_overlap": 0.65,
                "measurable_value": 0.70,
                "implementation_reuse": 0.75,
                "urgency": 0.60,
                "executive_visibility": 0.55,
            },
            {
                "id": "erp-access-incidents",
                "name": "ERP Access Incidents",
                "shared_data_model": 0.60,
                "stakeholder_overlap": 0.80,
                "measurable_value": 0.75,
                "implementation_reuse": 0.50,
                "urgency": 0.65,
                "executive_visibility": 0.70,
            },
            {
                "id": "endpoint-configuration-drift",
                "name": "Endpoint Configuration Drift",
                "shared_data_model": 0.85,
                "stakeholder_overlap": 0.65,
                "measurable_value": 0.55,
                "implementation_reuse": 0.85,
                "urgency": 0.45,
                "executive_visibility": 0.50,
            },
        ],
    }

    def score_adjacent(self, pack_id: str) -> list[dict]:
        adjacent = self.ADJACENT_USE_CASES.get(pack_id, [])
        results = []
        for case in adjacent:
            score = sum(self.WEIGHTS[k] * case.get(k, 0.5) for k in self.WEIGHTS)
            results.append(
                {
                    "id": case["id"],
                    "name": case["name"],
                    "expansion_score": round(score, 4),
                    "factors": {k: case.get(k, 0.5) for k in self.WEIGHTS},
                }
            )
        results.sort(key=lambda x: x["expansion_score"], reverse=True)
        return results

    def top_expansions(self, pack_id: str, limit: int = 3) -> list[dict]:
        return self.score_adjacent(pack_id)[:limit]
