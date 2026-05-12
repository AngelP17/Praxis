# Benchmarks

## Scenarios

### B1: Mechanical Failure (Press Line 3 Vibration Cascade)
- **Ticket**: INC-4821
- **Expected Root Cause**: `bearing_degradation`
- **Expected Priority Score Range**: 92–98
- **Expected Integrity Score Range**: 0.85–0.95
- **Counterfactual Test**: Removing vibration telemetry should drop priority by >20 points; removing operator ticket should drop priority by >10 points.
- **Provenance Test**: High-reliability sensor source (press-line-3.plc) should contribute more weight than low-reliability secondary inference.
- **Current Result**: PASS

### B2: Kubernetes Ingress Degradation
- **Ticket**: INC-4814
- **Expected Root Cause**: `ingress_controller_backpressure`
- **Expected Priority Score Range**: 84–90
- **Expected Integrity Score Range**: 0.75–0.88
- **Counterfactual Test**: Removing retry-burst metric should drop priority by >15 points.
- **Provenance Test**: Prometheus-sourced metric should carry higher reliability weight than inferred cluster health.
- **Current Result**: PASS

### B3: IAM Policy Drift
- **Ticket**: INC-4799
- **Expected Root Cause**: `policy_drift`
- **Expected Priority Score Range**: 78–84
- **Expected Integrity Score Range**: 0.70–0.82
- **Counterfactual Test**: Removing IAM audit hash change should drop priority by >12 points; adding contradictory "policy restored" event should lower confidence band.
- **Provenance Test**: IAM-audit source should carry medium reliability (human-auditable, but delay-prone).
- **Current Result**: PASS

### B4: Sensor Calibration Offset
- **Ticket**: INC-4758
- **Expected Root Cause**: `calibration_offset`
- **Expected Priority Score Range**: 74–82
- **Expected Integrity Score Range**: 0.68–0.80
- **Counterfactual Test**: Removing quality-gate source should raise uncertainty penalty; removing torque-variance signal should drop priority by >10 points.
- **Recourse Test**: Recourse action should be "recalibrate toolhead per runbook RB-ROBOT-001", not abstract feature edits.
- **Current Result**: PASS

### B5: Contradictory Evidence Case
- **Synthetic**: Two sensors report opposite states for same asset.
- **Expected Behavior**: Confidence band should narrow (higher uncertainty); integrity score should drop; human-review flag should be set.
- **Counterfactual Test**: Removing either contradictory source should increase confidence of the remaining source.
- **Current Result**: PASS

### B6: Missing-Evidence Case
- **Synthetic**: Primary sensor offline, only secondary inference available.
- **Expected Behavior**: Uncertainty penalty should increase; priority should be suppressed by missing-evidence factor; human-review required.
- **Provenance Test**: Missing primary source should be flagged in provenance graph with "stale" freshness.
- **Current Result**: PASS

---

## Benchmark Execution

Run benchmarks with:

```bash
make test
```

Specific benchmark module:

```bash
python -m pytest tests/astraea/test_benchmarks.py -v
```

## Benchmark Fixture Format

Each benchmark fixture is a JSON file in `tests/fixtures/benchmarks/` containing:

```json
{
  "scenario_id": "B1",
  "name": "Mechanical Failure",
  "ticket_id": "INC-4821",
  "events": [...],
  "evidence_nodes": [...],
  "expected": {
    "root_cause_hypothesis": "bearing_degradation",
    "priority_score_min": 92,
    "priority_score_max": 98,
    "integrity_score_min": 0.85,
    "integrity_score_max": 0.95,
    "counterfactual_deltas": {
      "remove_vibration_telemetry": { "priority_delta": -20, "confidence_delta": -0.15 },
      "remove_operator_ticket": { "priority_delta": -10, "confidence_delta": -0.08 }
    }
  }
}
```

## Historical Results

| Date | Commit | Pass Rate | Notes |
|---|---|---|---|
| 2026-04-27 | `main` | 6/6 | Baseline benchmark suite |
| 2026-05-05 | `main` | 6/6 | Added counterfactual and provenance benchmark assertions |
