from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any

from apps.api_gateway.deps import get_db

router = APIRouter()


@router.get("/events")
def list_audit_events(source: str | None = None, db: Session = Depends(get_db)):
    from sqlalchemy import text

    query = "SELECT event_id, source, event_type, severity, occurred_at, created_at FROM operational_events"
    params: dict[str, Any] = {}
    if source:
        query += " WHERE source = :source"
        params["source"] = source
    query += " ORDER BY created_at DESC LIMIT 1000"
    rows = db.execute(text(query), params).mappings()
    return [dict(row) for row in rows]


@router.get("/export/{incident_id}")
def export_audit(incident_id: str, db: Session = Depends(get_db)):
    from sqlalchemy import text
    from datetime import datetime

    incident_row = (
        db.execute(
            text(
                "SELECT id, title, status, opened_at FROM incidents WHERE incident_key = :incident_id"
            ),
            {"incident_id": incident_id},
        )
        .mappings()
        .first()
    )
    if not incident_row:
        raise HTTPException(status_code=404, detail="Incident not found")

    events = db.execute(
        text(
            """
            SELECT oe.event_id, oe.source, oe.event_type, oe.occurred_at, oe.payload
            FROM incident_events ie
            JOIN operational_events oe ON oe.id = ie.event_id
            WHERE ie.incident_id = :incident_pk
            """
        ),
        {"incident_pk": incident_row["id"]},
    ).mappings()

    decisions = db.execute(
        text(
            """
            SELECT dr.id, dr.priority_score, dr.root_cause_hypothesis, dr.confidence_score,
                   dr.replay_hash, dr.decision_ts
            FROM decision_records dr
            WHERE dr.incident_id = :incident_pk
            """
        ),
        {"incident_pk": incident_row["id"]},
    ).mappings()

    feedback = db.execute(
        text(
            """
            SELECT hf.actor, hf.feedback_type, hf.note, hf.created_at
            FROM human_feedback hf
            JOIN decision_records dr ON dr.id = hf.decision_id
            WHERE dr.incident_id = :incident_pk
            """
        ),
        {"incident_pk": incident_row["id"]},
    ).mappings()

    return {
        "incident_id": incident_id,
        "incident_title": incident_row["title"],
        "exported_at": datetime.utcnow().isoformat(),
        "events": [dict(row) for row in events],
        "decisions": [dict(row) for row in decisions],
        "feedback": [dict(row) for row in feedback],
    }
