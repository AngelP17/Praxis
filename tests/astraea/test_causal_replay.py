from __future__ import annotations

from datetime import UTC, datetime

from astraea.reasoning.causal_replay import CausalIncidentGraphBuilder

_NOW = datetime(2026, 4, 27, 16, 42, 0, tzinfo=UTC)


def test_builder_creates_graph_with_nodes() -> None:
    builder = CausalIncidentGraphBuilder("IR-TEST-001")
    builder.add_signal("sig-1", "sensor-a", 0.9, _NOW, 0.85, "high")
    builder.add_ticket("tick-1", "operator-1", 0.8, _NOW, 0.9, "medium")
    graph = builder.build()
    assert len(graph.nodes) == 2
    assert "sig-1" in graph.nodes
    assert "tick-1" in graph.nodes


def test_corroboration_updates_node() -> None:
    builder = CausalIncidentGraphBuilder("IR-TEST-002")
    builder.add_signal("sig-1", "sensor-a", 0.9, _NOW, 0.85, "high")
    builder.add_ticket("tick-1", "operator-1", 0.8, _NOW, 0.9, "medium")
    builder.link_corroborates("tick-1", "sig-1")
    graph = builder.build()
    assert "tick-1" in graph.nodes["sig-1"].corroborated_by


def test_contradiction_updates_node() -> None:
    builder = CausalIncidentGraphBuilder("IR-TEST-003")
    builder.add_signal("sig-1", "sensor-a", 0.9, _NOW, 0.85, "high")
    builder.add_signal("sig-2", "sensor-b", 0.7, _NOW, 0.2, "low")
    builder.link_contradicts("sig-2", "sig-1")
    graph = builder.build()
    assert "sig-2" in graph.nodes["sig-1"].contradicted_by


def test_replay_hash_is_deterministic() -> None:
    builder_a = CausalIncidentGraphBuilder("IR-TEST-004", reference_time=_NOW)
    builder_b = CausalIncidentGraphBuilder("IR-TEST-004", reference_time=_NOW)
    for b in (builder_a, builder_b):
        b.add_signal("sig-1", "sensor-a", 0.9, _NOW, 0.85, "high")
        b.add_ticket("tick-1", "operator-1", 0.8, _NOW, 0.9, "medium")
    result_a = builder_a.replay()
    result_b = builder_b.replay()
    assert result_a.replay_hash == result_b.replay_hash


def test_replay_recommends_for_critical_root() -> None:
    builder = CausalIncidentGraphBuilder("IR-TEST-005")
    builder.add_signal("sig-1", "sensor-a", 0.9, _NOW, 0.85, "critical")
    builder.set_root_cause("sig-1")
    result = builder.replay()
    assert any("Immediate inspection" in r for r in result.intervention_recommendations)


def test_replay_flags_missing_evidence() -> None:
    builder = CausalIncidentGraphBuilder("IR-TEST-006")
    builder.add_signal("sig-1", "sensor-a", 0.9, _NOW, 0.85, "high")
    result = builder.replay()
    assert any("Collect missing evidence types" in r for r in result.intervention_recommendations)


def test_provenance_weighted_score() -> None:
    builder = CausalIncidentGraphBuilder("IR-TEST-007")
    builder.add_signal("sig-1", "sensor-a", 1.0, _NOW, 0.95, "critical")
    builder.add_signal("sig-2", "sensor-b", 0.5, _NOW, 0.60, "medium")
    graph = builder.build()
    score = graph.get_provenance_weighted_score()
    assert 0.0 < score <= 1.0
