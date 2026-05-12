#!/usr/bin/env python3
"""Validate a Praxis solution pack."""

import argparse
import os
import sys
from pathlib import Path


REQUIRED_FILES = [
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

EXPECTED_OUTPUT_FILES = [
    "incident.json",
    "proof.json",
    "value-case.json",
    "replay.json",
    "executive-readout.md",
]


def validate(pack_path: Path) -> tuple[bool, list[str], list[str]]:
    errors = []
    warnings = []

    if not pack_path.is_dir():
        errors.append(f"Pack directory not found: {pack_path}")
        return False, errors, warnings

    for fname in REQUIRED_FILES:
        if not (pack_path / fname).is_file():
            errors.append(f"Missing required file: {fname}")

    expected_dir = pack_path / "expected-output"
    if not expected_dir.is_dir():
        errors.append("Missing expected-output/ directory")
    else:
        for fname in EXPECTED_OUTPUT_FILES:
            if not (expected_dir / fname).is_file():
                errors.append(f"Missing expected output: expected-output/{fname}")

    return len(errors) == 0, errors, warnings


def main():
    parser = argparse.ArgumentParser(description="Validate a Praxis solution pack")
    parser.add_argument("pack_path", help="Path to the solution pack directory")
    args = parser.parse_args()

    valid, errors, warnings = validate(Path(args.pack_path))

    print(f"Pack: {args.pack_path}")
    print(f"Valid: {valid}")
    print()

    if errors:
        print("Errors:")
        for e in errors:
            print(f"  [ERROR] {e}")
        print()

    if warnings:
        print("Warnings:")
        for w in warnings:
            print(f"  [WARN]  {w}")
        print()

    if valid:
        print("Validation passed.")
        sys.exit(0)
    else:
        print("Validation failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
