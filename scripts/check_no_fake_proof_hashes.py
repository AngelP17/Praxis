#!/usr/bin/env python3
"""Detect fake-looking hash patterns and Math.random() usage in proof-related files."""

import re
import sys
from pathlib import Path

COMPONENTS_DIR = Path("apps/web/src/components/praxis")


def is_proof_related(path: Path) -> bool:
    """Return True for files whose names suggest proof or hash handling."""
    # Skip legacy directories
    if any("legacy" in str(part) for part in path.parts):
        return False
    lower = path.name.lower()
    return "proof" in lower or "hash" in lower


def find_math_random(content: str) -> list[re.Match[str]]:
    return list(re.finditer(r"Math\.random\(\)", content))


def find_fake_hashes(content: str) -> list[str]:
    """Find hardcoded hash-like strings that look fake or placeholder."""
    findings: list[str] = []

    # sha256: inside quotes or backticks — fake if not exactly 64 hex chars
    for pattern in [
        r"['\"]sha256:([^'\"]{1,63})['\"]",
        r"`sha256:([^`]{1,63})`",
    ]:
        for m in re.finditer(pattern, content):
            hash_part = m.group(1)
            # Ignore deterministic hash template in ProofObjectViewer: ${hex}${hex}${hex}${hex}
            if re.fullmatch(r"\$\{hex\}\$\{hex\}\$\{hex\}\$\{hex\}", hash_part):
                continue
            if not re.fullmatch(r"[0-9a-fA-F]{64}", hash_part):
                findings.append(m.group(0))

    # md5: inside quotes or backticks — fake if not exactly 32 hex chars
    for pattern in [
        r"['\"]md5:([^'\"]{1,31})['\"]",
        r"`md5:([^`]{1,31})`",
    ]:
        for m in re.finditer(pattern, content):
            hash_part = m.group(1)
            if not re.fullmatch(r"[0-9a-fA-F]{32}", hash_part):
                findings.append(m.group(0))

    # Short hardcoded hex strings of exactly 8 chars (common fake pattern)
    for m in re.finditer(r"['\"][0-9a-fA-F]{8}['\"]", content):
        findings.append(m.group(0))

    return findings


def main() -> int:
    if not COMPONENTS_DIR.exists():
        print(f"ERROR: Directory not found: {COMPONENTS_DIR}")
        return 1

    proof_files = [p for p in COMPONENTS_DIR.rglob("*") if p.is_file() and is_proof_related(p)]

    math_random_files: list[Path] = []
    fake_hash_files: list[tuple[Path, list[str]]] = []

    for file_path in proof_files:
        try:
            content = file_path.read_text(encoding="utf-8")
        except Exception:
            continue

        if find_math_random(content):
            math_random_files.append(file_path)

        fake_hashes = find_fake_hashes(content)
        if fake_hashes:
            fake_hash_files.append((file_path, fake_hashes))

    checks = [
        ("No Math.random() in proof-related files", len(math_random_files) == 0),
        ("No fake-looking hash patterns in proof-related files", len(fake_hash_files) == 0),
    ]

    print("=" * 50)
    print("Proof Hash Integrity Check Report")
    print("=" * 50)

    all_pass = True
    for name, result in checks:
        status = "PASS" if result else "FAIL"
        if not result:
            all_pass = False
        print(f"  [{status}] {name}")

    if math_random_files:
        for f in math_random_files:
            print(f"    -> Math.random() found in {f}")

    if fake_hash_files:
        for f, hashes in fake_hash_files:
            for h in hashes:
                print(f"    -> Fake-looking hash {h} found in {f}")

    print("=" * 50)
    if all_pass:
        print("RESULT: ALL CHECKS PASSED")
        return 0
    else:
        print("RESULT: SOME CHECKS FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
