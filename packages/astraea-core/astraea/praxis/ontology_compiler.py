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
        objects_by_type = {}
        for c in candidates:
            key = c["key"].lower()
            val = c["value"].lower().replace(" ", "-")
            obj_type = None
            field_classifiers = {
                "site": "Site", "plant": "Site", "location": "Site",
                "asset": "Asset", "device": "Asset", "machine": "Asset", "printer": "Asset",
                "vendor": "Vendor",
                "department": "BusinessProcess",
                "process": "BusinessProcess",
                "workflow": "BusinessProcess",
                "stakeholder": "Stakeholder", "owner": "Stakeholder",
                "control": "Control", "policy": "Control",
                "runbook": "Runbook"
            }
            for pattern, t in field_classifiers.items():
                if pattern in key:
                    obj_type = t
                    break
            if obj_type:
                objects_by_type.setdefault(obj_type, []).append(val)

        # 1. Site -> Asset (owns)
        for s in objects_by_type.get("Site", []):
            for a in objects_by_type.get("Asset", []):
                links.append({"source": f"site-{s}", "target": f"asset-{a}", "type": "owns"})

        # 2. BusinessProcess -> Asset (depends_on)
        for p in objects_by_type.get("BusinessProcess", []):
            for a in objects_by_type.get("Asset", []):
                links.append({
                    "source": f"businessprocess-{p}",
                    "target": f"asset-{a}",
                    "type": "depends_on"
                })

        # 3. Asset -> Vendor (maintained_by)
        for a in objects_by_type.get("Asset", []):
            for v in objects_by_type.get("Vendor", []):
                links.append({
                    "source": f"asset-{a}",
                    "target": f"vendor-{v}",
                    "type": "maintained_by"
                })

        # 4. Stakeholder -> BusinessProcess (manages)
        for st in objects_by_type.get("Stakeholder", []):
            for p in objects_by_type.get("BusinessProcess", []):
                links.append({
                    "source": f"stakeholder-{st}",
                    "target": f"businessprocess-{p}",
                    "type": "manages"
                })

        # 5. Asset -> Control (governed_by)
        for a in objects_by_type.get("Asset", []):
            for c_val in objects_by_type.get("Control", []):
                links.append({
                    "source": f"asset-{a}",
                    "target": f"control-{c_val}",
                    "type": "governed_by"
                })

        # 6. Runbook -> Asset (remediates)
        for r in objects_by_type.get("Runbook", []):
            for a in objects_by_type.get("Asset", []):
                links.append({
                    "source": f"runbook-{r}",
                    "target": f"asset-{a}",
                    "type": "remediates"
                })

        # De-duplicate links
        seen_links = set()
        deduped = []
        for link_item in links:
            k = (link_item["source"], link_item["target"], link_item["type"])
            if k not in seen_links:
                seen_links.add(k)
                deduped.append(link_item)

        return deduped

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
