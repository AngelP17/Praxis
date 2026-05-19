import json
from pathlib import Path

import yaml

from astraea.praxis import EventFeatureExtractor


ROOT = Path(__file__).resolve().parents[2]


def load_pack(pack_id: str) -> tuple[list[dict], dict]:
    pack_dir = ROOT / "solution-packs" / pack_id
    events = [
        json.loads(line)
        for line in (pack_dir / "sample-events.jsonl").read_text().splitlines()
        if line.strip()
    ]
    scenario = yaml.safe_load((pack_dir / "scenario.yaml").read_text())
    return events, scenario


def test_feature_extractor_normalizes_manufacturing_signals():
    events, scenario = load_pack("manufacturing-printer-gpo")

    features = EventFeatureExtractor().extract(events, scenario)

    assert features["severity_score"] > 0.75
    assert features["business_process_criticality"] >= 0.7
    assert features["customer_visible_impact"] >= 0.7
    assert features["recurrence_risk"] > 0.7
    assert features["sla_exposure"] > 0.8
    assert features["actionability"] > 0.8
    assert features["asset_id"] == "WEIFPS01"
    assert features["root_cause_hypothesis"] == "printer_deployment_policy_drift"
    assert "support_hours" in features["missing_fields"]


def test_feature_extractor_derives_distinct_root_causes():
    identity_events, identity_scenario = load_pack("identity-onboarding-drift")
    network_events, network_scenario = load_pack("network-edge-failover")

    identity = EventFeatureExtractor().extract(identity_events, identity_scenario)
    network = EventFeatureExtractor().extract(network_events, network_scenario)

    assert identity["root_cause_hypothesis"] == "fragmented_access_onboarding_ownership_causing_new_hires_be_blocked_erp_printer_networks"
    assert network["root_cause_hypothesis"] == "edge_primary_isp_outage_causing_complete_shipping_erp_offline_status_due_misconfigured"
    assert identity["asset_id"] == "Active Directory"
    assert network["asset_id"] == "Firewall-EDGE-01"


