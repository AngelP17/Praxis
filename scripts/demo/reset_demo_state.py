#!/usr/bin/env python3
"""Reset demo state by clearing SQLite test database and temporary files."""

import glob
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def remove_files(pattern: str) -> int:
    count = 0
    for path in glob.glob(str(ROOT / pattern)):
        try:
            os.remove(path)
            print(f"  Removed: {path}")
            count += 1
        except Exception as e:
            print(f"  Error removing {path}: {e}")
    return count


def main() -> int:
    print("Resetting demo state...")
    count = 0
    count += remove_files("*.db")
    count += remove_files("**/*.db")
    print(f"Done. Removed {count} database files.")
    print("Run 'make demo' again to start fresh.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
