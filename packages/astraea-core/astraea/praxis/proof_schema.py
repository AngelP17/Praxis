"""JSON Schema validation for Praxis Proof Protocol objects."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


class ProofSchemaValidationError(ValueError):
    """Raised when a proof violates the PPP schema."""


@lru_cache(maxsize=1)
def load_proof_schema() -> dict[str, Any]:
    for parent in Path(__file__).resolve().parents:
        path = parent / "docs" / "spec" / "proof-object.schema.json"
        if path.is_file():
            return json.loads(path.read_text(encoding="utf-8"))
    raise FileNotFoundError("Could not locate docs/spec/proof-object.schema.json")


def schema_errors(proof: dict[str, Any]) -> list[str]:
    validator = Draft202012Validator(load_proof_schema())
    errors = sorted(validator.iter_errors(proof), key=lambda error: list(error.absolute_path))
    return [f"schema validation error: {error.message}" for error in errors]


def validate_proof_schema(proof: dict[str, Any]) -> None:
    errors = schema_errors(proof)
    if errors:
        raise ProofSchemaValidationError("; ".join(errors))
