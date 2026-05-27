#!/usr/bin/env python3
"""Seed demo users with bcrypt password hashes."""
import json
from pathlib import Path

import bcrypt

DEMO_USERS = [
    {
        "username": "admin",
        "password": "admin",
        "role": "admin",
        "display_name": "Administrator",
    },
    {
        "username": "operator",
        "password": "operator",
        "role": "agent",
        "display_name": "Demo Operator",
    },
    {
        "username": "viewer",
        "password": "viewer",
        "role": "viewer",
        "display_name": "Read-Only Viewer",
    },
]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def seed_users(output_path: Path | None = None) -> None:
    if output_path is None:
        output_path = Path(__file__).resolve().parents[1] / "users.json"

    users = []
    for user in DEMO_USERS:
        users.append(
            {
                "username": user["username"],
                "password_hash": hash_password(user["password"]),
                "role": user["role"],
                "display_name": user["display_name"],
            }
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps({"users": users}, indent=2), encoding="utf-8")
    print(f"Seeded {len(users)} users to {output_path}")


if __name__ == "__main__":
    seed_users()
