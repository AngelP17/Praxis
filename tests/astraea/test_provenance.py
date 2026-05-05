from __future__ import annotations

from datetime import UTC, datetime

from astraea.reasoning.provenance import ProvenanceEngine, ProvenanceRecord


def test_register_creates_record() -> None:
    engine = ProvenanceEngine()
    record = engine.register(
        artifact_id="evt-8f4a21",
        artifact_type="signal",
        generated_by="press-line-3.plc",
        reliability_score=0.95,
        freshness_seconds=120,
    )
    assert isinstance(record, ProvenanceRecord)
    assert record.artifact_id == "evt-8f4a21"
    assert record.reliability_score == 0.95


def test_lineage_returns_upstream_records() -> None:
    engine = ProvenanceEngine()
    engine.register("parent-1", "signal", "sensor-a", 0.9, 60)
    engine.register("child-1", "ticket", "operator", 0.8, 120, derived_from=["parent-1"])
    lineage = engine.get_lineage("child-1")
    artifact_ids = [r.artifact_id for r in lineage]
    assert "child-1" in artifact_ids
    assert "parent-1" in artifact_ids


def test_aggregate_reliability_with_freshness() -> None:
    engine = ProvenanceEngine()
    engine.register("a", "signal", "sensor", 1.0, 0)
    engine.register("b", "signal", "sensor", 1.0, 3600)
    agg = engine.compute_aggregate_reliability(["a", "b"])
    # a is perfectly fresh -> 1.0, b is 1h stale -> 0.0
    assert agg == 0.5


def test_aggregate_reliability_empty() -> None:
    engine = ProvenanceEngine()
    assert engine.compute_aggregate_reliability([]) == 0.0
    assert engine.compute_aggregate_reliability(["missing"]) == 0.0


def test_link_updates_used_by() -> None:
    engine = ProvenanceEngine()
    engine.register("x", "signal", "sensor", 0.9, 0)
    engine.link("x", "decision-1")
    assert "decision-1" in engine.records["x"].used_by
