"""Integration tests for the complete decision spine.

Tests the full path: event ingestion -> decision -> approval -> outbox -> replay
"""
import pytest
from fastapi.testclient import TestClient

from apps.api_gateway.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def auth_token(client):
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


class TestDecisionSpine:
    """Test the complete decision evaluation and approval flow."""

    def test_event_ingest_creates_decision(self, client, auth_headers):
        """Evaluating a CloudEvent should create a decision record."""
        event = {
            "specversion": "1.0",
            "type": "printer.offline",
            "source": "printer-telemetry",
            "id": "test-event-001",
            "subject": "printer-gpo-042",
            "data": {
                "asset_id": "printer-gpo-042",
                "site": "GA-PRINT",
                "severity": "high",
                "duration_minutes": 45,
            },
        }

        response = client.post(
            "/api/decisions/evaluate",
            json=event,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "event_id" in data
        assert "id" in data
        assert data["priority_score"] > 0
        assert data["confidence_score"] > 0

    def test_decision_approval_creates_outbox(self, client, auth_headers):
        """Approving a decision should create an outbox message."""
        event = {
            "specversion": "1.0",
            "type": "printer.offline",
            "source": "printer-telemetry",
            "id": "test-event-002",
            "subject": "printer-gpo-043",
            "data": {
                "asset_id": "printer-gpo-043",
                "site": "GA-PRINT",
                "severity": "high",
            },
        }

        ingest_response = client.post(
            "/api/decisions/evaluate",
            json=event,
            headers=auth_headers,
        )
        assert ingest_response.status_code == 200
        decision_id = ingest_response.json()["id"]

        approve_response = client.post(
            f"/api/decisions/{decision_id}/approve",
            json={"note": "Approved by integration test"},
            headers=auth_headers,
        )

        assert approve_response.status_code == 200
        data = approve_response.json()
        assert data["status"] == "recorded"  # Aligning to our feedback schema status return

        # Synchronously trigger outbox relay processing to test delivery
        from apps.api_gateway.services.outbox_relay import outbox_worker
        from infrastructure.db.session import SessionLocal
        from infrastructure.db.models.outbox_message import OutboxMessage
        import asyncio

        asyncio.run(outbox_worker.process_pending_messages())

        # Verify the outbox message is processed and set to 'published'
        with SessionLocal() as db:
            from sqlalchemy import select
            msg = db.execute(
                select(OutboxMessage)
                .where(OutboxMessage.topic == "praxis.decision.feedback_recorded")
                .order_by(OutboxMessage.created_at.desc())
                .limit(1)
            ).scalar_one_or_none()

            assert msg is not None
            assert msg.status == "published"
            assert msg.published_at is not None

    def test_decision_replay_is_deterministic(self, client, auth_headers):
        """Replaying a decision should produce the same hash."""
        event = {
            "specversion": "1.0",
            "type": "printer.offline",
            "source": "printer-telemetry",
            "id": "test-event-003",
            "subject": "printer-gpo-044",
            "data": {
                "asset_id": "printer-gpo-044",
                "site": "GA-PRINT",
                "severity": "high",
            },
        }

        ingest_response = client.post(
            "/api/decisions/evaluate",
            json=event,
            headers=auth_headers,
        )
        assert ingest_response.status_code == 200
        decision_id = ingest_response.json()["id"]

        replay_response = client.post(
            f"/api/decisions/{decision_id}/replay",
            headers=auth_headers,
        )

        assert replay_response.status_code == 200
        data = replay_response.json()
        assert "stored_replay_hash" in data
        assert "replayed_hash" in data
        assert data["deterministic"] is True
        assert data["stored_replay_hash"] == data["replayed_hash"]


class TestAuthFlow:
    """Test authentication with refresh tokens."""

    def test_login_returns_refresh_token(self, client):
        """Login should return both access and refresh tokens."""
        response = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "admin"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data

    def test_refresh_token_rotation(self, client):
        """Refreshing should return new access and refresh tokens."""
        login_response = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "admin"},
        )
        assert login_response.status_code == 200
        refresh_token = login_response.json()["refresh_token"]

        refresh_response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": refresh_token},
        )

        assert refresh_response.status_code == 200
        data = refresh_response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["refresh_token"] != refresh_token

    def test_revoked_token_rejected(self, client):
        """Revoked tokens should be rejected."""
        login_response = client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "admin"},
        )
        assert login_response.status_code == 200
        access_token = login_response.json()["access_token"]

        logout_response = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert logout_response.status_code == 200

        me_response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert me_response.status_code == 401


class TestFieldLabLifecycle:
    """Test FieldLab run lifecycle."""

    def test_fieldlab_run_creates_proof(self, client, auth_headers):
        """Creating a FieldLab run should generate a proof."""
        create_response = client.post(
            "/api/fieldlab/runs",
            json={"solution_pack_id": "manufacturing-printer-gpo"},
            headers=auth_headers,
        )

        assert create_response.status_code == 201
        data = create_response.json()
        assert "run_id" in data
        assert data["status"] in ["created", "running", "completed"]

    def test_solution_packs_list(self, client, auth_headers):
        """Should list available solution packs."""
        response = client.get(
            "/api/solution-packs",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "id" in data[0]
        assert "name" in data[0]


class TestRequestIDPropagation:
    """Test X-Request-ID middleware."""

    def test_request_id_returned(self, client):
        """Response should include X-Request-ID header."""
        response = client.get("/health")
        assert "X-Request-ID" in response.headers

    def test_request_id_echoed(self, client):
        """Provided X-Request-ID should be echoed in response."""
        request_id = "test-request-123"
        response = client.get(
            "/health",
            headers={"X-Request-ID": request_id},
        )
        assert response.headers["X-Request-ID"] == request_id
