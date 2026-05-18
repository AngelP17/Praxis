import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from apps.api_gateway.main import app
from domain.events import printer_offline_event
from infrastructure.db.base import Base
from infrastructure.db.models.outbox_message import OutboxMessage
from infrastructure.db.session import clean_database_url

TEST_DATABASE_URL = "sqlite:///./test_praxis.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[__import__("apps.api_gateway.deps", fromlist=["get_db"]).get_db] = (
    override_get_db
)

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    from infrastructure.db.session import _import_models

    _import_models()
    Base.metadata.create_all(bind=engine)
    yield


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_event_ingest():
    payload = {
        "source": "k8s",
        "event_type": "pod_failure",
        "severity": "warning",
        "payload": {"namespace": "default", "desired_replicas": 3, "available_replicas": 2},
    }
    response = client.post("/api/events/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ingested"
    assert data["event_id"].startswith("evt_")


def test_event_ingest_accepts_cloudevent():
    payload = printer_offline_event().model_dump(mode="json")
    response = client.post("/api/events/ingest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ingested"
    assert data["event_id"] == payload["id"]


def test_decision_evaluate():
    payload = printer_offline_event(asset_id="printer.no_graph").model_dump(mode="json")
    response = client.post("/api/decisions/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "replay_hash" in data
    assert data["risk_level"] == "medium"


def test_public_event_detail_and_decision_paths():
    payload = printer_offline_event(asset_id="printer.public").model_dump(mode="json")
    create_resp = client.post("/api/decisions/evaluate", json=payload)
    assert create_resp.status_code == 200
    created = create_resp.json()

    event_resp = client.get(f"/api/events/{created['event_id']}")
    assert event_resp.status_code == 200
    assert event_resp.json()["event_id"] == created["event_id"]

    event_decision_resp = client.get(f"/api/events/{created['event_id']}/decision")
    assert event_decision_resp.status_code == 200
    assert event_decision_resp.json()["id"] == created["id"]

    decision_resp = client.get(f"/api/decisions/{created['id']}")
    assert decision_resp.status_code == 200
    assert decision_resp.json()["id"] == created["id"]


def test_replay_decision():
    payload = printer_offline_event(asset_id="printer.replay").model_dump(mode="json")
    create_resp = client.post("/api/decisions/evaluate", json=payload)
    decision_id = create_resp.json()["id"]

    response = client.post(f"/api/decisions/{decision_id}/replay")
    assert response.status_code == 200
    data = response.json()
    assert "decision" in data
    assert "original_event" in data
    assert "determinism" in data


def test_feedback_approve():
    payload = printer_offline_event(asset_id="printer.feedback").model_dump(mode="json")
    create_resp = client.post("/api/decisions/evaluate", json=payload)
    decision_id = create_resp.json()["id"]

    response = client.post(f"/api/decisions/{decision_id}/approve", json={"note": "Looks good"})
    assert response.status_code == 200
    assert response.json()["status"] == "recorded"
    db = TestingSessionLocal()
    try:
        outbox = db.query(OutboxMessage).order_by(OutboxMessage.id.desc()).first()
        assert outbox is not None
        assert outbox.topic == "praxis.decision.feedback_recorded"
    finally:
        db.close()


def test_list_events():
    response = client.get("/api/events")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_audit_export():
    import uuid

    incident_key = f"INC-TEST-{uuid.uuid4().hex[:8]}"
    # Create an incident manually for testing
    db = TestingSessionLocal()
    db.execute(
        __import__("sqlalchemy", fromlist=["text"]).text(
            f"INSERT INTO incidents (incident_key, title, status, severity) VALUES ('{incident_key}', 'Test', 'open', 'low')"
        )
    )
    db.commit()
    db.close()

    response = client.get(f"/api/audit/export/{incident_key}")
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == incident_key
    assert "events" in data
    assert "decisions" in data
    assert "feedback" in data
