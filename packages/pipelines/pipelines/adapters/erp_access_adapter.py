from .base import BaseAdapter


class ERPAccessAdapter(BaseAdapter):
    adapter_name = "erp-access"
    supported_formats = ["application/json", "json"]

    def parse(self, raw_data: str | dict) -> list[dict]:
        import json

        if isinstance(raw_data, dict):
            return [raw_data]
        return [json.loads(raw_data)]

    def normalize(self, record: dict) -> dict:
        return {
            "event_type": record.get("event_type", "erp_access_event"),
            "source": f"erp:{record.get('system', 'unknown')}",
            "user": record.get("user", ""),
            "department": record.get("department", ""),
            "severity": record.get("severity", "medium"),
            "description": record.get("description", ""),
            "detected_at": record.get("detected_at", ""),
            "source_reliability": 0.80,
            "freshness": 0.9,
            "corroboration": 0.6,
            "completeness": 0.7,
            "consistency": 0.75,
            "auditability": 0.85,
        }
