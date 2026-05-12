import json
import hashlib
from datetime import datetime


class ReplayExporter:
    def export(self, run_id: str, events: list[dict], decisions: list[dict]) -> dict:
        canonical_events = json.dumps(events, sort_keys=True, separators=(",", ":"))
        canonical_decisions = json.dumps(decisions, sort_keys=True, separators=(",", ":"))

        replay_hash = hashlib.sha256((canonical_events + canonical_decisions).encode()).hexdigest()[
            :32
        ]

        return {
            "run_id": run_id,
            "replay_hash": f"sha256:{replay_hash}",
            "events": events,
            "decisions": decisions,
            "event_count": len(events),
            "decision_count": len(decisions),
            "exported_at": datetime.utcnow().isoformat(),
        }

    def verify(self, replay: dict) -> bool:
        expected = replay.get("replay_hash", "")
        canonical_events = json.dumps(
            replay.get("events", []), sort_keys=True, separators=(",", ":")
        )
        canonical_decisions = json.dumps(
            replay.get("decisions", []), sort_keys=True, separators=(",", ":")
        )

        computed = hashlib.sha256((canonical_events + canonical_decisions).encode()).hexdigest()[
            :32
        ]

        return f"sha256:{computed}" == expected
