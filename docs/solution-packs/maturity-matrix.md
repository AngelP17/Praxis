# Solution Pack Maturity Matrix

This document tracks the capabilities, verification levels, and readiness of all registered Praxis Solution Packs.

---

## 1. Conformance Matrix

Every solution pack is evaluated against the following pipeline checkpoints:
- **Ingest**: Ingests unstructured events and produces CloudEvents.
- **Ontology**: Generates node/link/action graphs via `ontology.yaml`.
- **Decision**: Computes priority scores and hypotheses.
- **Human Action**: Supports HITL mode and approval gating.
- **Proof**: Emits schema-compliant Praxis Proof Objects.
- **Replay**: Verifies deterministic hash equality.
- **Value Case**: Computes estimated annual value and confidence.
- **UI**: Renders dashboard and bento-grid visuals.
- **Benchmark**: Benchmarked for execution speed.

| Solution Pack | Ingest | Ontology | Decision | Human Action | Proof | Replay | Value Case | UI | Benchmark | Maturity |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Printer GPO Drift** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **FieldLab-verified** |
| **Network Edge Failover** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Partial | ✅ | **Beta proof** |
| **Identity Onboarding Drift**| ✅ | ✅ | ✅ | Partial | ✅ | ✅ | ✅ | Partial | ✅ | **Beta proof** |
| **Database Replication Lag** | ✅ | ✅ | ✅ | Partial | ✅ | ✅ | ✅ | Partial | ✅ | **Beta proof** |

---

## 2. Complete Readiness Definition

A Solution Pack is considered **FieldLab-verified** only when the following files exist, pass validation, and are exercised by the current proof command:
1.  `scenario.yaml`: core scenario metadata.
2.  `customer-context.md`: enterprise/operational background snapshot.
3.  `sample-events.jsonl`: representative operational events.
4.  `ontology.yaml`: local ontology compilers and mapping rules.
5.  `roi-model.yaml`: local ROI parameters.
6.  `expected-output/`: reference outputs for out-of-band verification.
    -   `incident.json`
    -   `proof.json`
    -   `value-case.json`
    -   `replay.json`
    -   `executive-readout.md`

---

## 3. Verification Commands

To validate all registered solution packs in parallel:
```bash
# Runs full compile and benchmarking runs
.venv/bin/python scripts/run_benchmarks.py
```
To validate directory schema completeness:
```bash
.venv/bin/python scripts/validate_solution_pack.py solution-packs/manufacturing-printer-gpo
```
