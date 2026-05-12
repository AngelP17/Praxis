# Benchmark Report

## Current Suite

The benchmark suite validates all solution packs end-to-end:

| Pack | Scenario | Events | Proof Valid | Value Case |
|------|----------|--------|-------------|------------|
| `manufacturing-printer-gpo` | Printer GPO deployment drift | 12 | **PASS** | $38.4K |
| `erp-access-disruption` | SSO/ERP access provisioning failure | 6 | **PASS** | $67.2K |
| `k8s-ingress-degradation` | Ingress config rollback conflict | 6 | **PASS** | $94.5K |

## Run Benchmarks

```bash
make praxis-benchmark
```

## Framework

The benchmark framework is extensible. Additional scenarios can be added as new solution packs under `solution-packs/`:

1. Create pack directory with required files
2. Add pack to `scripts/run_benchmarks.py`
3. Run `make praxis-benchmark`

## Future Scenarios

Planned benchmark expansions:

| ID | Scenario | Type |
|----|----------|------|
| B1 | Press Line Vibration Cascade | Manufacturing |
| B2 | IAM Policy Drift | Security |
| B3 | Sensor Calibration Offset | IoT |
| B4 | Contradictory Evidence | Synthetic |
| B5 | Missing Evidence | Synthetic |

## Metrics

Each benchmark validates:

- **Proof integrity**: Deterministic hash verification
- **Evidence trust**: Source coverage and corroboration
- **Decision quality**: Priority score within expected range
- **Value case**: Annual value calculation accuracy
- **Ontology mapping**: Object and link coverage

## Results

Latest results are stored in:

- `benchmarks/results/latest.json`
- `benchmarks/results/latest.md`