from astraea.praxis_decision import decide


def test_decide_is_deterministic_for_same_inputs():
    event = {
        "severity": "high",
        "asset_id": "printer.weifps01",
        "normalized_payload": {
            "asset_id": "printer.weifps01",
            "severity": "high",
            "confidence": 0.9,
        },
    }
    blast_radius = [
        {"asset_name": "Zebra Labeling", "criticality": "critical"},
        {"asset_name": "Shipping Label Workflow", "criticality": "high"},
    ]
    policy = {"version": "operational-resilience-v1", "human_review_threshold": 0.45}

    first = decide(event=event, blast_radius=blast_radius, policy=policy)
    second = decide(event=event, blast_radius=blast_radius, policy=policy)

    assert first == second


def test_decide_raises_dependency_score_with_critical_assets():
    event = {
        "severity": "high",
        "asset_id": "printer.weifps01",
        "normalized_payload": {
            "asset_id": "printer.weifps01",
            "severity": "high",
            "confidence": 0.9,
        },
    }
    policy = {"version": "operational-resilience-v1", "human_review_threshold": 0.45}

    without_radius = decide(event=event, blast_radius=[], policy=policy)
    with_radius = decide(
        event=event,
        blast_radius=[
            {"asset_name": "Zebra Labeling", "criticality": "critical"},
            {"asset_name": "Texas Production Line", "criticality": "critical"},
        ],
        policy=policy,
    )

    assert with_radius.dependency_criticality_score > without_radius.dependency_criticality_score
