from __future__ import annotations

from astraea.decision.calibration import FeedbackCalibrationEngine


def test_approval_increases_calibrated_confidence() -> None:
    engine = FeedbackCalibrationEngine()
    record = engine.record_feedback("dec-1", "approve", "op-a", 0.75)
    assert record.calibrated_confidence > record.original_confidence
    assert record.calibration_delta > 0


def test_rejection_decreases_calibrated_confidence() -> None:
    engine = FeedbackCalibrationEngine()
    record = engine.record_feedback("dec-2", "reject", "op-a", 0.75)
    assert record.calibrated_confidence < record.original_confidence
    assert record.calibration_delta < 0


def test_calibration_offset_bounded() -> None:
    engine = FeedbackCalibrationEngine()
    for i in range(20):
        engine.record_feedback(f"dec-{i}", "reject", "op-b", 0.75)
    state = engine.get_state("op-b")
    assert state.calibrated_offset >= -0.2
    assert state.calibrated_offset <= 0.2


def test_apply_calibration_respects_bounds() -> None:
    engine = FeedbackCalibrationEngine()
    for _ in range(30):
        engine.record_feedback("dec-x", "approve", "op-c", 0.95)
    calibrated = engine.apply_calibration(0.95, "op-c")
    assert 0.0 <= calibrated <= 1.0


def test_audit_hash_preserved() -> None:
    engine = FeedbackCalibrationEngine()
    record = engine.record_feedback("dec-3", "approve", "op-d", 0.8, preserved_audit_hash="abc123")
    assert record.preserved_audit_hash == "abc123"


def test_history_traceable_by_decision() -> None:
    engine = FeedbackCalibrationEngine()
    engine.record_feedback("dec-4", "approve", "op-e", 0.8)
    engine.record_feedback("dec-4", "reject", "op-f", 0.8)
    trace = engine.get_calibration_trace("dec-4")
    assert len(trace) == 2
    assert trace[0].feedback_type == "approve"
    assert trace[1].feedback_type == "reject"


def test_different_operators_independent() -> None:
    engine = FeedbackCalibrationEngine()
    engine.record_feedback("dec-5", "reject", "op-g", 0.8)
    engine.record_feedback("dec-6", "approve", "op-h", 0.8)
    g = engine.get_state("op-g")
    h = engine.get_state("op-h")
    assert g.calibrated_offset < 0
    assert h.calibrated_offset > 0
