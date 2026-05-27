#!/usr/bin/env python3
"""Generate frontend demo proofs using the canonical Praxis proof builder."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "astraea-core"))

from astraea.praxis import PraxisProofBuilder, ProofInputs  # noqa: E402


PACK_IDS = (
    "manufacturing-printer-gpo",
    "network-edge-failover",
    "identity-onboarding-drift",
    "database-failover-lag",
)
OUTPUT = ROOT / "apps" / "web" / "src" / "lib" / "generated" / "proofs.generated.json"


def main() -> int:
    builder = PraxisProofBuilder()
    proofs: dict[str, dict] = {}
    for pack_id in PACK_IDS:
        pack_dir = ROOT / "solution-packs" / pack_id
        events = [
            json.loads(line)
            for line in (pack_dir / "sample-events.jsonl").read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]
        context_path = pack_dir / "customer-context.md"
        context = context_path.read_text(encoding="utf-8") if context_path.is_file() else ""
        proofs[pack_id] = builder.build(
            ProofInputs(solution_pack=pack_id, events=events, customer_context=context)
        )

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(proofs, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"Generated {len(proofs)} canonical frontend proofs at {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
