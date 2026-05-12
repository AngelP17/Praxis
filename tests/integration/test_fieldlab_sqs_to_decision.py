import os
import json

import pytest


class TestFieldLabSQSToDecision:
    def test_sample_events_are_valid_jsonl(self):
        events_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "solution-packs",
            "manufacturing-printer-gpo",
            "sample-events.jsonl",
        )
        if not os.path.isfile(events_path):
            pytest.skip("Sample events file not found")

        events = []
        with open(events_path) as f:
            for line in f:
                line = line.strip()
                if line:
                    events.append(json.loads(line))

        assert len(events) >= 5, f"Expected at least 5 events, got {len(events)}"

        for i, evt in enumerate(events):
            assert "event_type" in evt, f"Event {i} missing event_type"

    def test_ontology_yaml_exists(self):
        onto_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "solution-packs",
            "manufacturing-printer-gpo",
            "ontology.yaml",
        )
        assert os.path.isfile(onto_path), "Ontology YAML not found"
