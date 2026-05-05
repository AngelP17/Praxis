from __future__ import annotations

from dataclasses import dataclass, field, replace
from typing import Any

from domain.models.counterfactual import CounterfactualReplay
from domain.models.evidence import EvidenceNode, IncidentGraph


@dataclass
class CounterfactualScenario:
    """A single counterfactual scenario definition."""

    name: str
    action: str  # "remove", "weaken", "delay", "contradict"
    target_node_id: str
    params: dict[str, Any] = field(default_factory=dict)


class CounterfactualReplayEngine:
    """Engine for counterfactual replay: what if evidence was missing, delayed,
    contradicted, or lower confidence."""

    def __init__(self, incident_graph: IncidentGraph) -> None:
        self.graph = incident_graph
        self.baseline_score = incident_graph.get_provenance_weighted_score()
        self.baseline_confidence = self._compute_baseline_confidence()

    def _compute_baseline_confidence(self) -> float:
        if not self.graph.nodes:
            return 0.0
        return sum(n.confidence for n in self.graph.nodes.values()) / len(self.graph.nodes)

    def run(self, scenarios: list[CounterfactualScenario] | None = None) -> CounterfactualReplay:
        if scenarios is None:
            scenarios = self._default_scenarios()

        result = CounterfactualReplay(
            baseline_score=self.baseline_score,
            baseline_confidence=self.baseline_confidence,
        )

        for scenario in scenarios:
            perturbed = self._apply_perturbation(scenario)
            score_delta = perturbed["score"] - self.baseline_score
            confidence_delta = perturbed["confidence"] - self.baseline_confidence
            result.add_perturbation(
                name=scenario.name,
                action=scenario.action,
                target_node_id=scenario.target_node_id,
                score_delta=score_delta,
                confidence_delta=confidence_delta,
                new_score=perturbed["score"],
                new_confidence=perturbed["confidence"],
            )

        result.stability_score = result.compute_stability()
        return result

    def _default_scenarios(self) -> list[CounterfactualScenario]:
        """Generate default counterfactual scenarios for all evidence nodes."""
        scenarios: list[CounterfactualScenario] = []
        for node_id, node in self.graph.nodes.items():
            scenarios.append(
                CounterfactualScenario(
                    name=f"Remove {node.node_type}:{node_id}",
                    action="remove",
                    target_node_id=node_id,
                )
            )
            if node.source_reliability > 0.3:
                scenarios.append(
                    CounterfactualScenario(
                        name=f"Weaken {node.node_type}:{node_id}",
                        action="weaken",
                        target_node_id=node_id,
                        params={"factor": 0.5},
                    )
                )
        return scenarios

    def _apply_perturbation(self, scenario: CounterfactualScenario) -> dict[str, float]:
        """Apply a perturbation and compute new score/confidence."""
        nodes: list[EvidenceNode] = [replace(n) for n in self.graph.nodes.values()]
        if scenario.action == "remove":
            nodes = [n for n in nodes if n.node_id != scenario.target_node_id]
        elif scenario.action == "weaken":
            factor = scenario.params.get("factor", 0.5)
            for i, n in enumerate(nodes):
                if n.node_id == scenario.target_node_id:
                    nodes[i] = replace(
                        n,
                        source_reliability=n.source_reliability * factor,
                        confidence=n.confidence * factor,
                    )
        elif scenario.action == "delay":
            delay_seconds = scenario.params.get("delay_seconds", 600)
            for i, n in enumerate(nodes):
                if n.node_id == scenario.target_node_id:
                    nodes[i] = replace(n, freshness_seconds=n.freshness_seconds + delay_seconds)
        elif scenario.action == "contradict":
            for i, n in enumerate(nodes):
                if n.node_id == scenario.target_node_id:
                    nodes[i] = replace(
                        n, contradicted_by=n.contradicted_by + ["synthetic_contradiction"]
                    )

        if not nodes:
            return {"score": 0.0, "confidence": 0.0}

        total_weight = 0.0
        weighted_score = 0.0
        total_confidence = 0.0
        for n in nodes:
            w = n.provenance_weight()
            total_weight += w
            weighted_score += n.confidence * w
            total_confidence += n.confidence

        score = weighted_score / total_weight if total_weight > 0 else 0.0
        confidence = total_confidence / len(nodes)
        return {"score": round(score, 4), "confidence": round(confidence, 4)}
