from .base import BaseAdapter


class MachineTelemetryAdapter(BaseAdapter):
    adapter_name = "machine-telemetry"
    supported_formats = ["application/json", "json", "csv"]

    def parse(self, raw_data: str | dict) -> list[dict]:
        import json

        if isinstance(raw_data, dict):
            return [raw_data]
        lines = raw_data.strip().split("\n")
        records = []
        for line in lines:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
        return records

    def normalize(self, record: dict) -> dict:
        return {
            "event_type": record.get("event_type", "machine_telemetry"),
            "source": f"machine:{record.get('machine_id', 'unknown')}",
            "machine_id": record.get("machine_id", ""),
            "sensor": record.get("sensor", ""),
            "value": record.get("value", ""),
            "threshold": record.get("threshold", ""),
            "severity": record.get("severity", "medium"),
            "description": record.get("description", ""),
            "detected_at": record.get("timestamp", ""),
            "source_reliability": 0.88,
            "freshness": 0.95,
            "corroboration": 0.65,
            "completeness": 0.7,
            "consistency": 0.8,
            "auditability": 0.85,
        }
