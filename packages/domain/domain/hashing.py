import hashlib
import json
from typing import Any


def replay_identity_bundle(
    *,
    source: str,
    event_type: str,
    asset_id: str,
    site: str,
    line: str,
    payload: dict[str, Any],
    scenario_id: str | None = None,
    severity: str | None = None,
) -> dict[str, Any]:
    """Canonical identity bundle used for replay hashing.

    This is the shared cross-service contract for deterministic replay hashes.
    Values that may vary between runs, such as database ids or timestamps, are
    intentionally excluded.
    """
    bundle: dict[str, Any] = {
        "source": source,
        "event_type": event_type,
        "asset_id": asset_id,
        "site": site,
        "line": line,
        "payload": payload,
    }
    if scenario_id:
        bundle["scenario_id"] = scenario_id
    if severity:
        bundle["severity"] = severity
    return bundle


def canonical_hash(input_bundle: dict[str, Any]) -> str:
    """Deterministic replay hash from a canonical input bundle.

    Uses sorted-key JSON canonicalisation + SHA-256 (32 hex chars)
    to produce the same result for the same logical input.  This is
    the single source of truth for Praxis replay-hash generation.

    The caller is responsible for assembling the input bundle from
    the scenario/event fields that define replay determinism:
    scenario_id, source, event_type, asset_id, site, line, and
    the canonical JSON of the payload.
    """
    canonical = json.dumps(
        input_bundle,
        sort_keys=True,
        separators=(",", ":"),
        default=_json_default,
    )
    digest = hashlib.sha256(canonical.encode()).hexdigest()[:32]
    return f"sha256:{digest}"


def scenario_replay_hash(
    scenario_id: str,
    source: str,
    event_type: str,
    asset_id: str,
    site: str,
    line: str,
    severity: str,
    payload: dict[str, Any],
) -> str:
    """Deterministic replay hash for a scenario.

    Bundles the canonical fields and delegates to canonical_hash().
    """
    return canonical_hash(
        replay_identity_bundle(
            scenario_id=scenario_id,
            source=source,
            event_type=event_type,
            asset_id=asset_id,
            site=site,
            line=line,
            severity=severity,
            payload=payload,
        )
    )


def _json_default(obj: Any) -> str:
    if hasattr(obj, "isoformat"):
        return obj.isoformat()
    return str(obj)
