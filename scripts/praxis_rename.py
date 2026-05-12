#!/usr/bin/env python3
"""Utility script to help with renaming references from praxis to praxis."""

import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent

REPLACEMENTS = [
    ("praxis", "praxis"),
    ("Praxis", "Praxis"),
    ("praxis_api", "praxis_api"),
    ("praxis-api", "praxis-api"),
    ("praxis.db", "praxis.db"),
]


def rename_references(dry_run: bool = True):
    for root, dirs, files in os.walk(ROOT):
        dirs[:] = [
            d for d in dirs if d not in (".git", ".venv", "node_modules", ".next", "__pycache__")
        ]
        for file in files:
            if file.endswith(
                (
                    ".py",
                    ".md",
                    ".yml",
                    ".yaml",
                    ".json",
                    ".toml",
                    ".ts",
                    ".tsx",
                    ".js",
                    ".css",
                    "Makefile",
                    "Dockerfile",
                )
            ):
                filepath = os.path.join(root, file)
                with open(filepath) as f:
                    content = f.read()
                new_content = content
                for old, new in REPLACEMENTS:
                    new_content = new_content.replace(old, new)
                if new_content != content:
                    if dry_run:
                        print(f"Would modify: {filepath}")
                    else:
                        with open(filepath, "w") as f:
                            f.write(new_content)
                        print(f"Modified: {filepath}")


if __name__ == "__main__":
    dry_run = "--apply" not in sys.argv
    rename_references(dry_run=dry_run)
    if dry_run:
        print("\nRun with --apply to make changes.")
