import csv
import io
from .base import BaseAdapter


class CSVTicketAdapter(BaseAdapter):
    adapter_name = "csv-ticket"
    supported_formats = ["text/csv", "csv"]

    def parse(self, raw_data: str) -> list[dict]:
        reader = csv.DictReader(io.StringIO(raw_data))
        return [row for row in reader]

    def normalize(self, record: dict) -> dict:
        return {
            "event_type": record.get("type", "ticket_ingested"),
            "source": "csv_ticket_import",
            "ticket_id": record.get("ticket_id", ""),
            "site": record.get("site", ""),
            "asset": record.get("asset", ""),
            "department": record.get("department", ""),
            "severity": record.get("priority", "medium"),
            "description": record.get("description", ""),
            "detected_at": record.get("created_date", ""),
            "source_reliability": 0.7,
            "freshness": 0.8,
            "corroboration": 0.5,
            "completeness": 0.7,
            "consistency": 0.75,
            "auditability": 0.8,
        }
