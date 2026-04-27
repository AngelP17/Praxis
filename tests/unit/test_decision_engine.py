import hashlib
import json

from apps.api_gateway.services.decision_service import DecisionService


class MockSession:
    def __init__(self):
        self._executed = []
        self._committed = False

    def execute(self, query, params=None):
        self._executed.append((str(query), params))
        return MockResult()

    def commit(self):
        self._committed = True


class MockResult:
    def mappings(self):
        return self

    def first(self):
        return {"id": 1, "decision_ts": __import__("datetime").datetime.utcnow()}

    def __iter__(self):
        return iter([])


def test_replay_hash_stability():
    service = DecisionService(MockSession())
    payload = {"severity_score": 0.8, "urgency_score": 0.7, "business_impact_score": 0.6}
    hash1 = service._compute_replay_hash(payload)
    hash2 = service._compute_replay_hash(payload)
    assert hash1 == hash2
    assert hash1.startswith("sha256:")


def test_replay_hash_sensitivity():
    service = DecisionService(MockSession())
    payload1 = {"severity_score": 0.8, "urgency_score": 0.7}
    payload2 = {"severity_score": 0.8, "urgency_score": 0.8}
    hash1 = service._compute_replay_hash(payload1)
    hash2 = service._compute_replay_hash(payload2)
    assert hash1 != hash2


def test_feature_snapshot():
    service = DecisionService(MockSession())
    payload = {
        "severity_score": 0.8,
        "urgency_score": 0.7,
        "business_impact_score": 0.6,
        "sla_risk_score": 0.9,
        "recurrence_score": 0.1,
        "dependency_criticality_score": 0.5,
        "actionability_score": 0.8,
        "uncertainty_penalty": 0.05,
    }
    snapshot = service._build_feature_snapshot(payload)
    assert snapshot["severity"] == 0.8
    assert snapshot["uncertainty_penalty"] == 0.05


def test_priority_score_computation():
    service = DecisionService(MockSession())
    payload = {
        "severity_score": 0.8,
        "urgency_score": 0.8,
        "business_impact_score": 0.8,
        "sla_risk_score": 0.8,
        "actionability_score": 0.8,
        "uncertainty_penalty": 0.1,
    }
    score = service._compute_priority_score(payload)
    assert score == round(0.8 - 0.1, 4)


def test_event_normalization():
    from apps.api_gateway.services.event_service import EventService

    service = EventService(MockSession())
    payload = {
        "source": "k8s",
        "event_type": "pod_failure",
        "severity": "warning",
        "asset": {"asset_id": "svc-1", "site": "us-east", "line": "platform"},
        "payload": {"namespace": "default"},
    }
    normalized = service._normalize_payload(payload)
    assert normalized["source"] == "k8s"
    assert normalized["asset_id"] == "svc-1"
    assert normalized["site"] == "us-east"
