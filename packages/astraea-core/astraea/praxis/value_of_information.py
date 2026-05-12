class ValueOfInformation:
    def rank(
        self, missing_fields: list[str], current_decision: dict, context: dict = None
    ) -> list[dict]:
        if context is None:
            context = {}

        field_metadata = {
            "downtime_minutes": {
                "question": "How many production minutes were lost or delayed?",
                "business_impact_weight": 0.95,
                "decision_sensitivity": 0.85,
                "acquisition_feasibility": 0.70,
            },
            "asset_owner": {
                "question": "Who owns the affected asset or system?",
                "business_impact_weight": 0.65,
                "decision_sensitivity": 0.55,
                "acquisition_feasibility": 0.90,
            },
            "affected_department": {
                "question": "Which department is affected?",
                "business_impact_weight": 0.70,
                "decision_sensitivity": 0.60,
                "acquisition_feasibility": 0.95,
            },
            "ticket_age": {
                "question": "How old is the original ticket?",
                "business_impact_weight": 0.50,
                "decision_sensitivity": 0.45,
                "acquisition_feasibility": 0.80,
            },
            "vendor_sla": {
                "question": "What is the vendor SLA for this asset type?",
                "business_impact_weight": 0.40,
                "decision_sensitivity": 0.30,
                "acquisition_feasibility": 0.75,
            },
        }

        results = []
        for field in missing_fields:
            meta = field_metadata.get(
                field,
                {
                    "question": f"What is the value for {field}?",
                    "business_impact_weight": 0.50,
                    "decision_sensitivity": 0.50,
                    "acquisition_feasibility": 0.70,
                },
            )

            confidence_gain = (
                meta["business_impact_weight"]
                * meta["decision_sensitivity"]
                * meta["acquisition_feasibility"]
            )

            results.append(
                {
                    "field": field,
                    "question": meta["question"],
                    "reason": f"Expected confidence gain: {confidence_gain:.2f}",
                    "expected_confidence_gain": round(confidence_gain, 2),
                    "business_impact_weight": meta["business_impact_weight"],
                    "acquisition_feasibility": meta["acquisition_feasibility"],
                }
            )

        results.sort(key=lambda x: x["expected_confidence_gain"], reverse=True)
        return results
