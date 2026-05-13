#!/usr/bin/env python3
"""Praxis Solution Pack SDK CLI.

Usage:
    praxis-pack init my-pack
    praxis-pack validate my-pack
    praxis-pack publish my-pack --output-dir ./dist
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

TEMPLATE_FILES = {
    "README.md": "# {name}\n\nSolution pack for {name}.\n",
    "scenario.md": "# Scenario: {name}\n\nDescribe the operational scenario.\n",
    "sample-events.jsonl": '{"source": "example", "event_type": "signal", "description": "Example event"}\n',
    "customer-context.md": "# Customer Context\n\nBuyer: \nTechnical persona: \nBusiness process: \n",
    "expected-output/executive-readout.md": "# Executive Readout: {name}\n\n## Problem\n\n## Operational Impact\n\n## Recommended Action\n\n## Expected Value\n",
}


def cmd_init(args: argparse.Namespace) -> int:
    pack_dir = Path(args.pack_name)
    if pack_dir.exists():
        print(f"Error: {pack_dir} already exists", file=sys.stderr)
        return 1

    pack_dir.mkdir(parents=True)
    (pack_dir / "expected-output").mkdir(exist_ok=True)

    for filename, content in TEMPLATE_FILES.items():
        filepath = pack_dir / filename
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_text(content.format(name=args.pack_name))

    print(f"Solution pack initialized: {pack_dir}")
    print()
    for filename in TEMPLATE_FILES:
        print(f"  {pack_dir / filename}")
    print()
    print("Next: edit the files, add sample-events.jsonl, then run:")
    print(f"  praxis-pack validate {args.pack_name}")
    return 0


def cmd_validate(args: argparse.Namespace) -> int:
    pack_dir = Path(args.pack_name)
    if not pack_dir.is_dir():
        print(f"Error: {pack_dir} not found", file=sys.stderr)
        return 1

    errors: list[str] = []

    events_path = pack_dir / "sample-events.jsonl"
    if not events_path.is_file():
        errors.append("missing sample-events.jsonl")
    else:
        lines = [line for line in events_path.read_text().splitlines() if line.strip()]
        if not lines:
            errors.append("sample-events.jsonl is empty")
        for i, line in enumerate(lines, 1):
            try:
                json.loads(line)
            except json.JSONDecodeError:
                errors.append(f"sample-events.jsonl line {i}: invalid JSON")

    readme = pack_dir / "README.md"
    if not readme.is_file():
        errors.append("missing README.md")

    scenario = pack_dir / "scenario.md"
    if not scenario.is_file():
        errors.append("missing scenario.md")

    readout = pack_dir / "expected-output" / "executive-readout.md"
    if not readout.is_file():
        errors.append("missing expected-output/executive-readout.md")

    if errors:
        print(f"Validation failed for {args.pack_name}:")
        for error in errors:
            print(f"  - {error}")
        return 1

    print(f"Solution pack {args.pack_name} is valid.")
    return 0


def cmd_publish(args: argparse.Namespace) -> int:
    pack_dir = Path(args.pack_name)
    if not pack_dir.is_dir():
        print(f"Error: {pack_dir} not found", file=sys.stderr)
        return 1

    import shutil

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    tar_root = output_dir / args.pack_name
    for item in pack_dir.rglob("*"):
        if item.is_file():
            dest = tar_root / item.relative_to(pack_dir)
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, dest)

    print(f"Solution pack published to {output_dir / args.pack_name}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Praxis Solution Pack SDK")
    sub = parser.add_subparsers(dest="command", required=True)

    init_parser = sub.add_parser("init", help="Initialize a new solution pack")
    init_parser.add_argument("pack_name", help="Name of the solution pack")
    init_parser.set_defaults(func=cmd_init)

    validate_parser = sub.add_parser("validate", help="Validate a solution pack")
    validate_parser.add_argument("pack_name", help="Name of the solution pack")
    validate_parser.set_defaults(func=cmd_validate)

    publish_parser = sub.add_parser("publish", help="Publish a solution pack")
    publish_parser.add_argument("pack_name", help="Name of the solution pack")
    publish_parser.add_argument("--output-dir", default="./dist", help="Output directory")
    publish_parser.set_defaults(func=cmd_publish)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
