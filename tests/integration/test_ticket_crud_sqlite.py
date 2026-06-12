"""Ticket CRUD against SQLite through the real API gateway.

Regression coverage for the local-dev (SQLite) path:
- ticket id generation must use dialect-portable SQL (SUBSTR, not SUBSTRING FROM)
- the ticket_labels association table must exist via the ORM model registry
- authenticated writes must be enforced at the API boundary
"""

import re
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from apps.api_gateway.main import app
from infrastructure.db.base import Base
from infrastructure.db.models.label import Label

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


def _login() -> str:
    response = client.post(
        "/api/auth/login", json={"username": "operator", "password": "operator"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def _auth_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {_login()}"}


def test_ticket_create_requires_auth():
    response = client.post("/api/tickets", json={"title": "No auth"})
    assert response.status_code == 401


def test_ticket_create_persists_on_sqlite():
    response = client.post(
        "/api/tickets",
        json={
            "title": "Shipping label printer offline after GPO push",
            "priority": "High",
            "description": "Line 2 printers offline after GPO deployment.",
        },
        headers=_auth_headers(),
    )
    assert response.status_code == 201
    ticket = response.json()["ticket"]
    assert re.fullmatch(r"IT-\d+", ticket["ticket_id"])
    assert ticket["title"] == "Shipping label printer offline after GPO push"

    detail = client.get(f"/api/tickets/{ticket['ticket_id']}", headers=_auth_headers())
    assert detail.status_code == 200
    assert detail.json()["ticket"]["ticket_id"] == ticket["ticket_id"]


def test_ticket_id_increments_with_existing_rows():
    headers = _auth_headers()
    first = client.post("/api/tickets", json={"title": "Seq A"}, headers=headers)
    second = client.post("/api/tickets", json={"title": "Seq B"}, headers=headers)
    assert first.status_code == 201
    assert second.status_code == 201
    first_number = int(first.json()["ticket"]["ticket_id"].split("-")[1])
    second_number = int(second.json()["ticket"]["ticket_id"].split("-")[1])
    assert second_number == first_number + 1


def test_ticket_labels_roundtrip():
    # The shared sqlite test file survives across runs; keep the name unique.
    label_name = f"gpo-drift-{uuid.uuid4().hex[:8]}"
    db = TestingSessionLocal()
    try:
        label = Label(name=label_name, color="#715bff")
        db.add(label)
        db.commit()
        db.refresh(label)
        label_id = label.id
    finally:
        db.close()

    headers = _auth_headers()
    created = client.post(
        "/api/tickets",
        json={"title": "Labeled ticket", "label_ids": [label_id]},
        headers=headers,
    )
    assert created.status_code == 201
    ticket_id = created.json()["ticket"]["ticket_id"]

    detail = client.get(f"/api/tickets/{ticket_id}", headers=headers)
    assert detail.status_code == 200
    labels = detail.json()["ticket"].get("labels") or []
    assert any(item["name"] == label_name for item in labels)
