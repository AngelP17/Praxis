from domain.scenarios import (
    SCENARIOS,
    Scenario,
    get_scenario_by_external_id,
    get_scenario_by_id,
)


def test_all_eight_scenarios_registered():
    assert len(SCENARIOS) == 8


def test_scenario_ids_are_unique():
    ids = [s.id for s in SCENARIOS]
    assert len(ids) == len(set(ids))


def test_all_scenarios_have_required_fields():
    for scenario in SCENARIOS:
        assert scenario.id
        assert scenario.label
        assert scenario.site
        assert scenario.category
        assert scenario.severity in ("critical", "high", "medium", "low")
        assert scenario.source
        assert scenario.event_type
        assert scenario.asset_id
        assert scenario.line
        assert isinstance(scenario.payload, dict)
        assert len(scenario.payload) > 0
        assert scenario.recommendation
        assert scenario.rationale
        assert scenario.runbook_id
        assert scenario.estimated_value_usd > 0
        assert 0 <= scenario.mttr_reduction_pct <= 100
        assert 0 <= scenario.recurrence_reduction_pct <= 100
        assert len(scenario.impacted_systems) > 0
        assert scenario.asset_type
        assert scenario.owner_team


def test_get_scenario_by_id_returns_scenario():
    scenario = get_scenario_by_id("printer-offline")
    assert scenario is not None
    assert scenario.id == "printer-offline"
    assert scenario.label == "Printer GPO Offline"
    assert scenario.asset_id == "printer.weifps01"


def test_get_scenario_by_id_unknown_returns_none():
    assert get_scenario_by_id("nonexistent") is None


def test_get_scenario_by_external_id_supports_ticket_and_incident_ids():
    by_ticket = get_scenario_by_external_id("INC-4821")
    by_incident = get_scenario_by_external_id("IR-2026-041")

    assert by_ticket is not None
    assert by_incident is not None
    assert by_ticket.id == "printer-offline"
    assert by_incident.id == "printer-offline"


def test_scenarios_are_valid_models():
    for scenario in SCENARIOS:
        assert isinstance(scenario, Scenario)


def test_printer_offline_highest_priority_ehs_is_99():
    ehs = get_scenario_by_id("ehs-threshold")
    assert ehs is not None
    assert ehs.priority_score == 99


def test_rfid_lowest_priority_65():
    rfid = get_scenario_by_id("rfid-reader-drop")
    assert rfid is not None
    assert rfid.priority_score == 65
