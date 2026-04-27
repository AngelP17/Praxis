import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from apps.api_gateway.main import app
from infrastructure.db.base import Base
from infrastructure.db.session import clean_database_url

TEST_DATABASE_URL = "sqlite:///./test_aether_sentinel.db"

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


def test_decision_evaluate():
    payload = {
        "source": "k8s",
        "event_type": "pod_failure",
        "severity_score": 0.8,
        "urgency_score": 0.7,
        "business_impact_score": 0.6,
        "sla_risk_score": 0.9,
        "actionability_score": 0.8,
        "recommended_action": "Run pod crash recovery",
        "recommended_runbook_id": "pod-crash",
    }
    response = client.post("/api/decisions/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "replay_hash" in data
    assert data["risk_level"] == "medium"


def test_public_event_detail_and_decision_paths():
    payload = {
        "source": "k8s",
        "event_type": "pod_failure",
        "severity_score": 0.8,
        "urgency_score": 0.7,
        "business_impact_score": 0.6,
        "sla_risk_score": 0.9,
        "actionability_score": 0.8,
        "recommended_action": "Run pod crash recovery",
    }
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
    # First create a decision
    payload = {
        "source": "k8s",
        "event_type": "high_latency",
        "severity_score": 0.6,
        "urgency_score": 0.5,
        "business_impact_score": 0.5,
        "sla_risk_score": 0.4,
        "actionability_score": 0.7,
    }
    create_resp = client.post("/api/decisions/evaluate", json=payload)
    decision_id = create_resp.json()["id"]

    response = client.post(f"/api/decisions/{decision_id}/replay")
    assert response.status_code == 200
    data = response.json()
    assert "decision" in data
    assert "original_event" in data


def test_feedback_approve():
    payload = {
        "source": "manual",
        "event_type": "test_event",
        "severity_score": 0.5,
        "urgency_score": 0.5,
        "business_impact_score": 0.5,
        "sla_risk_score": 0.5,
        "actionability_score": 0.5,
    }
    create_resp = client.post("/api/decisions/evaluate", json=payload)
    decision_id = create_resp.json()["id"]

    response = client.post(f"/api/decisions/{decision_id}/approve", json={"note": "Looks good"})
    assert response.status_code == 200
    assert response.json()["status"] == "recorded"


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
