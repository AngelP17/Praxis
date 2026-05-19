"""IAM role-based access control service for the Floci client.

Wraps the raw Floci client to enforce role-based access control.
Supports reader (read-only) and writer (read-write) access levels.
"""

import json
from pathlib import Path
from typing import Any

# Path to IAM role policy files (4 levels up to repo root, then into infrastructure/iam)
IAM_DIR = Path(__file__).resolve().parents[4] / "infrastructure" / "iam"

# Role-to-policy mapping
ROLE_POLICIES: dict[str, str] = {
    "reader": "praxis-fieldlab-reader.json",
    "writer": "praxis-fieldlab-writer.json",
}


class IamRoleService:
    """Role-based access control for Floci API operations.

    Wraps an existing Floci client and enforces role-based permissions
    on all AWS API calls by validating requested actions against
    IAM role policy statements.
    """

    def __init__(self, role: str = "reader"):
        self.role = role
        self.policy: dict[str, Any] = self._load_policy(role)

    def _load_policy(self, role: str) -> dict[str, Any]:
        """Load IAM policy from filesystem."""
        filename = ROLE_POLICIES.get(role)
        if not filename:
            raise ValueError(f"Unknown role: '{role}'. Available: {list(ROLE_POLICIES.keys())}")

        path = IAM_DIR / filename
        if not path.exists():
            raise FileNotFoundError(
                f"IAM policy not found at {path}. Available roles: {list(ROLE_POLICIES.keys())}"
            )

        with open(path) as f:
            return json.load(f)

    def is_allowed(self, action: str) -> bool:
        """Check if a specific AWS action is allowed for the role."""
        for statement in self.policy.get("Statement", []):
            if statement.get("Effect") != "Allow":
                continue
            allowed_actions = statement.get("Action", [])
            if isinstance(allowed_actions, str):
                allowed_actions = [allowed_actions]
            if action in allowed_actions or any(
                pol.endswith("*") and action.startswith(pol.rstrip("*")) for pol in allowed_actions
            ):
                return True
        return False

    def authorize(self, action: str) -> None:
        """Raise PermissionError if action is not allowed."""
        if not self.is_allowed(action):
            raise PermissionError(f"Action '{action}' not allowed for role '{self.role}'")

    def authorize_writer_actions(self, actions: list[str]) -> None:
        """Authorize a list of write operations."""
        for action in actions:
            self.authorize(action)

    @property
    def allowed_actions(self) -> list[str]:
        """Return list of all allowed actions for this role."""
        allowed = []
        for statement in self.policy.get("Statement", []):
            actions = statement.get("Action", [])
            if isinstance(actions, str):
                allowed.append(actions)
            else:
                allowed.extend(actions)
        return allowed


def get_iam_service(role: str = "reader") -> IamRoleService:
    """Factory to create role-aware IAM service."""
    return IamRoleService(role)


def get_writer_service() -> IamRoleService:
    """Factory to create write-level IAM service."""
    return IamRoleService("writer")


def get_reader_service() -> IamRoleService:
    """Factory to create read-level IAM service."""
    return IamRoleService("reader")
