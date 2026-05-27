from pathlib import Path
from typing import Any
import json

from sqlalchemy.orm import Session

from astraea.praxis import PraxisProofBuilder, PraxisProofVerifier, ProofInputs


ROOT = Path(__file__).resolve().parents[3]


class ProofService:
    def __init__(self, db: Session):
        self.db = db

    def build_proof(self, payload: dict[str, Any]) -> dict[str, Any]:
        solution_pack = payload.get("solution_pack") or "unknown"
        events = payload.get("events") or self._load_pack_events(solution_pack)
        customer_context = payload.get("customer_context") or self._load_customer_context(
            solution_pack
        )
        return PraxisProofBuilder().build(
            ProofInputs(
                solution_pack=solution_pack,
                events=events,
                customer_context=customer_context,
                run_id=payload.get("run_id"),
            )
        )

    def verify_proof(self, proof: dict[str, Any], level: str = "L0") -> dict[str, Any]:
        result = PraxisProofVerifier(level=level).verify(proof)
        return {
            "valid": result.valid,
            "status": result.status,
            "errors": result.errors,
            "proof_hash": result.proof_hash,
            "level": result.level,
            "conformance": result.conformance,
        }

    def get_pack_proof(self, pack_id: str) -> dict[str, Any]:
        return self.build_proof({"solution_pack": pack_id})

    def _load_pack_events(self, pack_id: str) -> list[dict[str, Any]]:
        events_path = ROOT / "solution-packs" / pack_id / "sample-events.jsonl"
        if not events_path.is_file():
            return []
        return [json.loads(line) for line in events_path.read_text().splitlines() if line.strip()]

    def _load_customer_context(self, pack_id: str) -> str:
        context_path = ROOT / "solution-packs" / pack_id / "customer-context.md"
        return context_path.read_text() if context_path.is_file() else ""
