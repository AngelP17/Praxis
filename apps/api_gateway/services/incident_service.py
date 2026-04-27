from datetime import datetime
from sqlalchemy.orm import Session

from apps.api_gateway.services.operational_intelligence import (
    build_live_decision_map,
    build_ticket_snapshot,
    synthesize_incidents,
)
from sqlalchemy import text


class IncidentService:
    def __init__(self, db: Session):
        self.db = db

    def list_incidents(self):
        rows = list(
            self.db.execute(
                text(
                    """
                    SELECT
                        i.id, i.incident_key, i.title, i.status, i.severity, i.risk_level,
                        i.root_cause_hypothesis, i.site_scope, i.asset_scope,
                        i.business_impact_score, i.confidence, i.opened_at, i.closed_at
                    FROM incidents i
                    ORDER BY i.opened_at DESC NULLS LAST, i.id DESC
                    LIMIT 120
                    """
                )
            ).mappings()
        )
        if rows:
            return [
                {
                    "id": row["incident_key"],
                    "title": row["title"],
                    "status": row["status"],
                    "severity": row["severity"],
                    "risk_level": row["risk_level"],
                    "root_cause_hypothesis": row["root_cause_hypothesis"],
                    "confidence": row["confidence"],
                    "business_impact_score": row["business_impact_score"],
                    "opened_at": row["opened_at"].isoformat() if hasattr(row["opened_at"], "isoformat") else row["opened_at"] if row["opened_at"] else None,
                }
                for row in rows
            ]
        return self._list_legacy_incidents()

    def _list_legacy_incidents(self):
        rows = list(
            self.db.execute(
                text(
                    """
                    SELECT
                        t.id, t.ticket_id, t.title, t.status, t.priority, t.request_type,
                        t.staff_assigned, t.requester, t.date_opened, t.description,
                        t.resolution_notes, t.created_at, t.updated_at, t.clean_summary,
                        t.site_id, t.asset_id, c.name AS category_name
                    FROM tickets t
                    LEFT JOIN categories c ON c.id = t.category_id
                    WHERE t.status NOT IN ('Resolved', 'Closed')
                    ORDER BY t.date_opened DESC NULLS LAST, t.id DESC
                    LIMIT 120
                    """
                )
            ).mappings()
        )
        tickets = [dict(row) for row in rows]
        decision_map = build_live_decision_map(tickets)
        ticket_snapshots = [
            build_ticket_snapshot(ticket, decision_map.get(ticket["ticket_id"]))
            for ticket in tickets
        ]
        incidents = synthesize_incidents(ticket_snapshots)
        return [
            {
                "id": incident["id"],
                "title": incident["title"],
                "status": incident["status"],
                "root_cause_hypothesis": incident["root_cause_hypothesis"],
                "ticket_count": incident["ticket_count"],
                "confidence": incident["confidence"],
                "business_impact_score": incident["business_impact_score"],
                "opened_at": incident["opened_at"],
            }
            for incident in incidents
        ]

    def get_incident_detail(self, incident_id: str):
        row = (
            self.db.execute(
                text(
                    """
                SELECT
                    i.id, i.incident_key, i.title, i.status, i.severity, i.risk_level,
                    i.root_cause_hypothesis, i.site_scope, i.asset_scope,
                    i.business_impact_score, i.confidence, i.opened_at, i.closed_at,
                    i.summary, i.metadata_json
                FROM incidents i
                WHERE i.incident_key = :incident_id
                """
                ),
                {"incident_id": incident_id},
            )
            .mappings()
            .first()
        )
        if row:
            return {
                "incident": {
                    "id": row["incident_key"],
                    "title": row["title"],
                    "status": row["status"],
                    "severity": row["severity"],
                    "risk_level": row["risk_level"],
                    "root_cause_hypothesis": row["root_cause_hypothesis"],
                    "confidence": row["confidence"],
                    "business_impact_score": row["business_impact_score"],
                    "opened_at": row["opened_at"].isoformat() if hasattr(row["opened_at"], "isoformat") else row["opened_at"] if row["opened_at"] else None,
                    "summary": row["summary"],
                },
                "metadata": row["metadata_json"] or {},
            }
        return self._get_legacy_incident_detail(incident_id)

    def _get_legacy_incident_detail(self, incident_id: str):
        rows = list(
            self.db.execute(
                text(
                    """
                    SELECT
                        t.id, t.ticket_id, t.title, t.status, t.priority, t.request_type,
                        t.staff_assigned, t.requester, t.date_opened, t.description,
                        t.resolution_notes, t.created_at, t.updated_at, t.clean_summary,
                        t.site_id, t.asset_id, c.name AS category_name
                    FROM tickets t
                    LEFT JOIN categories c ON c.id = t.category_id
                    WHERE t.status NOT IN ('Resolved', 'Closed')
                    ORDER BY t.date_opened DESC NULLS LAST, t.id DESC
                    LIMIT 120
                    """
                )
            ).mappings()
        )
        tickets = [dict(row) for row in rows]
        decision_map = build_live_decision_map(tickets)
        incidents = synthesize_incidents(
            [
                build_ticket_snapshot(ticket, decision_map.get(ticket["ticket_id"]))
                for ticket in tickets
            ]
        )
        incident = next((item for item in incidents if item["id"] == incident_id), None)
        if incident is None:
            return None
        return {
            "incident": {
                "id": incident["id"],
                "title": incident["title"],
                "status": incident["status"],
                "ticket_count": incident["ticket_count"],
                "confidence": incident["confidence"],
                "business_impact_score": incident["business_impact_score"],
                "opened_at": incident["opened_at"],
            },
            "tickets": incident["tickets"],
            "common_cause": incident["common_cause"],
            "recommended_action": incident["recommended_action"],
        }

    def get_incident_events(self, incident_id: str):
        incident_row = (
            self.db.execute(
                text("SELECT id FROM incidents WHERE incident_key = :incident_id"),
                {"incident_id": incident_id},
            )
            .mappings()
            .first()
        )
        if not incident_row:
            return None
        rows = self.db.execute(
            text(
                """
                SELECT oe.event_id, oe.source, oe.event_type, oe.severity, oe.occurred_at, oe.payload
                FROM incident_events ie
                JOIN operational_events oe ON oe.id = ie.event_id
                WHERE ie.incident_id = :incident_pk
                ORDER BY oe.occurred_at ASC
                """
            ),
            {"incident_pk": incident_row["id"]},
        ).mappings()
        return [dict(row) for row in rows]

    def get_incident_decisions(self, incident_id: str):
        incident_row = (
            self.db.execute(
                text("SELECT id FROM incidents WHERE incident_key = :incident_id"),
                {"incident_id": incident_id},
            )
            .mappings()
            .first()
        )
        if not incident_row:
            return None
        rows = self.db.execute(
            text(
                """
                SELECT dr.id, dr.priority_score, dr.root_cause_hypothesis, dr.confidence_score,
                       dr.risk_level, dr.decision_ts, dr.replay_hash
                FROM decisions dr
                WHERE dr.incident_id = :incident_pk
                ORDER BY dr.decision_ts DESC
                """
            ),
            {"incident_pk": incident_row["id"]},
        ).mappings()
        return [dict(row) for row in rows]

    def get_incident_tickets(self, incident_id: str):
        incident_row = (
            self.db.execute(
                text("SELECT id FROM incidents WHERE incident_key = :incident_id"),
                {"incident_id": incident_id},
            )
            .mappings()
            .first()
        )
        if not incident_row:
            return None
        rows = self.db.execute(
            text(
                """
                SELECT t.ticket_id, t.title, t.status, t.priority, t.staff_assigned
                FROM incident_ticket_link itl
                JOIN tickets t ON t.id = itl.ticket_id
                WHERE itl.incident_id = :incident_pk
                """
            ),
            {"incident_pk": incident_row["id"]},
        ).mappings()
        return [dict(row) for row in rows]

    def get_incident_timeline(self, incident_id: str):
        incident_row = (
            self.db.execute(
                text(
                    "SELECT id, opened_at, closed_at, status FROM incidents WHERE incident_key = :incident_id"
                ),
                {"incident_id": incident_id},
            )
            .mappings()
            .first()
        )
        if not incident_row:
            return None
        timeline = []
        timeline.append(
            {
                "phase": "opened",
                "timestamp": incident_row["opened_at"].isoformat()
                if incident_row["opened_at"]
                else None,
                "detail": "Incident opened",
            }
        )
        events = self.get_incident_events(incident_id) or []
        for ev in events:
            timeline.append(
                {
                    "phase": "event",
                    "timestamp": ev.get("occurred_at"),
                    "detail": f"{ev.get('source')} event: {ev.get('event_type')}",
                }
            )
        decisions = self.get_incident_decisions(incident_id) or []
        for dec in decisions:
            timeline.append(
                {
                    "phase": "decision",
                    "timestamp": dec.get("decision_ts"),
                    "detail": f"Decision scored {dec.get('priority_score')}",
                }
            )
        if incident_row["closed_at"]:
            timeline.append(
                {
                    "phase": "closed",
                    "timestamp": incident_row["closed_at"].isoformat() if hasattr(row["closed_at"], "isoformat") else row["closed_at"],
                    "detail": "Incident closed",
                }
            )
        return {"incident_id": incident_id, "timeline": timeline}

    def resolve_incident(self, incident_id: str, summary: str = "") -> dict[str, object] | None:
        incident_row = (
            self.db.execute(
                text("SELECT id FROM incidents WHERE incident_key = :incident_id"),
                {"incident_id": incident_id},
            )
            .mappings()
            .first()
        )
        if not incident_row:
            return None
        self.db.execute(
            text(
                """
                UPDATE incidents
                SET status = 'resolved', closed_at = CURRENT_TIMESTAMP, resolved_at = CURRENT_TIMESTAMP, summary = COALESCE(:summary, summary)
                WHERE incident_key = :incident_id
                """
            ),
            {"incident_id": incident_id, "summary": summary},
        )
        self.db.commit()
        return {"incident_id": incident_id, "status": "resolved"}

    def generate_postmortem(self, incident_id: str) -> dict[str, object] | None:
        incident = self.get_incident_detail(incident_id)
        if not incident:
            return None
        events = self.get_incident_events(incident_id) or []
        decisions = self.get_incident_decisions(incident_id) or []
        tickets = self.get_incident_tickets(incident_id) or []
        return {
            "incident_id": incident_id,
            "title": incident.get("incident", {}).get("title"),
            "summary": incident.get("incident", {}).get("summary", "No summary provided"),
            "events_count": len(events),
            "decisions_count": len(decisions),
            "tickets_count": len(tickets),
            "generated_at": datetime.utcnow().isoformat(),
        }
