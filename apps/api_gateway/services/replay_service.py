from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.orm import Session

from apps.api_gateway.services.decision_service import DecisionService
from apps.api_gateway.services.event_service import EventService
from apps.api_gateway.services.operational_intelligence import fetch_similar_cases, fetch_ticket_row
from domain.hashing import scenario_replay_hash
from domain.scenarios import Scenario, get_scenario_by_external_id


class ReplayService:
    def __init__(self, db: Session):
        self.db = db

    def get_replay(self, ticket_id: str) -> dict | None:
        ticket = fetch_ticket_row(self.db, ticket_id)
        if ticket is None:
            return None

        latest_decision = DecisionService(self.db).get_latest_decision(ticket_id)

        decisions = self.db.execute(
            text(
                """
                SELECT
                    dr.id,
                    dr.decision_ts,
                    dr.priority_score,
                    dr.root_cause_hypothesis,
                    dr.confidence_score,
                    dr.explanation_json
                FROM decision_records dr
                JOIN tickets t ON t.id = dr.ticket_id
                WHERE t.ticket_id = :ticket_id
                ORDER BY dr.decision_ts ASC, dr.id ASC
                """
            ),
            {"ticket_id": ticket_id},
        ).mappings()

        feedback = self.db.execute(
            text(
                """
                SELECT
                    ofe.feedback_type,
                    ofe.feedback_note,
                    ofe.feedback_ts,
                    ofe.operator_id
                FROM operator_feedback ofe
                JOIN recommendations r ON r.id = ofe.recommendation_id
                JOIN decision_records dr ON dr.id = r.decision_record_id
                JOIN tickets t ON t.id = dr.ticket_id
                WHERE t.ticket_id = :ticket_id
                ORDER BY ofe.feedback_ts ASC, ofe.id ASC
                """
            ),
            {"ticket_id": ticket_id},
        ).mappings()
        return {
            "ticket_id": ticket_id,
            "latest_decision": latest_decision,
            "decision_history": [
                {
                    "id": row["id"],
                    "decision_ts": row["decision_ts"].isoformat() if hasattr(row["decision_ts"], "isoformat") else row["decision_ts"] if row["decision_ts"] else None,
                    "priority_score": row["priority_score"],
                    "root_cause_hypothesis": row["root_cause_hypothesis"],
                    "confidence_score": row["confidence_score"],
                    "explanation_json": row["explanation_json"],
                }
                for row in decisions
            ],
            "events": EventService(self.db).get_ticket_event_stream(ticket_id),
            "operator_feedback": [
                {
                    "feedback_type": row["feedback_type"],
                    "feedback_note": row["feedback_note"],
                    "feedback_ts": row["feedback_ts"].isoformat() if hasattr(row["feedback_ts"], "isoformat") else row["feedback_ts"] if row["feedback_ts"] else None,
                    "operator_id": row["operator_id"],
                }
                for row in feedback
            ],
            "similar_cases": fetch_similar_cases(self.db, ticket),
        }

    def replay_incident(self, incident_id: str) -> dict | None:
        from apps.api_gateway.services.incident_service import IncidentService

        incident = IncidentService(self.db).get_incident_detail(incident_id)
        if incident:
            events = IncidentService(self.db).get_incident_events(incident_id) or []
            decisions = IncidentService(self.db).get_incident_decisions(incident_id) or []
            tickets = IncidentService(self.db).get_incident_tickets(incident_id) or []
            timeline = IncidentService(self.db).get_incident_timeline(incident_id)
            return {
                "incident_id": incident_id,
                "incident": incident.get("incident"),
                "events": events,
                "decisions": decisions,
                "tickets": tickets,
                "timeline": timeline,
            }

        scenario = get_scenario_by_external_id(incident_id)
        if scenario is None:
            return None
        return self._build_scenario_replay_bundle(scenario)

    def _build_scenario_replay_bundle(self, scenario: Scenario) -> dict:
        replay_hash = scenario_replay_hash(
            scenario_id=scenario.id,
            source=scenario.source,
            event_type=scenario.event_type,
            asset_id=scenario.asset_id,
            site=scenario.site,
            line=scenario.line,
            severity=scenario.severity,
            payload=scenario.payload,
        )
        return {
            "incident_id": scenario.ticket_id,
            "incident": {
                "id": scenario.incident_id,
                "title": scenario.title,
                "status": "Investigating",
                "severity": scenario.severity,
                "risk_level": scenario.severity,
                "root_cause_hypothesis": scenario.root_cause,
                "confidence": scenario.confidence_score,
                "business_impact_score": scenario.priority_score,
                "opened_at": "2026-04-27T13:34:00.000Z",
                "summary": scenario.rationale,
            },
            "events": [
                {
                    "event_id": f"evt-{scenario.ticket_id.lower()}",
                    "source": scenario.source,
                    "event_type": scenario.event_type,
                    "severity": scenario.severity,
                    "occurred_at": "2026-04-27T13:34:00.000Z",
                    "payload": {
                        "scenario_id": scenario.id,
                        "site": scenario.site,
                        "line": scenario.line,
                        "asset_id": scenario.asset_id,
                        **scenario.payload,
                    },
                    "asset_id": scenario.asset_id,
                    "site": scenario.site,
                }
            ],
            "decisions": [
                {
                    "id": int(scenario.ticket_id.replace("INC-", "")),
                    "priority_score": scenario.priority_score / 100,
                    "root_cause_hypothesis": scenario.root_cause,
                    "confidence_score": scenario.confidence_score,
                    "risk_level": scenario.severity,
                    "decision_ts": "2026-04-27T13:35:00.000Z",
                    "replay_hash": replay_hash,
                }
            ],
            "tickets": [
                {
                    "ticket_id": scenario.ticket_id,
                    "title": scenario.title,
                    "status": "Open",
                    "priority": scenario.severity.title(),
                    "staff_assigned": scenario.owner_team,
                }
            ],
            "timeline": [
                {
                    "timestamp": "2026-04-27T13:34:00.000Z",
                    "event_type": "incident.opened",
                    "actor": "scenario-registry",
                    "note": f"{scenario.label} replay exposed from canonical scenario registry.",
                },
                {
                    "timestamp": "2026-04-27T13:35:00.000Z",
                    "event_type": "decision.generated",
                    "actor": "praxis-api",
                    "note": scenario.recommendation,
                },
            ],
        }

    def replay_decision(self, decision_id: int) -> dict | None:
        return DecisionService(self.db).replay_decision(decision_id)
