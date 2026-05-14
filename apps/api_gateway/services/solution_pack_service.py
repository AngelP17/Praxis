import uuid
from pathlib import Path

import yaml
from sqlalchemy.orm import Session

SOLUTION_PACKS_DIR = Path(__file__).resolve().parents[3] / "solution-packs"


class SolutionPackService:
    def __init__(self, db: Session):
        self.db = db

    def list_packs(self) -> list[dict]:
        if not SOLUTION_PACKS_DIR.is_dir():
            return []
        packs = []
        for pack_dir in sorted(SOLUTION_PACKS_DIR.iterdir()):
            scenario_path = pack_dir / "scenario.yaml"
            if scenario_path.is_file():
                try:
                    scenario = self._load_yaml(scenario_path)
                    events = self._load_events(pack_dir)
                    packs.append(
                        {
                            "id": scenario.get("id", pack_dir.name),
                            "name": scenario.get("name", pack_dir.name),
                            "industry": scenario.get("industry", ""),
                            "primary_pain": scenario.get("primary_pain", ""),
                            "demo_length_minutes": scenario.get("demo_length_minutes", 0),
                            "event_count": len(events),
                            "sources": self._sources(events),
                        }
                    )
                except Exception:
                    packs.append(
                        {
                            "id": pack_dir.name,
                            "name": pack_dir.name,
                            "industry": "",
                            "primary_pain": "",
                            "demo_length_minutes": 0,
                            "event_count": 0,
                            "sources": [],
                        }
                    )
        return packs

    def get_pack(self, pack_id: str) -> dict:
        pack_dir = SOLUTION_PACKS_DIR / pack_id
        scenario = self._load_yaml(pack_dir / "scenario.yaml")
        roi_model = self._load_yaml(pack_dir / "roi-model.yaml")
        events = self._load_events(pack_dir)
        return {
            "id": scenario.get("id", pack_id),
            "name": scenario.get("name", pack_id),
            "industry": scenario.get("industry", ""),
            "buyer_persona": scenario.get("buyer_persona", ""),
            "technical_persona": scenario.get("technical_persona", ""),
            "economic_buyer": scenario.get("economic_buyer", ""),
            "primary_pain": scenario.get("primary_pain", ""),
            "systems": scenario.get("systems", []),
            "signals": scenario.get("signals", []),
            "business_metrics": scenario.get("business_metrics", []),
            "target_outcome": scenario.get("target_outcome", ""),
            "demo_length_minutes": scenario.get("demo_length_minutes", 0),
            "scenario": scenario,
            "roi_model": roi_model,
            "event_count": len(events),
            "sources": self._sources(events),
        }

    def validate_pack(self, pack_id: str) -> dict:
        pack_dir = SOLUTION_PACKS_DIR / pack_id
        required_files = [
            "scenario.yaml",
            "customer-context.md",
            "sample-events.jsonl",
            "ontology.yaml",
            "demo-script.md",
            "roi-model.yaml",
            "objection-handling.md",
            "security-review.md",
            "implementation-plan.md",
        ]
        errors = []
        warnings = []
        for fname in required_files:
            if not (pack_dir / fname).is_file():
                errors.append(f"Missing required file: {fname}")

        expected_output_dir = pack_dir / "expected-output"
        if not expected_output_dir.is_dir():
            warnings.append("Missing expected-output/ directory")

        present = len(required_files) - len([e for e in errors if "Missing" in e])
        coverage = present / len(required_files) if required_files else 0.0
        return {
            "pack_id": pack_id,
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "coverage": round(coverage, 2),
        }

    def launch_pack(self, pack_id: str) -> dict:
        run_id = f"flr_{uuid.uuid4().hex[:12]}"
        return {
            "pack_id": pack_id,
            "fieldlab_run_id": run_id,
            "status": "launched",
        }

    def get_readiness(self, pack_id: str) -> dict:
        pack_dir = SOLUTION_PACKS_DIR / pack_id
        if not pack_dir.is_dir():
            return {
                "pack_id": pack_id,
                "ready": False,
                "missing_files": ["entire pack"],
                "required_services": [],
            }
        required_files = [
            "scenario.yaml",
            "sample-events.jsonl",
            "ontology.yaml",
            "roi-model.yaml",
            "demo-script.md",
        ]
        missing = [f for f in required_files if not (pack_dir / f).is_file()]
        return {
            "pack_id": pack_id,
            "ready": len(missing) == 0,
            "missing_files": missing,
            "required_services": ["floci", "api-gateway", "decision-service"],
        }

    def _load_yaml(self, path: Path) -> dict:
        if not path.is_file():
            return {}
        with path.open() as handle:
            return yaml.safe_load(handle) or {}

    def _load_events(self, pack_dir: Path) -> list[dict]:
        events_path = pack_dir / "sample-events.jsonl"
        if not events_path.is_file():
            return []
        events = []
        for line in events_path.read_text().splitlines():
            if line.strip():
                events.append(yaml.safe_load(line))
        return events

    def _sources(self, events: list[dict]) -> list[str]:
        return sorted({str(event.get("source", "unknown")) for event in events})
