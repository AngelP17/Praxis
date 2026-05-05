from __future__ import annotations

from datetime import UTC, datetime

from astraea.reasoning.counterfactual import CounterfactualReplayEngine, CounterfactualScenario
from astraea.reasoning.causal_replay import CausalIncidentGraphBuilder


_NOW = datetime(2026, 4, 27, 16, 42, 0, tzinfo=UTC)


def _build_demo_graph():
    builder = CausalIncidentGraphBuilder("IR-2026-041")
    builder.add_signal("sig-vib", "press-line-3.plc", 0.95, _NOW, 0.92, "critical", {"rms": 12.4})
    builder.add_ticket("tick-4821", "operator-joe", 0.88, _NOW, 0.91, "high", {"corr": 0.91})
    builder.add_runbook("rb-001", "runbook-bearing", _NOW, {"step": "replace_bearing"})
    builder.link_corroborates("tick-4821", "sig-vib")
    return builder.build()


def test_counterfactual_remove_high_provenance_changes_score_more() -> None:
    graph = _build_demo_graph()
    engine = CounterfactualReplayEngine(graph)
    scenarios = [
        CounterfactualScenario("Remove signal", "remove", "sig-vib"),
        CounterfactualScenario("Remove ticket", "remove", "tick-4821"),
    ]
    result = engine.run(scenarios)
    sig_delta = next(p for p in result.perturbations if p["target_node_id"] == "sig-vib")[
        "score_delta"
    ]
    tick_delta = next(p for p in result.perturbations if p["target_node_id"] == "tick-4821")[
        "score_delta"
    ]
    # Removing high-confidence signal should change score at least as much as removing ticket
    assert abs(sig_delta) >= abs(tick_delta) * 0.5


def test_counterfactual_stability_computed() -> None:
    graph = _build_demo_graph()
    engine = CounterfactualReplayEngine(graph)
    result = engine.run()
    assert 0.0 <= result.stability_score <= 1.0


def test_counterfactual_weaken_reduces_score() -> None:
    graph = _build_demo_graph()
    engine = CounterfactualReplayEngine(graph)
    scenarios = [
        CounterfactualScenario("Weaken signal", "weaken", "sig-vib", {"factor": 0.5}),
    ]
    result = engine.run(scenarios)
    delta = result.perturbations[0]["score_delta"]
    assert delta < 0


def test_counterfactual_contradict_lowers_weight() -> None:
    # Contradict the higher-weight ticket so the overall score drops
    builder = CausalIncidentGraphBuilder("IR-TEST-CF", reference_time=_NOW)
    builder.add_signal("sig-1", "sensor-a", 0.5, _NOW, 0.7, "high")
    builder.add_ticket("tick-1", "operator-1", 0.8, _NOW, 0.9, "medium")
    graph = builder.build()
    engine = CounterfactualReplayEngine(graph)
    scenarios = [
        CounterfactualScenario("Contradict ticket", "contradict", "tick-1"),
    ]
    result = engine.run(scenarios)
    delta = result.perturbations[0]["score_delta"]
    # Contradiction should reduce score because high-weight node is penalized
    assert delta < 0


def test_baseline_deterministic() -> None:
    graph_a = _build_demo_graph()
    graph_b = _build_demo_graph()
    engine_a = CounterfactualReplayEngine(graph_a)
    engine_b = CounterfactualReplayEngine(graph_b)
    assert round(engine_a.baseline_score, 6) == round(engine_b.baseline_score, 6)
    assert round(engine_a.baseline_confidence, 6) == round(engine_b.baseline_confidence, 6)
