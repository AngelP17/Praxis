from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from astraea.decision.integrity import DecisionIntegrityEngine
from astraea.decision.calibration import FeedbackCalibrationEngine
from astraea.reasoning.counterfactual import CounterfactualReplayEngine
from astraea.reasoning.causal_replay import CausalIncidentGraphBuilder


def build_decision_explanation(
    ticket_id: str,
    decision_id: str,
    priority_score: float,
    confidence_score: float,
    root_cause_hypothesis: str,
    feedback_records: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Build a decision explanation with integrity score, provenance graph, counterfactuals, and calibration trace."""
    now = datetime.now(UTC)

    # Build a minimal incident graph from the decision context
    builder = CausalIncidentGraphBuilder(incident_id=ticket_id, reference_time=now)
    builder.add_signal(
        node_id=f"sig-{ticket_id}",
        source_id="astraea-decision-pipeline",
        source_reliability=0.9,
        timestamp=now,
        confidence=confidence_score,
        severity="high" if priority_score >= 80 else "medium" if priority_score >= 50 else "low",
        payload={"priority_score": priority_score, "root_cause": root_cause_hypothesis},
    )
    builder.add_ticket(
        node_id=f"ticket-{ticket_id}",
        source_id="operator-system",
        source_reliability=0.85,
        timestamp=now,
        confidence=0.9,
        severity="info",
        payload={"ticket_id": ticket_id},
    )
    builder.add_runbook(
        node_id=f"rb-{ticket_id}",
        source_id="runbook-db",
        timestamp=now,
        payload={"hypothesis": root_cause_hypothesis},
    )
    graph = builder.build()

    # Compute integrity score
    has_been_reviewed = bool(feedback_records)
    integrity_engine = DecisionIntegrityEngine(graph)
    integrity_report = integrity_engine.compute(decision_id, has_been_reviewed=has_been_reviewed)

    # Compute counterfactuals
    counterfactual_engine = CounterfactualReplayEngine(graph)
    counterfactual_result = counterfactual_engine.run()

    # Build calibration trace
    calibration_trace: list[dict[str, Any]] = []
    if feedback_records:
        cal_engine = FeedbackCalibrationEngine()
        for rec in feedback_records:
            cal_record = cal_engine.record_feedback(
                decision_id=decision_id,
                feedback_type=rec.get("feedback_type", "approve"),
                operator_id=rec.get("operator_id", "unknown"),
                original_confidence=confidence_score,
                note=rec.get("note", ""),
                preserved_audit_hash=rec.get("audit_hash", ""),
            )
            calibration_trace.append(cal_record.to_dict())

    return {
        "integrity_score": integrity_report.integrity_score.to_dict(),
        "provenance_graph": graph.to_dict(),
        "counterfactuals": counterfactual_result.to_dict(),
        "calibration_trace": calibration_trace,
        "top_causal_factors": integrity_report.top_causal_factors,
        "missing_evidence": integrity_report.missing_evidence,
    }
