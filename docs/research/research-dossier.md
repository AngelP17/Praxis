# Praxis Research Dossier

## Flagship Thesis

Praxis produces **replayable, counterfactually tested, human-calibrated operational decisions** by operationalizing research-backed methods in counterfactual explanation, provenance modeling, uncertainty quantification, and human-in-the-loop feedback calibration. The system does not claim fully autonomous incident resolution; it claims that every recommendation is:

1. **Grounded in causal evidence** (incident graph + provenance lineage).
2. **Counterfactually tested** (score stability verified under evidence removal/perturbation).
3. **Uncertainty-aware** (confidence bands, not point estimates, with review thresholds).
4. **Human-calibrated** (operator feedback updates future confidence without mutating audit history).
5. **Deterministically replayable** (same inputs produce identical hashes, scores, and explanations).

This dossier maps each claim to its research source, implementation module, test suite, and UI evidence surface.

---

## Source-to-Proof Model

| Paper/Source | Derived Claim | Implementation | Tests | UI Proof | Status |
|---|---|---|---|---|---|
| Wachter et al., 2017 | Counterfactual explanations reveal "what evidence change would alter the decision" | `astraea.reasoning.counterfactual` | `tests/astraea/test_counterfactual.py` | Replay page, "Why this decision holds" panel | `implemented` |
| Verma et al., 2020 | Counterfactual recourse should be actionable and minimal | `astraea.reasoning.counterfactual.CounterfactualReplay` | `tests/astraea/test_counterfactual.py` | Decision center recourse suggestions | `implemented` |
| Karimi et al., 2020 | Algorithmic recourse is an intervention on actionable variables | `astraea.reasoning.causal_replay` | `tests/astraea/test_causal_replay.py` | Command center action plan | `implemented` |
| Mitchell et al., 2019 | Model cards document intended use, performance, and limitations | `packages/domain/models/decision_card.py` | `tests/unit/test_decision_card.py` | Audit page model report | `implemented` |
| Gebru et al., 2021 | Datasheets for datasets document provenance and caveats | `astraea.reasoning.provenance` | `tests/astraea/test_provenance.py` | Evidence ribbon in command center | `implemented` |
| W3C PROV | Provenance standard for traceable artifact lineage | `astraea.reasoning.provenance` | `tests/astraea/test_provenance.py` | Audit ledger, replay hash chain | `implemented` |
| Human-in-the-loop ML (2022) | Macro-micro feedback loops improve model reliability without overwriting history | `astraea.decision.calibration` | `tests/astraea/test_calibration.py` | Operator feedback panel, calibration trace | `implemented` |
| Shafer & Vovk / conformal | Confidence bands and validity under exchangeability | `astraea.decision.integrity` | `tests/astraea/test_integrity.py` | Decision integrity score in UI | `implemented` |

---

## Evidence-Safe Language Rules

- **"Grounded in"** or **"inspired by"** a paper: the module exists, tests pass, and the algorithmic approach follows the paper's methodology.
- **"Proven"**: reserved only for claims with passing tests, benchmark artifacts, and visible UI evidence.
- **"Novel"** or **"groundbreaking"**: banned unless accompanied by a peer-reviewed publication and independent replication.
- **"Autonomous"**: never used to describe Praxis. The system is **operator-assisted**, not autonomous.

---

## Claim Ledger

See [`claim-ledger.md`](claim-ledger.md) for the full mapping of every claim to source, implementation, test, and UI proof.

## Benchmarks

See [`benchmarks.md`](benchmarks.md) for benchmark scenarios, expected outcomes, and current results.

## Source Registry

See [`sources.bib`](sources.bib) for the machine-readable citation registry.
