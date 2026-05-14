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
    erp_events, erp_scenario = load_pack("erp-access-disruption")
    k8s_events, k8s_scenario = load_pack("k8s-ingress-degradation")

    erp = EventFeatureExtractor().extract(erp_events, erp_scenario)
    k8s = EventFeatureExtractor().extract(k8s_events, k8s_scenario)

    assert erp["root_cause_hypothesis"] == "role_mapping_drift"
    assert k8s["root_cause_hypothesis"] == "ingress_retry_timeout_config_mismatch"
    assert erp["asset_id"] == "ERP-S4"
    assert k8s["asset_id"] == "api-ingress"

