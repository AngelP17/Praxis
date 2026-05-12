from .base import BaseAdapter


class K8sAlertAdapter(BaseAdapter):
    adapter_name = "k8s-alert"
    supported_formats = ["application/json", "json"]

    def parse(self, raw_data: str | dict) -> list[dict]:
        import json

        if isinstance(raw_data, dict):
            return [raw_data]
        return [json.loads(raw_data)]

    def normalize(self, record: dict) -> dict:
        return {
            "event_type": record.get("alert_type", "k8s_alert"),
            "source": f"k8s:{record.get('cluster', 'unknown')}",
            "cluster": record.get("cluster", ""),
            "namespace": record.get("namespace", ""),
            "workload": record.get("workload", ""),
            "severity": record.get("severity", "medium"),
            "description": record.get("description", ""),
            "detected_at": record.get("timestamp", ""),
            "source_reliability": 0.90,
            "freshness": 0.95,
            "corroboration": 0.7,
            "completeness": 0.65,
            "consistency": 0.85,
            "auditability": 0.9,
        }
