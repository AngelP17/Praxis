"""Production-hardening guarantees.

These cover the code-level production blockers that can be verified in this
checkout: production-gated auth on mutating/customer-data routes, the demo
credential boot guard, durable persistence for value cases and deployment
plans, and baseline security headers. Enforcement is gated to ENV=production so
the deterministic demo and local dev paths stay open.
"""
import pytest
from fastapi.testclient import TestClient

from apps.api_gateway.config import settings
from apps.api_gateway.main import _enforce_production_credentials, app
from apps.api_gateway.services.auth_service import AuthService
from apps.api_gateway.services.deployment_plan_service import DeploymentPlanService
from apps.api_gateway.services.value_case_service import ValueCaseService
from infrastructure.db.base import Base
from infrastructure.db.models.deployment_plan import DeploymentPlan
from infrastructure.db.models.value_case import ValueCase
from infrastructure.db.session import SessionLocal, _import_models, engine


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    _import_models()
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    return TestClient(app)


class TestProductionGatedAuth:
    def test_mutating_route_open_in_development(self, client):
        """The demo path stays clickable without a token (ENV=development)."""
        response = client.post(
            "/api/value-cases",
            json={"solution_pack_id": "manufacturing-printer-gpo"},
        )
        assert response.status_code == 200

    def test_mutating_route_requires_token_in_production(self, client, monkeypatch):
        monkeypatch.setattr(settings, "ENV", "production")
        response = client.post(
            "/api/value-cases",
            json={"solution_pack_id": "manufacturing-printer-gpo"},
        )
        assert response.status_code == 401

    def test_authenticated_request_allowed_in_production(self, client, monkeypatch):
        login = client.post(
            "/api/auth/login", json={"username": "admin", "password": "admin"}
        )
        assert login.status_code == 200
        token = login.json()["access_token"]

        monkeypatch.setattr(settings, "ENV", "production")
        response = client.post(
            "/api/value-cases",
            json={"solution_pack_id": "manufacturing-printer-gpo"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200

    def test_chaos_endpoint_requires_admin_in_production(self, client, monkeypatch):
        monkeypatch.setattr(settings, "ENV", "production")
        response = client.post("/api/platform/chaos/reset")
        assert response.status_code == 401


class TestCredentialBootGuard:
    def test_blocks_shipped_demo_credentials_in_production(self, monkeypatch):
        monkeypatch.setattr(settings, "ENV", "production")
        assert AuthService().uses_shipped_demo_credentials() is True
        with pytest.raises(RuntimeError):
            _enforce_production_credentials()

    def test_allows_when_not_production(self):
        # development is the default test env; guard is a no-op
        _enforce_production_credentials()


class TestDurablePersistence:
    def test_value_case_persists_across_sessions(self):
        with SessionLocal() as db:
            created = ValueCaseService(db).create_value_case(
                {"solution_pack_id": "network-edge-failover"}
            )
        value_case_id = created["value_case_id"]

        with SessionLocal() as db:
            fetched = ValueCaseService(db).get_value_case(value_case_id)
            assert fetched["value_case_id"] == value_case_id
            row = db.query(ValueCase).filter_by(value_case_id=value_case_id).first()
            assert row is not None

    def test_deployment_plan_persists_across_sessions(self):
        with SessionLocal() as db:
            created = DeploymentPlanService(db).create_plan(
                {"solution_pack_id": "database-failover-lag", "timeline_weeks": 9}
            )
        plan_id = created["plan_id"]

        with SessionLocal() as db:
            fetched = DeploymentPlanService(db).get_plan(plan_id)
            assert fetched["plan_id"] == plan_id
            assert fetched["timeline_weeks"] == 9
            row = db.query(DeploymentPlan).filter_by(plan_id=plan_id).first()
            assert row is not None


class TestSecurityHeaders:
    def test_baseline_headers_present(self, client):
        response = client.get("/health")
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("X-Frame-Options") == "DENY"
        assert "Referrer-Policy" in response.headers
