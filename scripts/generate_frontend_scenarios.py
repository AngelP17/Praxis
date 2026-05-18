#!/usr/bin/env python3
"""Generate the frontend fallback scenario artifact from the Python registry."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "packages" / "domain"))

from domain.scenarios import SCENARIOS  # noqa: E402


OUTPUT_PATH = ROOT / "apps" / "web" / "src" / "lib" / "generated" / "scenarios.generated.json"


def main() -> int:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = [scenario.model_dump(mode="json") for scenario in SCENARIOS]
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, sort_keys=False) + "\n")
    print(f"Wrote {OUTPUT_PATH.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
