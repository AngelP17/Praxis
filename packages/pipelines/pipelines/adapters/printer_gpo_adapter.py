from .base import BaseAdapter


class PrinterGPOAdapter(BaseAdapter):
    adapter_name = "printer-gpo"
    supported_formats = ["application/json", "json", "jsonl"]

    def parse(self, raw_data: str) -> list[dict]:
        import json

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
            "event_type": record.get("event_type", "printer_event"),
            "source": f"printer_gpo:{record.get('source', 'unknown')}",
            "site": record.get("site", ""),
            "asset": record.get("asset", ""),
            "department": record.get("department", ""),
            "affected_process": record.get("affected_process", ""),
            "severity": record.get("severity", "medium"),
            "description": record.get("description", ""),
            "detected_at": record.get("detected_at", ""),
            "source_reliability": 0.85,
            "freshness": 0.9,
            "corroboration": 0.6,
            "completeness": 0.7,
            "consistency": 0.8,
            "auditability": 0.85,
        }
