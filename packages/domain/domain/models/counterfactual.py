from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class CounterfactualReplay:
    """Result of a counterfactual replay: what happens when evidence is removed, weakened, delayed, or contradicted."""

    baseline_score: float
    baseline_confidence: float
    perturbations: list[dict[str, Any]] = field(default_factory=list)
    stability_score: float = 0.0

    def add_perturbation(
        self,
        name: str,
        action: str,  # "remove", "weaken", "delay", "contradict"
        target_node_id: str,
        score_delta: float,
        confidence_delta: float,
        new_score: float,
        new_confidence: float,
    ) -> None:
        self.perturbations.append(
            {
                "name": name,
                "action": action,
                "target_node_id": target_node_id,
                "score_delta": round(score_delta, 4),
                "confidence_delta": round(confidence_delta, 4),
                "new_score": round(new_score, 4),
                "new_confidence": round(new_confidence, 4),
            }
        )

    def compute_stability(self) -> float:
        """Stability is inverse of average absolute score delta."""
        if not self.perturbations:
            return 1.0
        avg_delta = sum(abs(p["score_delta"]) for p in self.perturbations) / len(self.perturbations)
        return max(0.0, 1.0 - avg_delta)

    def to_dict(self) -> dict[str, Any]:
        return {
            "baseline_score": round(self.baseline_score, 4),
            "baseline_confidence": round(self.baseline_confidence, 4),
            "perturbations": self.perturbations,
            "stability_score": round(self.compute_stability(), 4),
        }


@dataclass
class DecisionIntegrityScore:
    """Composite score combining replayability, evidence coverage, counterfactual stability, and human-review state."""

    replayability: float  # 0.0–1.0 (hash stability + deterministic reproduction)
    evidence_coverage: float  # 0.0–1.0 (fraction of expected evidence types present)
    counterfactual_stability: float  # 0.0–1.0 (inverse sensitivity to evidence perturbation)
    human_review_state: float  # 0.0–1.0 (1.0 if reviewed, 0.0 if pending)
    uncertainty_penalty: float = 0.0  # subtracted from composite

    def compute(self) -> float:
        """Weighted composite integrity score."""
        composite = (
            self.replayability * 0.30
            + self.evidence_coverage * 0.25
            + self.counterfactual_stability * 0.25
            + self.human_review_state * 0.20
            - self.uncertainty_penalty
        )
        return max(0.0, min(1.0, composite))

    def to_dict(self) -> dict[str, Any]:
        return {
            "replayability": round(self.replayability, 4),
            "evidence_coverage": round(self.evidence_coverage, 4),
            "counterfactual_stability": round(self.counterfactual_stability, 4),
            "human_review_state": round(self.human_review_state, 4),
            "uncertainty_penalty": round(self.uncertainty_penalty, 4),
            "integrity_score": round(self.compute(), 4),
        }


@dataclass
class FeedbackCalibration:
    """Human-feedback calibration record: how operator feedback updates future confidence without mutating audit history."""

    decision_id: str
    feedback_type: str  # "approve", "reject", "edit", "override"
    operator_id: str
    original_confidence: float
    calibrated_confidence: float
    calibration_delta: float
    timestamp: str = ""
    note: str = ""
    preserved_audit_hash: str = ""

    def to_dict(self) -> dict[str, Any]:
        return {
            "decision_id": self.decision_id,
            "feedback_type": self.feedback_type,
            "operator_id": self.operator_id,
            "original_confidence": round(self.original_confidence, 4),
            "calibrated_confidence": round(self.calibrated_confidence, 4),
            "calibration_delta": round(self.calibration_delta, 4),
            "timestamp": self.timestamp,
            "note": self.note,
            "preserved_audit_hash": self.preserved_audit_hash,
        }
