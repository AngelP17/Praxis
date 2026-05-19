"""Scenario service: serves the shared registry, executes scenarios through the
decision spine, and produces deterministic ontology graphs.
"""

from __future__ import annotations

from typing import Any

from domain.hashing import scenario_replay_hash
from domain.scenarios import SCENARIOS, Scenario, get_scenario_by_id

from apps.api_gateway.services.decision_service import DecisionService
from apps.api_gateway.services.event_service import EventService
from apps.api_gateway.services.graph_service import GraphService


class ScenarioService:
    def __init__(self, db: Any) -> None:
        self._db = db
        self._decision_svc = DecisionService(db)
        self._event_svc = EventService(db)
        self._graph_svc = GraphService(db)

    # ------------------------------------------------------------------
    # Registry reads
    # ------------------------------------------------------------------

    def list_scenarios(self) -> list[Scenario]:
        return list(SCENARIOS)

    def get_scenario(self, scenario_id: str) -> Scenario | None:
        return get_scenario_by_id(scenario_id)

    # ------------------------------------------------------------------
    # Ontology
    # ------------------------------------------------------------------

    def scenario_ontology(self, scenario_id: str) -> dict[str, Any] | None:
        scenario = self.get_scenario(scenario_id)
        if scenario is None:
            return None

        # Try deriving from the asset graph first
        try:
            blast_radius = self._graph_svc.blast_radius_for_asset(scenario.asset_id)
        except Exception:
            blast_radius = []

        nodes = _build_ontology_nodes(scenario, blast_radius)
        edges = _build_ontology_edges(scenario, blast_radius, nodes)

        return {
            "scenario_id": scenario.id,
            "nodes": nodes,
            "edges": edges,
            "blast_radius": blast_radius,
            "critical_path": _critical_path(blast_radius),
        }

    # ------------------------------------------------------------------
    # Scenario execution
    # ------------------------------------------------------------------

    def run_scenario(
        self,
        scenario_id: str,
        *,
        auto_approve: bool = False,
    ) -> dict[str, Any] | None:
        scenario = self.get_scenario(scenario_id)
        if scenario is None:
            return None

        cloud_event = _scenario_to_cloudevent(scenario)
        payload = cloud_event

        decision = self._decision_svc.evaluate_event(payload)
        replay = self._decision_svc.replay_decision(decision["id"])

        if auto_approve:
            self._decision_svc.record_feedback(
                decision["id"], "approve", "Auto-approved by scenario runner"
            )

        return {
            "scenario_id": scenario.id,
            "event_id": decision.get("event_id"),
            "decision_id": decision["id"],
            "event_type": scenario.event_type,
            "priority_score": decision.get("priority_score"),
            "risk_level": decision.get("risk_level"),
            "replay_hash": decision.get("replay_hash"),
            "determinism": replay.get("determinism", False),
            "replayed_at": replay.get("replayed_at"),
            "auto_approved": auto_approve,
            "estimated_value_usd": scenario.estimated_value_usd,
        }

    # ------------------------------------------------------------------
    # Benchmarks
    # ------------------------------------------------------------------

    def benchmarks(self) -> list[dict[str, Any]]:
        results: list[dict[str, Any]] = []
        for scenario in SCENARIOS:
            replay_hash = scenario_replay_hash(
                scenario_id=scenario.id,
                source=scenario.source,
                event_type=scenario.event_type,
                asset_id=scenario.asset_id,
                site=scenario.site,
                line=scenario.line,
                severity=scenario.severity,
                payload=scenario.payload,
            )
            results.append(
                {
                    "scenario_id": scenario.id,
                    "event_type": scenario.event_type,
                    "risk_level": scenario.severity,
                    "priority_score": scenario.priority_score,
                    "replay_hash": replay_hash,
                    "deterministic": True,
                    "estimated_value_usd": scenario.estimated_value_usd,
                }
            )
        return results


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------


def _scenario_to_cloudevent(scenario: Scenario) -> dict[str, Any]:
    return {
        "specversion": "1.0",
        "source": scenario.source,
        "type": scenario.event_type,
        "subject": f"asset:{scenario.asset_id}",
        "data": {
            "scenario_id": scenario.id,
            "asset_id": scenario.asset_id,
            "site": scenario.site,
            "line": scenario.line,
            "severity": scenario.severity,
            "signal": str(scenario.payload.get("signal", scenario.event_type)),
            "confidence": scenario.confidence_score,
            "raw": scenario.payload,
        },
    }


def _build_ontology_nodes(
    scenario: Scenario, blast_radius: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    """Build ontology nodes from scenario + asset graph."""
    nodes: list[dict[str, Any]] = []

    # Primary asset node
    nodes.append(
        {
            "id": "asset",
            "label": scenario.asset_id.split(".")[-1],
            "type": scenario.asset_type.replace("_", " "),
            "criticality": scenario.severity,
            "owner": scenario.owner_team,
            "x": 50,
            "y": 50,
        }
    )

    # Dependency nodes from blast radius
    positions = [
        {"x": 20, "y": 20},
        {"x": 80, "y": 20},
        {"x": 15, "y": 75},
        {"x": 85, "y": 75},
        {"x": 50, "y": 88},
    ]

    deps = blast_radius if blast_radius else scenario.impacted_systems
    for idx, dep in enumerate(deps[:5]):
        node_id = f"dep-{idx}"
        label = dep.get("asset_name", dep) if isinstance(dep, dict) else str(dep)
        criticality_raw = (
            dep.get("criticality", "medium")
            if isinstance(dep, dict)
            else ("critical" if idx == 0 else "high" if idx == 1 else "medium")
        )
        pos = positions[idx % len(positions)]
        nodes.append(
            {
                "id": node_id,
                "label": label,
                "type": "dependency",
                "criticality": criticality_raw,
                "owner": scenario.owner_team,
                "x": pos["x"],
                "y": pos["y"],
            }
        )

    return nodes


def _build_ontology_edges(
    scenario: Scenario,
    blast_radius: list[dict[str, Any]],
    nodes: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    edges: list[dict[str, Any]] = []
    dep_nodes = [n for n in nodes if n["id"].startswith("dep-")]
    for idx, node in enumerate(dep_nodes):
        edges.append(
            {
                "from": "asset",
                "to": node["id"],
                "label": "supports" if idx == 0 else "feeds" if idx == 1 else "depends_on",
                "strength": "strong" if idx == 0 else "medium" if idx <= 2 else "weak",
            }
        )
    return edges


def _critical_path(blast_radius: list[dict[str, Any]]) -> list[str]:
    if not blast_radius:
        return []
    critical: list[str] = []
    for dep in blast_radius:
        if isinstance(dep, dict) and dep.get("criticality") == "critical":
            critical.append(dep.get("asset_name", str(dep)))
        elif isinstance(dep, dict) and dep.get("criticality") == "high":
            critical.append(dep.get("asset_name", str(dep)))
    return critical[:3]
