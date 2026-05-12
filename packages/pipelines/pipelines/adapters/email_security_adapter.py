from .base import BaseAdapter


class EmailSecurityAdapter(BaseAdapter):
    adapter_name = "email-security"
    supported_formats = ["application/json", "json"]

    def parse(self, raw_data: str | dict) -> list[dict]:
        import json

        if isinstance(raw_data, dict):
            return [raw_data]
        return [json.loads(raw_data)]

    def normalize(self, record: dict) -> dict:
        return {
            "event_type": record.get("event_type", "email_security_event"),
            "source": f"email_security:{record.get('system', 'unknown')}",
            "severity": record.get("severity", "medium"),
            "description": record.get("description", ""),
            "detected_at": record.get("detected_at", ""),
            "source_reliability": 0.75,
            "freshness": 0.85,
            "corroboration": 0.5,
            "completeness": 0.6,
            "consistency": 0.7,
            "auditability": 0.8,
        }
