"""Scenario service contract tests."""

from apps.api_gateway.services.scenario_service import ScenarioService
from domain.hashing import scenario_replay_hash
from domain.scenarios import SCENARIOS


class DummyDb:
    pass


class FakeDecisionService:
    def evaluate_event(self, payload):
        raw = payload["data"]["raw"]
        return {
            "id": 1,
            "event_id": "evt_test_0001",
            "priority_score": 0.87,
            "risk_level": payload["data"]["severity"],
            "replay_hash": scenario_replay_hash(
                scenario_id=payload["data"]["scenario_id"],
                source=payload["source"],
                event_type=payload["type"],
                asset_id=payload["data"]["asset_id"],
                site=payload["data"]["site"],
                line=payload["data"]["line"],
                severity=payload["data"]["severity"],
                payload=raw,
            ),
        }

    def replay_decision(self, _decision_id):
        return {"determinism": True, "replayed_at": "2026-01-01T00:00:00Z"}

    def record_feedback(self, _decision_id, _feedback_type, _note):
        return {"status": "recorded"}


def make_service() -> ScenarioService:
    svc = ScenarioService(DummyDb())
    svc._decision_svc = FakeDecisionService()
    return svc


def test_scenario_run_returns_decision_stored_hash():
    svc = make_service()

    result = svc.run_scenario("printer-offline", auto_approve=False)
    assert result is not None
    assert result["scenario_id"] == "printer-offline"
    assert result["decision_id"] == 1
    assert result["event_id"] == "evt_test_0001"
    assert result["replay_hash"].startswith("sha256:")
    assert result["determinism"] is True


def test_scenario_run_replay_hash_is_deterministic_for_same_scenario():
    svc1 = make_service()
    svc2 = make_service()

    result1 = svc1.run_scenario("printer-offline")
    result2 = svc2.run_scenario("printer-offline")

    assert result1 is not None
    assert result2 is not None
    assert result1["replay_hash"] == result2["replay_hash"]


def test_scenario_benchmark_returns_all_four():
    svc = make_service()
    benchmarks = svc.benchmarks()
    assert len(benchmarks) == len(SCENARIOS)
    for benchmark in benchmarks:
        assert benchmark["deterministic"] is True
        assert benchmark["replay_hash"].startswith("sha256:")
        assert benchmark["scenario_id"]
        assert benchmark["event_type"]
        assert benchmark["risk_level"]
        assert isinstance(benchmark["priority_score"], int)
        assert isinstance(benchmark["estimated_value_usd"], int)


def test_scenario_benchmark_hashes_match_scenario_replay_hashes():
    svc = make_service()
    benchmarks = svc.benchmarks()

    for benchmark in benchmarks:
        scenario = next(s for s in SCENARIOS if s.id == benchmark["scenario_id"])
        expected = scenario_replay_hash(
            scenario_id=scenario.id,
            source=scenario.source,
            event_type=scenario.event_type,
            asset_id=scenario.asset_id,
            site=scenario.site,
            line=scenario.line,
            severity=scenario.severity,
            payload=scenario.payload,
        )
        assert benchmark["replay_hash"] == expected
