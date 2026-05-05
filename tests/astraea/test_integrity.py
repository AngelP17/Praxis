from __future__ import annotations

from datetime import UTC, datetime

from astraea.decision.integrity import DecisionIntegrityEngine
from astraea.reasoning.causal_replay import CausalIncidentGraphBuilder


def _build_demo_graph():
    builder = CausalIncidentGraphBuilder("IR-2026-041")
    now = datetime.now(UTC)
    builder.add_signal("sig-vib", "press-line-3.plc", 0.95, now, 0.92, "critical")
    builder.add_ticket("tick-4821", "operator-joe", 0.88, now, 0.91, "high")
    builder.add_runbook("rb-001", "runbook-bearing", now)
    builder.add_asset("asset-press-3", "cmms", now)
    builder.link_corroborates("tick-4821", "sig-vib")
    return builder.build()


def test_integrity_score_computed() -> None:
    graph = _build_demo_graph()
    engine = DecisionIntegrityEngine(graph)
    report = engine.compute("dec-001", has_been_reviewed=True)
    score = report.integrity_score.compute()
    assert 0.0 <= score <= 1.0


def test_missing_evidence_reported() -> None:
    builder = CausalIncidentGraphBuilder("IR-TEST-008")
    now = datetime.now(UTC)
    builder.add_signal("sig-1", "sensor-a", 0.9, now, 0.85, "high")
    graph = builder.build()
    engine = DecisionIntegrityEngine(graph)
    report = engine.compute("dec-002")
    assert "ticket" in report.missing_evidence
    assert "runbook" in report.missing_evidence
    assert "asset" in report.missing_evidence


def test_reviewed_boosts_integrity() -> None:
    graph = _build_demo_graph()
    engine = DecisionIntegrityEngine(graph)
    reviewed = engine.compute("dec-003", has_been_reviewed=True)
    unreviewed = engine.compute("dec-003", has_been_reviewed=False)
    assert reviewed.integrity_score.compute() > unreviewed.integrity_score.compute()


def test_contradiction_lowers_integrity() -> None:
    builder = CausalIncidentGraphBuilder("IR-TEST-009")
    now = datetime.now(UTC)
    builder.add_signal("sig-1", "sensor-a", 0.9, now, 0.85, "high")
    builder.add_signal("sig-2", "sensor-b", 0.8, now, 0.2, "low")
    builder.link_contradicts("sig-2", "sig-1")
    graph = builder.build()
    engine = DecisionIntegrityEngine(graph)
    report = engine.compute("dec-004")
    assert report.integrity_score.uncertainty_penalty > 0.0


def test_top_causal_factors_sorted() -> None:
    graph = _build_demo_graph()
    engine = DecisionIntegrityEngine(graph)
    report = engine.compute("dec-005")
    factors = report.top_causal_factors
    assert len(factors) <= 5
    for i in range(len(factors) - 1):
        assert factors[i]["provenance_weight"] >= factors[i + 1]["provenance_weight"]
