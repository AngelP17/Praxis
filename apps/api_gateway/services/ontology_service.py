import hashlib
from sqlalchemy.orm import Session


class OntologyService:
    def __init__(self, db: Session):
        self.db = db

    def compile_ontology(self, payload: dict) -> dict:
        records = payload.get("records", [])
        context = payload.get("customer_context", {})

        object_types = self._infer_objects(records, context)
        links = self._infer_links(object_types, context)
        actions = self._infer_actions(object_types, links, context)

        return {
            "object_types": object_types,
            "links": links,
            "actions": actions,
            "confidence": round(0.5 + 0.3 * min(len(records) / 10, 1), 2),
            "object_count": len(object_types),
        }

    def list_objects(self) -> list[dict]:
        return [
            {
                "object_key": "site-georgia",
                "object_type": "Site",
                "display_name": "Georgia Plant",
                "properties_json": {},
                "source_refs_json": [],
                "confidence": 0.85,
            },
            {
                "object_key": "asset-weifps01",
                "object_type": "Asset",
                "display_name": "WEIFPS01",
                "properties_json": {},
                "source_refs_json": [],
                "confidence": 0.82,
            },
        ]

    def get_object(self, object_key: str) -> dict:
        return {
            "object_key": object_key,
            "object_type": "Asset",
            "display_name": object_key,
            "properties_json": {},
            "source_refs_json": [],
            "confidence": 0.8,
        }

    def list_links(self) -> list[dict]:
        return [
            {"source": "site-georgia", "target": "asset-weifps01", "link_type": "owns"},
        ]

    def list_actions(self) -> list[dict]:
        return [
            {"action_type": "acknowledge_incident", "mode": "HUMAN_APPROVAL"},
            {"action_type": "assign_owner", "mode": "ASSISTED_ACTION"},
            {"action_type": "request_vendor_support", "mode": "ASSISTED_ACTION"},
            {"action_type": "approve_remediation", "mode": "HUMAN_APPROVAL"},
            {"action_type": "escalate_to_operations", "mode": "HUMAN_APPROVAL"},
            {"action_type": "close_with_evidence", "mode": "WRITEBACK"},
        ]

    def simulate_action(self, action_type: str, payload: dict) -> dict:
        payload_json = payload.get("payload", {})
        target = payload.get("target_object_key", "")
        audit_hash = hashlib.sha256(f"{action_type}:{target}".encode()).hexdigest()[:32]

        modes = {
            "acknowledge_incident": "HUMAN_APPROVAL",
            "assign_owner": "ASSISTED_ACTION",
            "request_vendor_support": "ASSISTED_ACTION",
            "approve_remediation": "HUMAN_APPROVAL",
            "escalate_to_operations": "HUMAN_APPROVAL",
            "close_with_evidence": "WRITEBACK",
        }

        return {
            "action_type": action_type,
            "mode": modes.get(action_type, "READ_ONLY"),
            "requires_approval": action_type
            in ("acknowledge_incident", "approve_remediation", "escalate_to_operations"),
            "result": {"simulated": True, "target": target, "input": payload_json},
            "audit_hash": f"sha256:{audit_hash}",
        }

    def _infer_objects(self, records: list[dict], context: dict) -> list[dict]:
        object_types = []
        seen = set()
        for rec in records:
            for key, value in rec.items():
                if isinstance(value, str) and value and key not in ("event_id", "timestamp"):
                    obj = self._classify_field(key, value, context)
                    if obj and obj.get("object_key") not in seen:
                        object_types.append(obj)
                        seen.add(obj["object_key"])
        return object_types

    def _classify_field(self, key: str, value: str, context: dict) -> dict | None:
        key_lower = key.lower()
        value_lower = value.lower()
        if "site" in key_lower or "plant" in key_lower or "location" in key_lower:
            return {
                "object_key": f"site-{value_lower.replace(' ', '-')}",
                "object_type": "Site",
                "display_name": value,
                "properties": {},
            }
        if "asset" in key_lower or "device" in key_lower or "machine" in key_lower:
            return {
                "object_key": f"asset-{value_lower.replace(' ', '-')}",
                "object_type": "Asset",
                "display_name": value,
                "properties": {},
            }
        if "vendor" in key_lower:
            return {
                "object_key": f"vendor-{value_lower.replace(' ', '-')}",
                "object_type": "Vendor",
                "display_name": value,
                "properties": {},
            }
        if "process" in key_lower or "workflow" in key_lower:
            return {
                "object_key": f"process-{value_lower.replace(' ', '-')}",
                "object_type": "BusinessProcess",
                "display_name": value,
                "properties": {},
            }
        return None

    def _infer_links(self, objects: list[dict], context: dict) -> list[dict]:
        links = []
        sites = [o for o in objects if o["object_type"] == "Site"]
        assets = [o for o in objects if o["object_type"] == "Asset"]
        for site in sites:
            for asset in assets:
                links.append(
                    {
                        "source": site["object_key"],
                        "target": asset["object_key"],
                        "link_type": "owns",
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
            {"action_type": "close_with_evidence", "mode": "WRITEBACK", "requires_approval": True},
        ]
