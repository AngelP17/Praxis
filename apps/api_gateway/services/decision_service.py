from dataclasses import asdict
from datetime import datetime, timezone
import json

from sqlalchemy import text
from sqlalchemy.orm import Session

from apps.api_gateway.services.decision_explanation import build_decision_explanation
from apps.api_gateway.services.graph_service import GraphService
from apps.api_gateway.services.operational_intelligence import (
    compute_live_decision,
    count_similar_cases,
    fetch_ticket_row,
)
from astraea.praxis_decision import decide
from domain.hashing import canonical_hash, replay_identity_bundle
from domain.scenarios import SCENARIOS
from infrastructure.db.models.outbox_message import OutboxMessage


EVENT_POLICY = {
    "version": "operational-resilience-v1",
    "human_review_threshold": 0.45,
}


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
            payload["explanation"] = build_decision_explanation(
                ticket_id=ticket_id,
                decision_id=str(payload["id"]),
                priority_score=payload.get("priority_score", 0.0),
                confidence_score=payload.get("confidence_score", 0.0),
                root_cause_hypothesis=payload.get("root_cause_hypothesis", ""),
                feedback_records=self._load_feedback_records(payload["id"]),
            )
            payload["replay_hash"] = self._load_replay_hash(payload["id"])
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
                    "feature_snapshot_json": json.dumps(decision["feature_snapshot_json"]),
                    "explanation_json": json.dumps(decision["explanation_json"]),
                },
            )
            .mappings()
            .first()
        )

        decision_id = int(inserted["id"])
        decision_ts = (
            inserted["decision_ts"].isoformat()
            if hasattr(inserted["decision_ts"], "isoformat")
            else inserted["decision_ts"]
        )
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
                {**recommendation, "decision_record_id": decision_id},
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
                    'praxis-api',
                    CAST(:payload_json AS JSONB),
                    :source_hash
                )
                """
            ),
            {
                "ticket_pk": ticket["id"],
                "payload_json": json.dumps(
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

    def _load_feedback_records(self, decision_id: int) -> list[dict]:
        rows = self.db.execute(
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
        return [dict(row) for row in rows]

    def _load_replay_hash(self, decision_id: int) -> str:
        row = (
            self.db.execute(
                text("SELECT replay_hash FROM decision_records WHERE id = :decision_id"),
                {"decision_id": decision_id},
            )
            .mappings()
            .first()
        )
        return row["replay_hash"] if row else ""

    def _deserialize_payload(self, payload: object) -> object:
        if isinstance(payload, str):
            try:
                return json.loads(payload)
            except json.JSONDecodeError:
                return payload
        return payload

    def _load_operational_event(self, event_id: str) -> dict[str, object] | None:
        row = (
            self.db.execute(
                text(
                    """
                    SELECT
                        id,
                        event_id,
                        source,
                        source_ref,
                        event_type,
                        asset_id,
                        site,
                        line,
                        severity,
                        occurred_at,
                        payload,
                        normalized_payload
                    FROM operational_events
                    WHERE event_id = :event_id
                    """
                ),
                {"event_id": event_id},
            )
            .mappings()
            .first()
        )
        if not row:
            return None
        event = dict(row)
        event["payload"] = self._deserialize_payload(event.get("payload"))
        event["normalized_payload"] = self._deserialize_payload(event.get("normalized_payload"))
        return event

    def _build_event_identity_bundle(self, event_dict: dict[str, object]) -> dict[str, object]:
        """Canonical event identity bundle for deterministic replay hashing.

        Only includes fields that define the logical identity of the event,
        not auto-generated values (id, event_id, occurred_at) that vary per run.
        """
        payload = event_dict.get("payload") or {}
        if isinstance(payload, str):
            payload = self._deserialize_payload(payload)
        normalized_payload = event_dict.get("normalized_payload") or {}
        if isinstance(normalized_payload, str):
            normalized_payload = self._deserialize_payload(normalized_payload)
        raw_payload = payload
        scenario_id = None
        if isinstance(payload, dict):
            scenario_id = payload.get("scenario_id")
            raw_payload = payload.get("raw", payload)
        if isinstance(normalized_payload, dict):
            scenario_id = scenario_id or normalized_payload.get("scenario_id")
            raw_payload = normalized_payload.get("raw", raw_payload)
        if not isinstance(raw_payload, dict):
            raw_payload = {"value": raw_payload}
        return replay_identity_bundle(
            scenario_id=str(scenario_id) if scenario_id else None,
            source=str(event_dict.get("source", "")),
            event_type=str(event_dict.get("event_type", "")),
            asset_id=str(event_dict.get("asset_id", "")),
            site=str(event_dict.get("site", "")),
            line=str(event_dict.get("line", "")),
            severity=str(event_dict.get("severity", "")),
            payload=raw_payload,
        )

    def evaluate_event(self, payload: dict[str, object]) -> dict[str, object]:
        event_service = __import__(
            "apps.api_gateway.services.event_service", fromlist=["EventService"]
        ).EventService(self.db)
        ingested = event_service.ingest_event(payload)
        event_id = str(ingested["event_id"])
        event_dict = self._load_operational_event(event_id)
        if event_dict is None:
            return {"event_id": event_id, "status": "error"}

        graph = GraphService(self.db)
        asset_ref = event_dict.get("asset_id")
        blast_radius = graph.blast_radius_for_asset(str(asset_ref)) if asset_ref else []
        decision_result = decide(event=event_dict, blast_radius=blast_radius, policy=EVENT_POLICY)
        decision_payload = asdict(decision_result)
        identity_bundle = self._build_event_identity_bundle(event_dict)
        replay_hash = self._compute_replay_hash(identity_bundle)

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
                    "event_pk": event_dict["id"],
                    "feature_snapshot_json": json.dumps(
                        self._build_feature_snapshot(decision_payload)
                    ),
                    "severity_score": decision_result.severity_score,
                    "urgency_score": decision_result.urgency_score,
                    "business_impact_score": decision_result.business_impact_score,
                    "sla_risk_score": decision_result.sla_risk_score,
                    "recurrence_score": decision_result.recurrence_score,
                    "dependency_criticality_score": decision_result.dependency_criticality_score,
                    "actionability_score": decision_result.actionability_score,
                    "uncertainty_penalty": decision_result.uncertainty_penalty,
                    "priority_score": decision_result.priority_score,
                    "root_cause_hypothesis": decision_result.root_cause_hypothesis,
                    "confidence_score": decision_result.confidence_score,
                    "risk_level": decision_result.risk_level,
                    "requires_human_review": 1 if decision_result.requires_human_review else 0,
                    "decision_version": "astraea-v1",
                    "rule_version": decision_result.policy_version,
                    "replay_hash": replay_hash,
                    "explanation_json": json.dumps(decision_result.rationale),
                },
            )
            .mappings()
            .first()
        )

        decision_id = int(inserted["id"])
        decision_ts = (
            inserted["decision_ts"].isoformat()
            if hasattr(inserted["decision_ts"], "isoformat")
            else inserted["decision_ts"]
        )

        # Match scenario from registry to get dynamic runbook and recommendations
        event_type = event_dict.get("event_type", "")
        matching_scenario = None
        for s in SCENARIOS:
            if s.event_type == event_type:
                matching_scenario = s
                break

        action_label = matching_scenario.recommendation if matching_scenario else decision_result.recommendation
        rationale = matching_scenario.rationale if matching_scenario else "Generated by Astraea from event severity, dependency graph, and blast radius."
        recommended_runbook_id = matching_scenario.runbook_id if matching_scenario else "general-incident-response"

        recommendations = [
            {
                "rank": 1,
                "action_type": "workflow",
                "action_label": action_label,
                "rationale": rationale,
                "risk_level": decision_result.risk_level,
                "expected_benefit": "Reduce operational downtime and preserve auditability.",
                "confidence": decision_result.confidence_score,
                "recommended_runbook_id": recommended_runbook_id,
            }
        ]
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
                {"decision_record_id": decision_id, **rec},
            )

        self.db.commit()
        try:
            from apps.api_gateway.services.sse_broadcaster import decision_broadcaster
            decision_broadcaster.broadcast({
                "id": decision_id,
                "event_id": event_id,
                "priority_score": decision_result.priority_score,
                "root_cause_hypothesis": decision_result.root_cause_hypothesis,
                "confidence_score": decision_result.confidence_score,
                "risk_level": decision_result.risk_level,
                "requires_human_review": decision_result.requires_human_review,
                "replay_hash": replay_hash,
                "decision_ts": decision_ts,
            })
        except Exception:
            pass
        return {
            "id": decision_id,
            "event_id": event_id,
            "priority_score": decision_result.priority_score,
            "root_cause_hypothesis": decision_result.root_cause_hypothesis,
            "confidence_score": decision_result.confidence_score,
            "risk_level": decision_result.risk_level,
            "requires_human_review": decision_result.requires_human_review,
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
        payload["explanation"] = build_decision_explanation(
            ticket_id=payload.get("ticket_id", ""),
            decision_id=str(decision_id),
            priority_score=payload.get("priority_score", 0.0),
            confidence_score=payload.get("confidence_score", 0.0),
            root_cause_hypothesis=payload.get("root_cause_hypothesis", ""),
            feedback_records=self._load_feedback_records(decision_id),
        )
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
                SELECT
                    oe.id,
                    oe.event_id,
                    oe.source,
                    oe.source_ref,
                    oe.event_type,
                    oe.asset_id,
                    oe.site,
                    oe.line,
                    oe.severity,
                    oe.payload,
                    oe.normalized_payload,
                    oe.occurred_at
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
        if not event_row:
            return None

        event_dict = dict(event_row)
        event_dict["payload"] = self._deserialize_payload(event_dict.get("payload"))
        event_dict["normalized_payload"] = self._deserialize_payload(
            event_dict.get("normalized_payload")
        )

        graph = GraphService(self.db)
        asset_ref = event_dict.get("asset_id")
        blast_radius = graph.blast_radius_for_asset(str(asset_ref)) if asset_ref else []
        decision_result = decide(event=event_dict, blast_radius=blast_radius, policy=EVENT_POLICY)
        decision_payload = asdict(decision_result)
        identity_bundle = self._build_event_identity_bundle(event_dict)
        replayed_hash = self._compute_replay_hash(identity_bundle)

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

        stored_hash = str(decision.get("replay_hash", ""))
        return {
            "decision": decision,
            "original_event": event_dict,
            "replayed_decision": decision_payload,
            "stored_replay_hash": stored_hash,
            "replayed_hash": replayed_hash,
            "determinism": stored_hash == replayed_hash,
            "deterministic": stored_hash == replayed_hash,
            "feedback": [dict(r) for r in feedback_rows],
            "replayed_at": datetime.now(timezone.utc).isoformat(),
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
        self.db.add(
            OutboxMessage(
                topic="praxis.decision.feedback_recorded",
                payload={
                    "decision_id": decision_id,
                    "feedback_type": feedback_type,
                    "note": note,
                    "next_action": (
                        "queue_remediation_workflow"
                        if feedback_type == "approve"
                        else "stop_workflow"
                    ),
                },
                status="pending",
            )
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
        return canonical_hash(payload)

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
