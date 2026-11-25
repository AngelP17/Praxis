"""Compare canonical proof hashes across isolated processes and fixture packs."""
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts" / "cross-process"


def main():
    packs = sorted(p.parent.name for p in (ROOT / "solution-packs").glob("*/sample-events.jsonl"))
    if not packs:
        raise RuntimeError("No solution packs discovered")
    results = []
    for pack in packs:
        hashes = []
        for seed in ("1", "777"):
            target = OUT / pack / seed
            subprocess.run([sys.executable, str(ROOT / "scripts/check_replay_determinism.py"),
                            "--solution-pack", pack, "--output-dir", str(target)],
                           cwd=ROOT, env={**os.environ, "PYTHONHASHSEED": seed}, check=True)
            hashes.append(json.loads((target / "run_1_praxis_proof.json").read_text())["proof_hash"])
        if hashes[0] != hashes[1]:
            raise RuntimeError(f"Cross-process mismatch for {pack}: {hashes}")
        results.append({"pack": pack, "hashes": hashes})
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "report.json").write_text(json.dumps({"packs": results}, indent=2) + "\n")


if __name__ == "__main__":
    main()
