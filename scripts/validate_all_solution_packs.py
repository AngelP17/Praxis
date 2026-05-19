#!/usr/bin/env python3
"""Validate all consolidated Praxis solution packs."""

import sys
from pathlib import Path

# Add scripts directory to path to import validate_solution_pack
sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_solution_pack import validate


def main():
    root_dir = Path(__file__).resolve().parents[1]
    packs_dir = root_dir / "solution-packs"
    
    if not packs_dir.is_dir():
        print(f"[ERROR] solution-packs directory not found at {packs_dir}")
        sys.exit(1)
        
    all_valid = True
    pack_dirs = sorted([d for d in packs_dir.iterdir() if d.is_dir()])
    
    print(f"Validating {len(pack_dirs)} solution packs...")
    print("-" * 50)
    
    for pdir in pack_dirs:
        pack_name = pdir.name
        valid, errors, warnings = validate(pdir)
        
        status = "PASSED" if valid else "FAILED"
        print(f"Pack: {pack_name} -> {status}")
        
        if errors:
            for err in errors:
                print(f"  [ERROR] {err}")
        if warnings:
            for warn in warnings:
                print(f"  [WARN]  {warn}")
        print("-" * 50)
        
        if not valid:
            all_valid = False
            
    if all_valid:
        print("All solution packs validated successfully.")
        sys.exit(0)
    else:
        print("One or more solution packs failed validation.")
        sys.exit(1)


if __name__ == "__main__":
    main()
