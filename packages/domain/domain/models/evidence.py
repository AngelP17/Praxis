from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any


def _serialize_value(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _node_to_dict(node: EvidenceNode) -> dict[str, Any]:
    return {k: _serialize_value(v) for k, v in node.__dict__.items()}


@dataclass
class EvidenceNode:
    """A single piece of evidence in the incident graph with provenance metadata."""

    node_id: str
    node_type: str  # "signal", "ticket", "runbook", "feedback", "asset", "prior_incident"
    source_id: str
    source_type: str  # "sensor", "operator", "api", "inference", "runbook"
    source_reliability: float  # 0.0–1.0
    timestamp: datetime
    freshness_seconds: float
    confidence: float
    severity: str
    payload: dict[str, Any] = field(default_factory=dict)
    corroborated_by: list[str] = field(default_factory=list)
    contradicted_by: list[str] = field(default_factory=list)
    audit_hash: str = ""

    def provenance_weight(self) -> float:
        """Compute provenance weight based on reliability, freshness, and corroboration."""
        freshness_decay = max(0.0, 1.0 - (self.freshness_seconds / 3600.0))
        corroboration_bonus = min(0.2, len(self.corroborated_by) * 0.05)
        contradiction_penalty = min(0.3, len(self.contradicted_by) * 0.15)
        weight = (
            self.source_reliability * 0.5
            + freshness_decay * 0.3
            + corroboration_bonus
            - contradiction_penalty
        )
        return max(0.0, min(1.0, weight))


@dataclass
class IncidentGraph:
    """Causal incident graph linking signals, tickets, assets, prior incidents, runbooks, feedback, and evidence artifacts."""

    incident_id: str
    nodes: dict[str, EvidenceNode] = field(default_factory=dict)
    edges: list[dict[str, Any]] = field(default_factory=list)
    root_cause_node_id: str | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def add_node(self, node: EvidenceNode) -> None:
        self.nodes[node.node_id] = node

    def add_edge(self, from_node: str, to_node: str, edge_type: str, weight: float) -> None:
        self.edges.append(
            {
                "from": from_node,
                "to": to_node,
                "type": edge_type,
                "weight": weight,
            }
        )

    def get_provenance_weighted_score(self) -> float:
        """Aggregate priority score weighted by evidence provenance."""
        if not self.nodes:
            return 0.0
        total_weight = 0.0
        weighted_score = 0.0
        for node in self.nodes.values():
            w = node.provenance_weight()
            total_weight += w
            weighted_score += node.confidence * w
        if total_weight == 0.0:
            return 0.0
        return weighted_score / total_weight

    def get_evidence_coverage(self) -> float:
        """Fraction of expected evidence types present."""
        expected_types = {"signal", "ticket", "runbook", "asset"}
        present_types = {n.node_type for n in self.nodes.values()}
        return len(present_types & expected_types) / len(expected_types)

    def to_dict(self) -> dict[str, Any]:
        return {
            "incident_id": self.incident_id,
            "nodes": {k: _node_to_dict(v) for k, v in self.nodes.items()},
            "edges": self.edges,
            "root_cause_node_id": self.root_cause_node_id,
            "created_at": self.created_at.isoformat(),
        }
