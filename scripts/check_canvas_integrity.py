#!/usr/bin/env python3
"""Verify Praxis canvas integrity: required files exist and banned tokens are absent."""

import sys
from pathlib import Path

CANVAS_DIR = Path("praxis-canvas/praxis")
HTML_FILE = CANVAS_DIR / "Praxis Wireframes.html"
REQUIRED_SCRIPTS = ["shared.jsx", "brand.jsx", "marketing.jsx", "app.jsx", "flow.jsx"]
BANNED_TOKENS = ["accent arm", "Solar Amber", "orange accent"]


def main() -> int:
    checks: list[tuple[str, bool]] = []

    # 1. HTML file exists and is readable
    if HTML_FILE.exists():
        try:
            HTML_FILE.read_text(encoding="utf-8")
            checks.append(("Praxis Wireframes.html exists and readable", True))
        except Exception:
            checks.append(("Praxis Wireframes.html exists and readable", False))
    else:
        checks.append(("Praxis Wireframes.html exists and readable", False))

    # 2. Required script files exist
    for script in REQUIRED_SCRIPTS:
        path = CANVAS_DIR / script
        checks.append((f"Script file exists: {script}", path.exists()))

    # 3. Banned tokens in canvas files
    canvas_files = list(CANVAS_DIR.glob("*.jsx"))
    if HTML_FILE.exists():
        canvas_files.append(HTML_FILE)

    banned_found: list[tuple[str, str]] = []
    for file_path in canvas_files:
        try:
            text = file_path.read_text(encoding="utf-8")
        except Exception:
            continue
        lower_text = text.lower()
        for token in BANNED_TOKENS:
            if token.lower() in lower_text:
                banned_found.append((file_path.name, token))

    if banned_found:
        checks.append(("Banned tokens absent from canvas files", False))
    else:
        checks.append(("Banned tokens absent from canvas files", True))

    print("=" * 50)
    print("Canvas Integrity Check Report")
    print("=" * 50)

    all_pass = True
    for name, result in checks:
        status = "PASS" if result else "FAIL"
        if not result:
            all_pass = False
        print(f"  [{status}] {name}")

    if banned_found:
        for fname, token in banned_found:
            print(f"    -> Found banned token '{token}' in {fname}")

    print("=" * 50)
    if all_pass:
        print("RESULT: ALL CHECKS PASSED")
        return 0
    else:
        print("RESULT: SOME CHECKS FAILED")
        return 1


if __name__ == "__main__":
    sys.exit(main())
