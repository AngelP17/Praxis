from apps.api_gateway.services.replay_service import ReplayService


class DummyMappingsResult:
    def mappings(self):
        return self

    def __iter__(self):
        return iter(())

    def first(self):
        return None


class DummyDb:
    def execute(self, *_args, **_kwargs):
        return DummyMappingsResult()


def test_replay_incident_falls_back_to_canonical_scenario_registry():
    service = ReplayService(DummyDb())

    payload = service.replay_incident("INC-4821")

    assert payload is not None
    assert payload["incident_id"] == "INC-4821"
    assert payload["incident"]["id"] == "IR-2026-041"
    assert payload["incident"]["root_cause_hypothesis"] == "printer_firmware_regression"
    assert payload["events"][0]["event_type"] == "com.praxis.asset.printer.offline"
    assert payload["decisions"][0]["id"] == 4821
    assert payload["decisions"][0]["replay_hash"].startswith("sha256:")
    assert payload["timeline"][0]["actor"] == "scenario-registry"
