from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any


@dataclass
class ProvenanceRecord:
    """W3C-PROV-inspired provenance record for an evidence artifact."""

    artifact_id: str
    artifact_type: str
    generated_by: str
    derived_from: list[str] = field(default_factory=list)
    used_by: list[str] = field(default_factory=list)
    attributed_to: str = ""
    generated_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    reliability_score: float = 0.5
    freshness_seconds: float = 0.0
    audit_hash: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "artifact_id": self.artifact_id,
            "artifact_type": self.artifact_type,
            "generated_by": self.generated_by,
            "derived_from": self.derived_from,
            "used_by": self.used_by,
            "attributed_to": self.attributed_to,
            "generated_at": self.generated_at.isoformat(),
            "reliability_score": round(self.reliability_score, 4),
            "freshness_seconds": round(self.freshness_seconds, 4),
            "audit_hash": self.audit_hash,
        }


class ProvenanceEngine:
    """Engine for tracking evidence lineage, reliability, and freshness."""

    def __init__(self) -> None:
        self.records: dict[str, ProvenanceRecord] = {}

    def register(
        self,
        artifact_id: str,
        artifact_type: str,
        generated_by: str,
        reliability_score: float,
        freshness_seconds: float,
        derived_from: list[str] | None = None,
        attributed_to: str = "",
        audit_hash: str = "",
    ) -> ProvenanceRecord:
        record = ProvenanceRecord(
            artifact_id=artifact_id,
            artifact_type=artifact_type,
            generated_by=generated_by,
            derived_from=derived_from or [],
            reliability_score=reliability_score,
            freshness_seconds=freshness_seconds,
            attributed_to=attributed_to,
            audit_hash=audit_hash,
        )
        self.records[artifact_id] = record
        return record

    def link(self, artifact_id: str, used_by: str) -> None:
        if artifact_id in self.records:
            self.records[artifact_id].used_by.append(used_by)

    def get_lineage(self, artifact_id: str) -> list[ProvenanceRecord]:
        """Return full upstream lineage for an artifact."""
        lineage: list[ProvenanceRecord] = []
        visited: set[str] = set()
        queue = [artifact_id]
        while queue:
            current = queue.pop(0)
            if current in visited:
                continue
            visited.add(current)
            record = self.records.get(current)
            if record:
                lineage.append(record)
                queue.extend(record.derived_from)
        return lineage

    def compute_aggregate_reliability(self, artifact_ids: list[str]) -> float:
        """Compute aggregate reliability for a set of evidence artifacts."""
        if not artifact_ids:
            return 0.0
        scores = []
        for aid in artifact_ids:
            record = self.records.get(aid)
            if record:
                freshness_factor = max(0.0, 1.0 - (record.freshness_seconds / 3600.0))
                scores.append(record.reliability_score * freshness_factor)
        if not scores:
            return 0.0
        return sum(scores) / len(scores)

    def to_dict(self) -> dict[str, Any]:
        return {artifact_id: record.to_dict() for artifact_id, record in self.records.items()}
