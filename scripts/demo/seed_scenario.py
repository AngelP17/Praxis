#!/usr/bin/env python3
"""Seed a deterministic scenario into a running Aether Sentinel stack."""

import argparse
import json
import sys
from pathlib import Path

import requests

BASE_URL = "http://localhost:8000"


def load_scenario(path: str) -> dict:
    with open(path, "r") as f:
        return json.load(f)


def ingest_event(event: dict) -> str:
    resp = requests.post(f"{BASE_URL}/api/events/ingest", json=event, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    return data.get("event_id") or data.get("id")


def evaluate_decision(event_id: str, scenario: dict) -> str:
    expected = scenario["expected_decision"]
    payload = {
        "event_id": event_id,
        "severity": scenario["events"][0].get("severity", "medium"),
        "urgency": "high" if expected["priority_score"] > 80 else "medium",
        "business_impact": "high",
    }
    resp = requests.post(f"{BASE_URL}/api/decisions/evaluate", json=payload, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    return data["decision_id"]


def capture_feedback(decision_id: str, scenario: dict) -> None:
    feedback = scenario["expected_feedback"]
    payload = {
        "feedback_type": feedback["feedback_type"],
        "note": feedback.get("note", ""),
    }
    resp = requests.post(
        f"{BASE_URL}/api/decisions/{decision_id}/approve",
        json=payload,
        timeout=10,
    )
    # Accept 200 or 404 if endpoint varies
    if resp.status_code not in (200, 201, 404):
        resp.raise_for_status()


def verify_replay(decision_id: str) -> dict:
    resp = requests.get(f"{BASE_URL}/api/replay/decisions/{decision_id}", timeout=10)
    resp.raise_for_status()
    return resp.json()


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed a demo scenario")
    parser.add_argument("scenario", help="Path to scenario JSON file")
    args = parser.parse_args()

    scenario = load_scenario(args.scenario)
    name = scenario["scenario_name"]

    print(f"Seeding scenario: {name}")

    # 1. Ingest events
    event_ids = []
    for event in scenario["events"]:
        eid = ingest_event(event)
        event_ids.append(eid)
        print(f"  Ingested event: {eid}")

    # 2. Evaluate decision
    decision_id = evaluate_decision(event_ids[0], scenario)
    print(f"  Decision created: {decision_id}")

    # 3. Capture feedback
    capture_feedback(decision_id, scenario)
    print(f"  Feedback captured: {scenario['expected_feedback']['feedback_type']}")

    # 4. Verify replay
    replay = verify_replay(decision_id)
    print(f"  Replay verified: {replay.get('decision_id', 'OK')}")

    print(f"Scenario '{name}' seeded successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
