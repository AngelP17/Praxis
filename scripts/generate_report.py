from __future__ import annotations

import argparse

from sqlalchemy import text

from apps.api_gateway.services.report_service import ReportService
from infrastructure.db.session import get_db_context, init_db


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate an Praxis Excel report")
    parser.add_argument("--output", default="praxis_report.xlsx")
    args = parser.parse_args()

    init_db()
    with get_db_context() as db:
        workbook = ReportService(db).generate_workbook("operational", None, None)
        workbook.save(args.output)
        total = db.execute(text("SELECT COUNT(*) AS total FROM tickets")).mappings().first()
        print(f"Saved {args.output} with {total['total'] if total else 0} tickets available.")


if __name__ == "__main__":
    main()
