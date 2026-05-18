#!/usr/bin/env python3
"""Deterministic scenario runner.

Usage:
  .venv/bin/python scripts/run_scenario.py printer-offline
  .venv/bin/python scripts/run_scenario.py --all
  .venv/bin/python scripts/run_scenario.py --benchmark
"""

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "apps"))
sys.path.insert(0, str(ROOT / "services" / "platform-service" / "src"))


def make_db() -> "Session":
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session

    engine = create_engine("sqlite:///./praxis.db", echo=False)
    return Session(engine)


def run_one(scenario_id: str, auto_approve: bool = False) -> dict | None:
    from apps.api_gateway.services.scenario_service import ScenarioService

    db = make_db()
    try:
        svc = ScenarioService(db)
        result = svc.run_scenario(scenario_id, auto_approve=auto_approve)
        db.commit()
        return result
    finally:
        db.close()


def run_all(auto_approve: bool = False) -> list[dict]:
    from domain.scenarios import SCENARIOS

    results = []
    for scenario in SCENARIOS:
        result = run_one(scenario.id, auto_approve=auto_approve)
        if result:
            results.append(result)
    return results


def run_benchmark() -> list[dict]:
    from apps.api_gateway.services.scenario_service import ScenarioService

    db = make_db()
    try:
        svc = ScenarioService(db)
        return svc.benchmarks()
    finally:
        db.close()


def fmt_table(results: list[dict]) -> str:
    header = f"{'Scenario':<22} {'Event Type':<42} {'Risk':<10} {'Priority':>8} {'Deterministic':>14} {'Value':>10}"
    sep = "-" * len(header)
    rows = [header, sep]
    for r in results:
        rows.append(
            f"{r['scenario_id']:<22} "
            f"{r.get('event_type', ''):<42} "
            f"{r.get('risk_level', ''):<10} "
            f"{r.get('priority_score', ''):>8} "
            f"{str(r.get('deterministic', r.get('determinism', 'N/A'))):>14} "
            f"${r.get('estimated_value_usd', 'N/A'):>9}"
        )
    return "\n".join(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Deterministic scenario runner")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("scenario_id", nargs="?", help="Scenario ID to run")
    group.add_argument("--all", action="store_true", help="Run all scenarios")
    group.add_argument("--benchmark", action="store_true", help="Show benchmark summary")
    parser.add_argument("--approve", action="store_true", help="Auto-approve decisions")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    if args.benchmark:
        results = run_benchmark()
    elif args.all:
        results = run_all(auto_approve=args.approve)
    elif args.scenario_id:
        result = run_one(args.scenario_id, auto_approve=args.approve)
        results = [result] if result else []
    else:
        parser.print_help()
        return 1

    if not results:
        print("No results.", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print(fmt_table(results))

    return 0


if __name__ == "__main__":
    sys.exit(main())
