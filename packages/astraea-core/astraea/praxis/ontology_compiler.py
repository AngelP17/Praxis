class OntologyCompiler:
    def compile(
        self, records: list[dict], adapter_profile: str = "generic", customer_context: dict = None
    ) -> dict:
        if customer_context is None:
            customer_context = {}

        candidates = self._extract_object_candidates(records)
        object_types = self._infer_object_types(candidates)
        links = self._infer_links(candidates, customer_context)
        actions = self._infer_actions(object_types, links, customer_context)
        confidence = self._score_mapping_confidence(candidates, object_types, links)

        return {
            "object_types": object_types,
            "links": links,
            "actions": actions,
            "confidence": confidence,
            "object_count": len(object_types),
        }

    def _extract_object_candidates(self, records: list[dict]) -> list[dict]:
        candidates = []
        for rec in records:
            for key, value in rec.items():
                if isinstance(value, str) and value:
                    candidates.append(
                        {"key": key, "value": value, "source": rec.get("source", "unknown")}
                    )
        return candidates

    def _infer_object_types(self, candidates: list[dict]) -> list[dict]:
        objects = []
        seen = set()

        field_classifiers = {
            "site": "Site",
            "plant": "Site",
            "location": "Site",
            "asset": "Asset",
            "device": "Asset",
            "machine": "Asset",
            "printer": "Asset",
            "vendor": "Vendor",
            "department": "BusinessProcess",
            "process": "BusinessProcess",
            "workflow": "BusinessProcess",
            "stakeholder": "Stakeholder",
            "owner": "Stakeholder",
            "control": "Control",
            "policy": "Control",
            "runbook": "Runbook",
        }

        for candidate in candidates:
            key = candidate["key"].lower()
            value = candidate["value"].lower().replace(" ", "-")
            for pattern, obj_type in field_classifiers.items():
                if pattern in key and value not in seen:
                    seen.add(value)
                    objects.append(
                        {
                            "type": obj_type,
                            "key": f"{obj_type.lower()}-{value}",
                            "display_name": candidate["value"],
                            "source": candidate["source"],
                        }
                    )
                    break

        return objects

    def _infer_links(self, candidates: list[dict], context: dict) -> list[dict]:
        links = []
        sites = [c for c in candidates if "site" in c["key"].lower() or "plant" in c["key"].lower()]
        assets = [
            c
            for c in candidates
            if "asset" in c["key"].lower()
            or "printer" in c["key"].lower()
            or "device" in c["key"].lower()
        ]

        for site in sites:
            for asset in assets:
                links.append(
                    {
                        "source": f"site-{site['value'].lower().replace(' ', '-')}",
                        "target": f"asset-{asset['value'].lower().replace(' ', '-')}",
                        "type": "owns",
                    }
                )

        return links

    def _infer_actions(self, objects: list[dict], links: list[dict], context: dict) -> list[dict]:
        return [
            {
                "action_type": "acknowledge_incident",
                "mode": "HUMAN_APPROVAL",
                "requires_approval": True,
            },
            {"action_type": "assign_owner", "mode": "ASSISTED_ACTION", "requires_approval": False},
            {
                "action_type": "request_vendor_support",
                "mode": "ASSISTED_ACTION",
                "requires_approval": True,
            },
            {
                "action_type": "approve_remediation",
                "mode": "HUMAN_APPROVAL",
                "requires_approval": True,
            },
            {
                "action_type": "escalate_to_operations",
                "mode": "HUMAN_APPROVAL",
                "requires_approval": True,
            },
            {"action_type": "close_with_evidence", "mode": "WRITEBACK", "requires_approval": True},
        ]

    def _score_mapping_confidence(
        self, candidates: list[dict], objects: list[dict], links: list[dict]
    ) -> float:
        if not candidates:
            return 0.0

        schema_coverage = min(len(objects) / max(len(candidates), 1), 1.0) if candidates else 0.0
        field_consistency = 0.70
        relationship_density = min(len(links) / max(len(objects), 1), 1.0) if objects else 0.0
        source_reliability = 0.75
        semantic_match = 0.70

        confidence = (
            0.30 * schema_coverage
            + 0.20 * field_consistency
            + 0.20 * relationship_density
            + 0.15 * source_reliability
            + 0.15 * semantic_match
        )
        return round(confidence, 4)
