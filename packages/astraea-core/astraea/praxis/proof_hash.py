"""Deterministic hashing helpers for Praxis proof artifacts."""

from __future__ import annotations

import hashlib
import json
from typing import Any


def canonical_json(payload: Any) -> str:
    """Return stable JSON for hash/replay comparisons."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)


def sha256_digest(payload: Any) -> str:
    """Hash a JSON-serializable payload with a stable sha256 prefix."""
    encoded = canonical_json(payload).encode("utf-8")
    return f"sha256:{hashlib.sha256(encoded).hexdigest()}"


def proof_hash(proof: dict[str, Any]) -> str:
    """Hash a proof object excluding its own mutable proof_hash field."""
    normalized = dict(proof)
    normalized.pop("proof_hash", None)
    return sha256_digest(normalized)
