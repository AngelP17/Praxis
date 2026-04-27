from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

from apps.api_gateway.services.operational_intelligence import (
    compute_live_decision,
    count_similar_cases,
    fetch_ticket_row,
)


class DecisionService:
    def __init__(self, db: Session):
        self.db = db

    def get_latest_decision(self, ticket_id: str, persist_if_missing: bool = True):
        existing = (
            self.db.execute(
                text(
                    """
                SELECT
                    dr.id,
                    t.ticket_id,
                    dr.priority_score,
                    dr.severity_score,
                    dr.urgency_score,
                    dr.business_impact_score,
                    dr.sla_risk_score,
                    dr.recurrence_score,
                    dr.dependency_criticality_score,
                    dr.actionability_score,
                    dr.uncertainty_penalty,
                    dr.root_cause_hypothesis,
                    dr.confidence_score,
                    dr.decision_ts
                FROM decision_records dr
                JOIN tickets t ON t.id = dr.ticket_id
                WHERE t.ticket_id = :ticket_id
                ORDER BY dr.decision_ts DESC, dr.id DESC
                LIMIT 1
                """
                ),
                {"ticket_id": ticket_id},
            )
            .mappings()
            .first()
        )
        if existing:
            payload = dict(existing)
            payload["recommendations"] = self._load_recommendations(payload["id"])
            return payload
        if not persist_if_missing:
            ticket = fetch_ticket_row(self.db, ticket_id)
            if ticket is None:
                return None
            return compute_live_decision(ticket, count_similar_cases(self.db, ticket))
        return self.recompute_decision(ticket_id)

    def recompute_decision(self, ticket_id: str):
        ticket = fetch_ticket_row(self.db, ticket_id)
        if ticket is None:
            return None

        similar_cases_count = count_similar_cases(self.db, ticket)
        decision = compute_live_decision(ticket, similar_cases_count)

        inserted = (
            self.db.execute(
                text(
                    """
                INSERT INTO decision_records (
                    ticket_id,
                    decision_ts,
                    feature_snapshot_json,
                    severity_score,
                    urgency_score,
                    business_impact_score,
                    sla_risk_score,
                    recurrence_score,
                    dependency_criticality_score,
                    actionability_score,
                    uncertainty_penalty,
                    priority_score,
                    root_cause_hypothesis,
                    confidence_score,
                    decision_version,
                    rule_version,
                    model_version,
                    explanation_json
                )
                VALUES (
                    :ticket_pk,
                    CURRENT_TIMESTAMP,
                    CAST(:feature_snapshot_json AS JSONB),
                    :severity_score,
                    :urgency_score,
                    :business_impact_score,
                    :sla_risk_score,
                    :recurrence_score,
                    :dependency_criticality_score,
                    :actionability_score,
                    :uncertainty_penalty,
                    :priority_score,
                    :root_cause_hypothesis,
                    :confidence_score,
                    'v1',
                    'rules-2026-04',
                    NULL,
                    CAST(:explanation_json AS JSONB)
                )
                RETURNING id, decision_ts
                """
                ),
                {
                    **decision,
                    "ticket_pk": ticket["id"],
                    "feature_snapshot_json": __import__("json").dumps(
                        decision["feature_snapshot_json"]
                    ),
                    "explanation_json": __import__("json").dumps(decision["explanation_json"]),
                },
            )
            .mappings()
            .first()
        )

        decision_id = int(inserted["id"])
        decision_ts = inserted["decision_ts"].isoformat() if hasattr(inserted["decision_ts"], "isoformat") else inserted["decision_ts"]
        self.db.execute(
            text(
                """
                DELETE FROM recommendations
                WHERE decision_record_id = :decision_id
                """
            ),
            {"decision_id": decision_id},
        )
        for recommendation in decision["recommendations"]:
            self.db.execute(
                text(
                    """
                    INSERT INTO recommendations (
                        decision_record_id,
                        rank,
                        action_type,
                        action_label,
                        rationale,
                        risk_level,
                        expected_benefit,
                        confidence,
                        requires_approval,
                        recommended_runbook_id,
                        status
                    )
                    VALUES (
                        :decision_record_id,
                        :rank,
                        :action_type,
                        :action_label,
                        :rationale,
                        :risk_level,
                        :expected_benefit,
                        :confidence,
                        FALSE,
                        :recommended_runbook_id,
                        'proposed'
                    )
                    """
                ),
                {
                    **recommendation,
                    "decision_record_id": decision_id,
                },
            )

        self.db.execute(
            text(
                """
                INSERT INTO ticket_events (
                    ticket_id,
                    event_type,
                    event_ts,
                    actor_type,
                    actor_id,
                    payload_json,
                    source_hash
                )
                VALUES (
                    :ticket_pk,
                    'decision_generated',
                    CURRENT_TIMESTAMP,
                    'system',
                    'aether-api',
                    CAST(:payload_json AS JSONB),
                    :source_hash
                )
                """
            ),
            {
                "ticket_pk": ticket["id"],
                "payload_json": __import__("json").dumps(
                    {
                        "priority_score": decision["priority_score"],
                        "root_cause_hypothesis": decision["root_cause_hypothesis"],
                    }
                ),
                "source_hash": ticket.get("source_hash"),
            },
        )

        self.db.execute(
            text(
                """
                UPDATE tickets
                SET clean_summary = :clean_summary,
                    source_hash = COALESCE(source_hash, :source_hash),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :ticket_pk
                """
            ),
            {
                "ticket_pk": ticket["id"],
                "clean_summary": decision["clean_summary"],
                "source_hash": ticket.get("source_hash"),
            },
        )
        self.db.commit()

        return {
            "id": decision_id,
            "ticket_id": ticket["ticket_id"],
            "priority_score": decision["priority_score"],
            "severity_score": decision["severity_score"],
            "urgency_score": decision["urgency_score"],
            "business_impact_score": decision["business_impact_score"],
            "sla_risk_score": decision["sla_risk_score"],
            "recurrence_score": decision["recurrence_score"],
            "dependency_criticality_score": decision["dependency_criticality_score"],
            "actionability_score": decision["actionability_score"],
            "uncertainty_penalty": decision["uncertainty_penalty"],
            "root_cause_hypothesis": decision["root_cause_hypothesis"],
            "confidence_score": decision["confidence_score"],
            "decision_ts": decision_ts,
            "recommendations": self._load_recommendations(decision_id),
        }

    def _load_recommendations(self, decision_id: int) -> list[dict]:
        rows = self.db.execute(
            text(
                """
                SELECT
                    id,
                    rank,
                    action_type,
                    action_label,
                    rationale,
                    risk_level,
                    expected_benefit,
                    confidence,
                    recommended_runbook_id,
                    status
                FROM recommendations
                WHERE decision_record_id = :decision_id
                ORDER BY rank ASC, id ASC
                """
            ),
            {"decision_id": decision_id},
        ).mappings()
        return [dict(row) for row in rows]

    def evaluate_event(self, payload: dict[str, object]) -> dict[str, object]:
        import uuid
        from datetime import datetime

        event_id = payload.get("event_id") or f"evt_{uuid.uuid4().hex[:12]}"
        payload = {**payload, "event_id": event_id}
        event_service = __import__(
            "apps.api_gateway.services.event_service", fromlist=["EventService"]
        ).EventService(self.db)
        event_service.ingest_event(payload)

        event_row = (
            self.db.execute(
                text("SELECT id FROM operational_events WHERE event_id = :event_id"),
                {"event_id": event_id},
            )
            .mappings()
            .first()
        )
        event_pk = event_row["id"] if event_row else None

        priority_score = self._compute_priority_score(payload)
        replay_hash = self._compute_replay_hash(payload)

        inserted = (
            self.db.execute(
                text(
                    """
                INSERT INTO decision_records (
                    event_id, decision_ts, feature_snapshot_json, severity_score, urgency_score,
                    business_impact_score, sla_risk_score, recurrence_score, dependency_criticality_score,
                    actionability_score, uncertainty_penalty, priority_score, root_cause_hypothesis,
                    confidence_score, risk_level, requires_human_review, decision_version, rule_version,
                    replay_hash, explanation_json
                )
                VALUES (
                    :event_pk, CURRENT_TIMESTAMP, :feature_snapshot_json, :severity_score, :urgency_score,
                    :business_impact_score, :sla_risk_score, :recurrence_score, :dependency_criticality_score,
                    :actionability_score, :uncertainty_penalty, :priority_score, :root_cause_hypothesis,
                    :confidence_score, :risk_level, :requires_human_review, :decision_version, :rule_version,
                    :replay_hash, :explanation_json
                )
                RETURNING id, decision_ts
                """
                ),
                {
                    "event_pk": event_pk,
                    "feature_snapshot_json": __import__("json").dumps(
                        self._build_feature_snapshot(payload)
                    ),
                    "severity_score": payload.get("severity_score", 0.5),
                    "urgency_score": payload.get("urgency_score", 0.5),
                    "business_impact_score": payload.get("business_impact_score", 0.5),
                    "sla_risk_score": payload.get("sla_risk_score", 0.5),
                    "recurrence_score": payload.get("recurrence_score", 0.0),
                    "dependency_criticality_score": payload.get(
                        "dependency_criticality_score", 0.5
                    ),
                    "actionability_score": payload.get("actionability_score", 0.5),
                    "uncertainty_penalty": payload.get("uncertainty_penalty", 0.0),
                    "priority_score": priority_score,
                    "root_cause_hypothesis": payload.get("root_cause_hypothesis", "unknown"),
                    "confidence_score": payload.get("confidence_score", 0.7),
                    "risk_level": payload.get("risk_level", "medium"),
                    "requires_human_review": 1 if payload.get("requires_human_review", True) else 0,
                    "decision_version": "astraea-v1",
                    "rule_version": "rules-2026-q2",
                    "replay_hash": replay_hash,
                    "explanation_json": __import__("json").dumps(self._build_explanation(payload)),
                },
            )
            .mappings()
            .first()
        )

        decision_id = int(inserted["id"])
        decision_ts = inserted["decision_ts"].isoformat() if hasattr(inserted["decision_ts"], "isoformat") else inserted["decision_ts"]

        recommendations = payload.get("recommendations", self._default_recommendations(payload))
        for rec in recommendations:
            self.db.execute(
                text(
                    """
                    INSERT INTO recommendations (
                        decision_record_id, rank, action_type, action_label, rationale,
                        risk_level, expected_benefit, confidence, recommended_runbook_id, status
                    )
                    VALUES (
                        :decision_record_id, :rank, :action_type, :action_label, :rationale,
                        :risk_level, :expected_benefit, :confidence, :recommended_runbook_id, 'proposed'
                    )
                    """
                ),
                {
                    "decision_record_id": decision_id,
                    "rank": rec.get("rank", 1),
                    "action_type": rec.get("action_type", "runbook"),
                    "action_label": rec.get("action_label", "Review incident"),
                    "rationale": rec.get("rationale", "Automated recommendation"),
                    "risk_level": rec.get("risk_level", "medium"),
                    "expected_benefit": rec.get("expected_benefit", ""),
                    "confidence": rec.get("confidence", 0.7),
                    "recommended_runbook_id": rec.get("recommended_runbook_id"),
                },
            )

        self.db.commit()
        return {
            "id": decision_id,
            "event_id": event_id,
            "priority_score": priority_score,
            "root_cause_hypothesis": payload.get("root_cause_hypothesis", "unknown"),
            "confidence_score": payload.get("confidence_score", 0.7),
            "risk_level": payload.get("risk_level", "medium"),
            "requires_human_review": payload.get("requires_human_review", True),
            "replay_hash": replay_hash,
            "recommendations": self._load_recommendations(decision_id),
            "decision_ts": decision_ts,
        }

    def get_decision_by_id(self, decision_id: int) -> dict[str, object] | None:
        row = (
            self.db.execute(
                text(
                    """
                SELECT
                    dr.id, dr.decision_ts, dr.priority_score, dr.severity_score, dr.urgency_score,
                    dr.business_impact_score, dr.sla_risk_score, dr.recurrence_score,
                    dr.dependency_criticality_score, dr.actionability_score, dr.uncertainty_penalty,
                    dr.root_cause_hypothesis, dr.confidence_score, dr.risk_level,
                    dr.requires_human_review, dr.replay_hash, dr.decision_version, dr.rule_version,
                    oe.event_id
                FROM decision_records dr
                LEFT JOIN operational_events oe ON oe.id = dr.event_id
                WHERE dr.id = :decision_id
                """
                ),
                {"decision_id": decision_id},
            )
            .mappings()
            .first()
        )
        if not row:
            return None
        payload = dict(row)
        payload["recommendations"] = self._load_recommendations(decision_id)
        payload["event_id"] = payload.get("event_id")
        payload["requires_human_review"] = bool(payload.get("requires_human_review", 1))
        return payload

    def get_latest_decision_for_event(self, event_id: str) -> dict[str, object] | None:
        row = (
            self.db.execute(
                text(
                    """
                SELECT dr.id
                FROM decision_records dr
                JOIN operational_events oe ON oe.id = dr.event_id
                WHERE oe.event_id = :event_id
                ORDER BY dr.decision_ts DESC
                LIMIT 1
                """
                ),
                {"event_id": event_id},
            )
            .mappings()
            .first()
        )
        if not row:
            return None
        return self.get_decision_by_id(row["id"])

    def replay_decision(self, decision_id: int) -> dict[str, object] | None:
        decision = self.get_decision_by_id(decision_id)
        if not decision:
            return None
        event_row = (
            self.db.execute(
                text(
                    """
                SELECT oe.event_id, oe.payload, oe.normalized_payload, oe.occurred_at
                FROM decision_records dr
                JOIN operational_events oe ON oe.id = dr.event_id
                WHERE dr.id = :decision_id
                """
                ),
                {"decision_id": decision_id},
            )
            .mappings()
            .first()
        )
        feedback_rows = self.db.execute(
            text(
                """
                SELECT actor, feedback_type, feedback_value, note, created_at
                FROM human_feedback
                WHERE decision_id = :decision_id
                ORDER BY created_at ASC
                """
            ),
            {"decision_id": decision_id},
        ).mappings()
        return {
            "decision": decision,
            "original_event": dict(event_row) if event_row else None,
            "feedback": [dict(r) for r in feedback_rows],
            "replayed_at": datetime.utcnow().isoformat(),
        }

    def record_feedback(self, decision_id: int, feedback_type: str, note: str) -> dict[str, object]:
        self.db.execute(
            text(
                """
                INSERT INTO human_feedback (decision_id, actor, feedback_type, feedback_value, note)
                VALUES (:decision_id, :actor, :feedback_type, :feedback_value, :note)
                """
            ),
            {
                "decision_id": decision_id,
                "actor": "operator",
                "feedback_type": feedback_type,
                "feedback_value": feedback_type,
                "note": note,
            },
        )
        self.db.execute(
            text(
                """
                UPDATE recommendations
                SET status = :status
                WHERE decision_record_id = :decision_id
                  AND status = 'proposed'
                """
            ),
            {
                "decision_id": decision_id,
                "status": "accepted" if feedback_type == "approve" else "rejected",
            },
        )
        self.db.commit()
        return {"decision_id": decision_id, "feedback_type": feedback_type, "status": "recorded"}

    def _compute_priority_score(self, payload: dict[str, object]) -> float:
        scores = [
            payload.get("severity_score", 0.5),
            payload.get("urgency_score", 0.5),
            payload.get("business_impact_score", 0.5),
            payload.get("sla_risk_score", 0.5),
            payload.get("actionability_score", 0.5),
        ]
        penalty = payload.get("uncertainty_penalty", 0.0)
        return round(sum(scores) / len(scores) - penalty, 4)

    def _compute_replay_hash(self, payload: dict[str, object]) -> str:
        import hashlib, json

        canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        return f"sha256:{hashlib.sha256(canonical.encode()).hexdigest()[:32]}"

    def _build_feature_snapshot(self, payload: dict[str, object]) -> dict[str, object]:
        return {
            "severity": payload.get("severity_score", 0.5),
            "urgency": payload.get("urgency_score", 0.5),
            "business_impact": payload.get("business_impact_score", 0.5),
            "sla_risk": payload.get("sla_risk_score", 0.5),
            "recurrence": payload.get("recurrence_score", 0.0),
            "dependency_criticality": payload.get("dependency_criticality_score", 0.5),
            "actionability": payload.get("actionability_score", 0.5),
            "uncertainty_penalty": payload.get("uncertainty_penalty", 0.0),
        }

    def _build_explanation(self, payload: dict[str, object]) -> dict[str, object]:
        return {
            "why_flagged": payload.get("why_flagged", "Event triggered decision pipeline"),
            "top_factors": payload.get("top_factors", ["severity", "urgency", "business_impact"]),
            "feature_weights": self._build_feature_snapshot(payload),
        }

    def _default_recommendations(self, payload: dict[str, object]) -> list[dict[str, object]]:
        return [
            {
                "rank": 1,
                "action_type": "runbook",
                "action_label": payload.get("recommended_action", "Review incident"),
                "rationale": payload.get(
                    "rationale", "Automated recommendation from event scoring"
                ),
                "risk_level": payload.get("risk_level", "medium"),
                "expected_benefit": "Resolve incident within SLA",
                "confidence": payload.get("confidence_score", 0.7),
                "recommended_runbook_id": payload.get("recommended_runbook_id"),
            }
        ]
