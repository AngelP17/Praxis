from domain.hashing import canonical_hash, scenario_replay_hash


def test_canonical_hash_is_deterministic():
    bundle = {"a": 1, "b": "test", "c": [1, 2, 3]}
    first = canonical_hash(bundle)
    second = canonical_hash(bundle)
    assert first == second
    assert first.startswith("sha256:")
    assert len(first) == 39  # "sha256:" + 32 hex chars


def test_canonical_hash_different_inputs_produce_different_hashes():
    a = canonical_hash({"x": 1})
    b = canonical_hash({"x": 2})
    assert a != b


def test_canonical_hash_key_order_is_stable():
    a = canonical_hash({"b": 2, "a": 1})  # insertion order doesn't matter
    b = canonical_hash({"a": 1, "b": 2})
    assert a == b


def test_scenario_replay_hash_is_deterministic():
    payload = {"hostname": "TEST", "ping": "failed"}
    first = scenario_replay_hash(
        scenario_id="test",
        source="test.source",
        event_type="test.event",
        asset_id="asset.1",
        site="TX",
        line="line-1",
        severity="high",
        payload=payload,
    )
    second = scenario_replay_hash(
        scenario_id="test",
        source="test.source",
        event_type="test.event",
        asset_id="asset.1",
        site="TX",
        line="line-1",
        severity="high",
        payload=payload,
    )
    assert first == second


def test_scenario_replay_hash_changes_with_payload():
    base = scenario_replay_hash(
        scenario_id="test", source="s", event_type="t",
        asset_id="a", site="x", line="l", severity="high", payload={"v": 1},
    )
    changed = scenario_replay_hash(
        scenario_id="test", source="s", event_type="t",
        asset_id="a", site="x", line="l", severity="high", payload={"v": 2},
    )
    assert base != changed
