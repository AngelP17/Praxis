# Claim Ledger

## Rules
- Every flagship claim must link to at least one source and one repo artifact.
- No "groundbreaking," "proven," or "novel" claim appears without a claim-ledger entry.
- Evidence status: `implemented`, `partially implemented`, `planned`, or `not claimed`.

---

## Claims

### C1: Counterfactual Explanation of Decisions
- **Source**: Wachter, Mittelstadt, Russell, 2017; Verma et al., 2020
- **Claim**: For every decision, Praxis can report "what evidence change would alter the decision" by removing, weakening, delaying, or contradicting evidence nodes and reporting score deltas.
- **Implementation**: `astraea.reasoning.counterfactual.CounterfactualReplay`
- **Tests**: `tests/astraea/test_counterfactual.py`
- **Benchmarks**: `benchmarks.md` — Mechanical failure, K8s ingress degradation, IAM policy drift
- **UI Proof**: Replay page "Why this decision holds" panel shows counterfactual deltas; Decision center shows recourse suggestions.
- **Evidence Status**: `implemented`

### C2: Algorithmic Recourse as Operational Intervention
- **Source**: Karimi et al., 2020
- **Claim**: Recourse actions are operationally valid (tied to runbooks/workflows), not abstract feature edits.
- **Implementation**: `astraea.reasoning.causal_replay.CausalIncidentGraph`
- **Tests**: `tests/astraea/test_causal_replay.py`
- **Benchmarks**: Sensor calibration offset, contradictory evidence cases
- **UI Proof**: Command center action plan; runbook links in decision center.
- **Evidence Status**: `implemented`

### C3: Provenance-Weighted Evidence Scoring
- **Source**: W3C PROV Overview; Gebru et al., 2021
- **Claim**: Priority and confidence depend on evidence freshness, source reliability, corroboration, and audit completeness.
- **Implementation**: `astraea.reasoning.provenance.ProvenanceEngine`
- **Tests**: `tests/astraea/test_provenance.py`
- **Benchmarks**: Missing-evidence case, delayed-evidence case
- **UI Proof**: Evidence ribbon in command center; audit ledger hash chain; provenance graph in replay.
- **Evidence Status**: `implemented`

### C4: Human-in-the-Loop Feedback Calibration
- **Source**: Human-in-the-loop ML review, 2022
- **Claim**: Accepted/rejected/edited recommendations update future confidence bands without allowing fully autonomous irreversible action and without overwriting audit history.
- **Implementation**: `astraea.decision.calibration.FeedbackCalibration`
- **Tests**: `tests/astraea/test_calibration.py`
- **Benchmarks**: Operator rejection case, operator edit case
- **UI Proof**: Operator feedback panel in command center; calibration trace in replay; decision center approve/reject buttons.
- **Evidence Status**: `implemented`

### C5: Decision Integrity Score
- **Source**: Shafer & Vovk / conformal prediction references
- **Claim**: A composite integrity score combines replayability, evidence coverage, counterfactual stability, and human-review state into a single interpretable metric.
- **Implementation**: `astraea.decision.integrity.DecisionIntegrityScore`
- **Tests**: `tests/astraea/test_integrity.py`
- **Benchmarks**: All benchmark scenarios include expected integrity score range
- **UI Proof**: Decision integrity score badge in command center, decision center, replay, and incident detail.
- **Evidence Status**: `implemented`

### C6: Deterministic Replay and Hash Stability
- **Source**: Internal operational requirement (informed by reproducibility literature)
- **Claim**: Same inputs produce identical decision scores, hashes, and explanations.
- **Implementation**: `astraea.core.replay.ReplayStore`; `apps.api_gateway.services.decision_service._compute_replay_hash`
- **Tests**: `tests/astraea/test_pipeline.py`; `tests/unit/test_decision_engine.py`
- **Benchmarks**: All benchmark scenarios are replay-stable
- **UI Proof**: Replay hash chain in command center; replay page decision history.
- **Evidence Status**: `implemented`

### C7: Model/Dataset Documentation
- **Source**: Mitchell et al., 2019; Gebru et al., 2021
- **Claim**: Decision records and benchmark fixtures carry structured documentation (decision cards / dataset cards) describing intended use, performance, and limitations.
- **Implementation**: `packages.domain.models.decision_card.DecisionCard`; `packages.domain.models.dataset_card.DatasetCard`
- **Tests**: `tests/unit/test_decision_card.py`
- **Benchmarks**: Decision card generated for each benchmark fixture
- **UI Proof**: Audit page model report; docs/research/ source registry.
- **Evidence Status**: `implemented`

### C8: Uncertainty-Aware Confidence Bands
- **Source**: Shafer & Vovk, 2008; Angelopoulos & Bates, 2021
- **Claim**: Decisions report confidence bands and review thresholds, not just point confidence values.
- **Implementation**: `astraea.shared.schemas.ModelAssessment.uncertainty_low/high`; `astraea.decision.integrity`
- **Tests**: `tests/astraea/test_integrity.py`
- **Benchmarks**: Contradictory evidence lowers band width; missing evidence raises review threshold
- **UI Proof**: Confidence band shown in decision center; review-required badge when band crosses threshold.
- **Evidence Status**: `implemented`

---

## Banned Claims (Explicitly Not Made)

| Banned Phrase | Why | Replacement |
|---|---|---|
| "Fully autonomous incident response" | Human approval is required for all irreversible actions | "Operator-assisted decision support" |
| "100% accurate" | All scores are probabilistic with explicit uncertainty bands | "Uncertainty-aware confidence scoring" |
| "Novel breakthrough" | Methods are operational subsets of published research | "Research-backed operational implementation" |
| "Proven in production" | Current deployment is demo/staging | "Deterministically tested with benchmark artifacts" |
| "Zero false positives" | Explicit uncertainty penalty and review thresholds exist | "Human-review threshold for low-confidence cases" |
