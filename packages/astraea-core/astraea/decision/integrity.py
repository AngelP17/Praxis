from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from domain.models.counterfactual import DecisionIntegrityScore
from domain.models.evidence import IncidentGraph


@dataclass
class IntegrityReport:
    """Full integrity report for a decision, including all sub-scores."""

    decision_id: str
    integrity_score: DecisionIntegrityScore
    missing_evidence: list[str] = field(default_factory=list)
    top_causal_factors: list[dict[str, Any]] = field(default_factory=list)
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))

    def to_dict(self) -> dict[str, Any]:
        return {
            "decision_id": self.decision_id,
            "integrity_score": self.integrity_score.to_dict(),
            "missing_evidence": self.missing_evidence,
            "top_causal_factors": self.top_causal_factors,
            "timestamp": self.timestamp.isoformat(),
        }


class DecisionIntegrityEngine:
    """Engine for computing decision integrity scores from evidence coverage,
    provenance weight, counterfactual stability, and replay completeness."""

    def __init__(self, incident_graph: IncidentGraph) -> None:
        self.graph = incident_graph

    def compute(self, decision_id: str, has_been_reviewed: bool = False) -> IntegrityReport:
        evidence_coverage = self.graph.get_evidence_coverage()
        missing_evidence = self._find_missing_evidence()

        replayability = self._compute_replayability()
        counterfactual_stability = self._compute_counterfactual_stability()
        human_review_state = 1.0 if has_been_reviewed else 0.0
        uncertainty_penalty = self._compute_uncertainty_penalty()

        integrity_score = DecisionIntegrityScore(
            replayability=replayability,
            evidence_coverage=evidence_coverage,
            counterfactual_stability=counterfactual_stability,
            human_review_state=human_review_state,
            uncertainty_penalty=uncertainty_penalty,
        )

        top_factors = self._extract_top_causal_factors()

        return IntegrityReport(
            decision_id=decision_id,
            integrity_score=integrity_score,
            missing_evidence=missing_evidence,
            top_causal_factors=top_factors,
        )

    def _find_missing_evidence(self) -> list[str]:
        expected_types = {"signal", "ticket", "runbook", "asset"}
        present_types = {n.node_type for n in self.graph.nodes.values()}
        return sorted(expected_types - present_types)

    def _compute_replayability(self) -> float:
        """Replayability is high when all nodes have audit hashes and the graph is deterministic."""
        if not self.graph.nodes:
            return 0.0
        hashed_nodes = sum(1 for n in self.graph.nodes.values() if n.audit_hash)
        return hashed_nodes / len(self.graph.nodes)

    def _compute_counterfactual_stability(self) -> float:
        """Compute stability by checking how sensitive the score is to removing
        high-provenance nodes."""
        from astraea.reasoning.counterfactual import CounterfactualReplayEngine

        engine = CounterfactualReplayEngine(self.graph)
        result = engine.run()
        return result.compute_stability()

    def _compute_uncertainty_penalty(self) -> float:
        """Penalty increases with missing evidence and contradictory signals."""
        penalty = 0.0
        missing = self._find_missing_evidence()
        penalty += len(missing) * 0.05

        contradiction_count = sum(len(n.contradicted_by) for n in self.graph.nodes.values())
        penalty += contradiction_count * 0.08

        stale_count = sum(1 for n in self.graph.nodes.values() if n.freshness_seconds > 1800)
        penalty += stale_count * 0.02

        return min(0.5, penalty)

    def _extract_top_causal_factors(self) -> list[dict[str, Any]]:
        """Extract top causal factors sorted by provenance weight."""
        factors = []
        for node in self.graph.nodes.values():
            factors.append(
                {
                    "node_id": node.node_id,
                    "node_type": node.node_type,
                    "source_id": node.source_id,
                    "provenance_weight": round(node.provenance_weight(), 4),
                    "confidence": round(node.confidence, 4),
                    "severity": node.severity,
                }
            )
        factors.sort(key=lambda x: x["provenance_weight"], reverse=True)
        return factors[:5]
