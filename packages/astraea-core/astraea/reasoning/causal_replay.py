from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from domain.models.evidence import EvidenceNode, IncidentGraph


@dataclass
class CausalReplayResult:
    """Result of a causal incident graph replay with intervention-style analysis."""

    incident_id: str
    root_cause_node_id: str | None
    cascade_nodes: list[str] = field(default_factory=list)
    intervention_recommendations: list[str] = field(default_factory=list)
    replay_hash: str = ""
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))

    def to_dict(self) -> dict[str, Any]:
        return {
            "incident_id": self.incident_id,
            "root_cause_node_id": self.root_cause_node_id,
            "cascade_nodes": self.cascade_nodes,
            "intervention_recommendations": self.intervention_recommendations,
            "replay_hash": self.replay_hash,
            "timestamp": self.timestamp.isoformat(),
        }


class CausalIncidentGraphBuilder:
    """Builder for causal incident graphs that link signals, tickets, assets,
    prior incidents, runbooks, feedback, and evidence artifacts."""

    def __init__(self, incident_id: str, reference_time: datetime | None = None) -> None:
        self.incident_id = incident_id
        self.reference_time = reference_time or datetime.now(UTC)
        self.graph = IncidentGraph(incident_id=incident_id, created_at=self.reference_time)

    def add_signal(
        self,
        node_id: str,
        source_id: str,
        source_reliability: float,
        timestamp: datetime,
        confidence: float,
        severity: str,
        payload: dict[str, Any] | None = None,
    ) -> None:
        node = EvidenceNode(
            node_id=node_id,
            node_type="signal",
            source_id=source_id,
            source_type="sensor",
            source_reliability=source_reliability,
            timestamp=timestamp,
            freshness_seconds=(self.reference_time - timestamp).total_seconds(),
            confidence=confidence,
            severity=severity,
            payload=payload or {},
        )
        self.graph.add_node(node)

    def add_ticket(
        self,
        node_id: str,
        source_id: str,
        source_reliability: float,
        timestamp: datetime,
        confidence: float,
        severity: str,
        payload: dict[str, Any] | None = None,
    ) -> None:
        node = EvidenceNode(
            node_id=node_id,
            node_type="ticket",
            source_id=source_id,
            source_type="operator",
            source_reliability=source_reliability,
            timestamp=timestamp,
            freshness_seconds=(self.reference_time - timestamp).total_seconds(),
            confidence=confidence,
            severity=severity,
            payload=payload or {},
        )
        self.graph.add_node(node)

    def add_runbook(
        self,
        node_id: str,
        source_id: str,
        timestamp: datetime,
        payload: dict[str, Any] | None = None,
    ) -> None:
        node = EvidenceNode(
            node_id=node_id,
            node_type="runbook",
            source_id=source_id,
            source_type="runbook",
            source_reliability=0.95,
            timestamp=timestamp,
            freshness_seconds=(self.reference_time - timestamp).total_seconds(),
            confidence=0.95,
            severity="info",
            payload=payload or {},
        )
        self.graph.add_node(node)

    def add_asset(
        self,
        node_id: str,
        source_id: str,
        timestamp: datetime,
        payload: dict[str, Any] | None = None,
    ) -> None:
        node = EvidenceNode(
            node_id=node_id,
            node_type="asset",
            source_id=source_id,
            source_type="api",
            source_reliability=0.85,
            timestamp=timestamp,
            freshness_seconds=(self.reference_time - timestamp).total_seconds(),
            confidence=0.85,
            severity="info",
            payload=payload or {},
        )
        self.graph.add_node(node)

    def add_feedback(
        self,
        node_id: str,
        source_id: str,
        timestamp: datetime,
        feedback_type: str,
        payload: dict[str, Any] | None = None,
    ) -> None:
        node = EvidenceNode(
            node_id=node_id,
            node_type="feedback",
            source_id=source_id,
            source_type="operator",
            source_reliability=0.9,
            timestamp=timestamp,
            freshness_seconds=(self.reference_time - timestamp).total_seconds(),
            confidence=0.9,
            severity="info",
            payload={"feedback_type": feedback_type, **(payload or {})},
        )
        self.graph.add_node(node)

    def link_causal(self, from_node: str, to_node: str, weight: float = 0.85) -> None:
        self.graph.add_edge(from_node, to_node, "causal", weight)

    def link_corroborates(self, from_node: str, to_node: str) -> None:
        self.graph.add_edge(from_node, to_node, "corroborates", 0.9)
        if from_node in self.graph.nodes and to_node in self.graph.nodes:
            self.graph.nodes[to_node].corroborated_by.append(from_node)

    def link_contradicts(self, from_node: str, to_node: str) -> None:
        self.graph.add_edge(from_node, to_node, "contradicts", 0.9)
        if from_node in self.graph.nodes and to_node in self.graph.nodes:
            self.graph.nodes[to_node].contradicted_by.append(from_node)

    def set_root_cause(self, node_id: str) -> None:
        self.graph.root_cause_node_id = node_id

    def build(self) -> IncidentGraph:
        return self.graph

    def replay(self) -> CausalReplayResult:
        """Generate a causal replay result with intervention recommendations."""
        result = CausalReplayResult(
            incident_id=self.incident_id,
            root_cause_node_id=self.graph.root_cause_node_id,
            cascade_nodes=[n.node_id for n in self.graph.nodes.values()],
        )

        if self.graph.root_cause_node_id and self.graph.root_cause_node_id in self.graph.nodes:
            root = self.graph.nodes[self.graph.root_cause_node_id]
            if root.severity in {"critical", "high"}:
                result.intervention_recommendations.append(
                    f"Immediate inspection of {root.source_id} required"
                )
            if root.node_type == "signal":
                result.intervention_recommendations.append(
                    "Capture additional telemetry samples before intervention"
                )

        missing_types = {"signal", "ticket", "runbook", "asset"} - {
            n.node_type for n in self.graph.nodes.values()
        }
        if missing_types:
            result.intervention_recommendations.append(
                f"Collect missing evidence types: {', '.join(sorted(missing_types))}"
            )

        import hashlib
        import json

        canonical = json.dumps(self.graph.to_dict(), sort_keys=True, separators=(",", ":"))
        result.replay_hash = hashlib.sha256(canonical.encode()).hexdigest()[:32]

        return result
