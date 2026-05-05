from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any

from domain.models.counterfactual import FeedbackCalibration


@dataclass
class CalibrationState:
    """Current calibration state for an operator or decision type."""

    operator_id: str
    approve_count: int = 0
    reject_count: int = 0
    override_count: int = 0
    edit_count: int = 0
    calibrated_offset: float = 0.0
    last_updated: datetime = field(default_factory=lambda: datetime.now(UTC))

    def to_dict(self) -> dict[str, Any]:
        return {
            "operator_id": self.operator_id,
            "approve_count": self.approve_count,
            "reject_count": self.reject_count,
            "override_count": self.override_count,
            "edit_count": self.edit_count,
            "calibrated_offset": round(self.calibrated_offset, 4),
            "last_updated": self.last_updated.isoformat(),
        }


class FeedbackCalibrationEngine:
    """Engine for converting approve/reject/edit feedback into calibration updates
    while preserving original audit records."""

    def __init__(self) -> None:
        self.states: dict[str, CalibrationState] = {}
        self.history: list[FeedbackCalibration] = []

    def get_state(self, operator_id: str) -> CalibrationState:
        if operator_id not in self.states:
            self.states[operator_id] = CalibrationState(operator_id=operator_id)
        return self.states[operator_id]

    def record_feedback(
        self,
        decision_id: str,
        feedback_type: str,
        operator_id: str,
        original_confidence: float,
        note: str = "",
        preserved_audit_hash: str = "",
    ) -> FeedbackCalibration:
        state = self.get_state(operator_id)

        if feedback_type == "approve":
            state.approve_count += 1
            # Approvals slightly increase future confidence for this operator
            state.calibrated_offset += 0.01
        elif feedback_type == "reject":
            state.reject_count += 1
            # Rejections decrease future confidence for this operator
            state.calibrated_offset -= 0.03
        elif feedback_type == "override":
            state.override_count += 1
            state.calibrated_offset -= 0.02
        elif feedback_type == "edit":
            state.edit_count += 1
            state.calibrated_offset += 0.005

        state.calibrated_offset = max(-0.2, min(0.2, state.calibrated_offset))
        state.last_updated = datetime.now(UTC)

        calibrated_confidence = max(0.0, min(1.0, original_confidence + state.calibrated_offset))
        calibration_delta = calibrated_confidence - original_confidence

        record = FeedbackCalibration(
            decision_id=decision_id,
            feedback_type=feedback_type,
            operator_id=operator_id,
            original_confidence=original_confidence,
            calibrated_confidence=calibrated_confidence,
            calibration_delta=calibration_delta,
            timestamp=datetime.now(UTC).isoformat(),
            note=note,
            preserved_audit_hash=preserved_audit_hash,
        )
        self.history.append(record)
        return record

    def apply_calibration(self, base_confidence: float, operator_id: str) -> float:
        """Apply an operator's calibration offset to a base confidence score."""
        state = self.get_state(operator_id)
        return max(0.0, min(1.0, base_confidence + state.calibrated_offset))

    def get_calibration_trace(self, decision_id: str) -> list[FeedbackCalibration]:
        return [h for h in self.history if h.decision_id == decision_id]

    def to_dict(self) -> dict[str, Any]:
        return {
            "states": {k: v.to_dict() for k, v in self.states.items()},
            "history_count": len(self.history),
        }
