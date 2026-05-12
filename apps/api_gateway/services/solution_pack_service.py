import os
import yaml
import uuid
from sqlalchemy.orm import Session

SOLUTION_PACKS_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
    "solution-packs",
)


class SolutionPackService:
    def __init__(self, db: Session):
        self.db = db

    def list_packs(self) -> list[dict]:
        if not os.path.isdir(SOLUTION_PACKS_DIR):
            return []
        packs = []
        for entry in sorted(os.listdir(SOLUTION_PACKS_DIR)):
            pack_dir = os.path.join(SOLUTION_PACKS_DIR, entry)
            scenario_path = os.path.join(pack_dir, "scenario.yaml")
            if os.path.isfile(scenario_path):
                try:
                    with open(scenario_path) as f:
                        scenario = yaml.safe_load(f) or {}
                    packs.append(
                        {
                            "id": scenario.get("id", entry),
                            "name": scenario.get("name", entry),
                            "industry": scenario.get("industry", ""),
                            "primary_pain": scenario.get("primary_pain", ""),
                            "demo_length_minutes": scenario.get("demo_length_minutes", 0),
                        }
                    )
                except Exception:
                    packs.append(
                        {
                            "id": entry,
                            "name": entry,
                            "industry": "",
                            "primary_pain": "",
                            "demo_length_minutes": 0,
                        }
                    )
        return packs

    def get_pack(self, pack_id: str) -> dict:
        pack_dir = os.path.join(SOLUTION_PACKS_DIR, pack_id)
        scenario_path = os.path.join(pack_dir, "scenario.yaml")
        scenario = {}
        if os.path.isfile(scenario_path):
            with open(scenario_path) as f:
                scenario = yaml.safe_load(f) or {}
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
        }

    def validate_pack(self, pack_id: str) -> dict:
        pack_dir = os.path.join(SOLUTION_PACKS_DIR, pack_id)
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
            if not os.path.isfile(os.path.join(pack_dir, fname)):
                errors.append(f"Missing required file: {fname}")

        expected_output_dir = os.path.join(pack_dir, "expected-output")
        if not os.path.isdir(expected_output_dir):
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
        pack_dir = os.path.join(SOLUTION_PACKS_DIR, pack_id)
        if not os.path.isdir(pack_dir):
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
        missing = [f for f in required_files if not os.path.isfile(os.path.join(pack_dir, f))]
        return {
            "pack_id": pack_id,
            "ready": len(missing) == 0,
            "missing_files": missing,
            "required_services": ["floci", "api-gateway", "decision-service"],
        }
