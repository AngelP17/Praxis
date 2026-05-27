# ADR 0002: Use Deterministic Replay Over Probabilistic Agent State

## Status
Accepted

## Context
Many modern AI platforms rely on LLM agent loops to orchestrate and execute operational decisions. LLM responses are probabilistic and nondeterministic; running the exact same model with identical inputs can yield different outputs. In physical control systems or security infrastructure, probabilistic decision paths are a massive liability and prevent robust auditing.

## Decision
We strictly enforce a deterministic, replayable scoring logic inside the decision engine. Non-deterministic operations (such as parsing or mapping messy signals) are executed once as frozen ontologies and feature snapshots. The actual priority scoring, evidence trust grading, action planning, and replay hashing are executed by pure, deterministic, rule-based algorithms. Any auditor must be able to run the same code over the same inputs and obtain the identical hash.

## Alternatives Considered
- **Direct LLM Decision Scoring**: Letting a large language model determine priority scores and next-best actions. Rejected because it is impossible to audit or formally verify.
- **Probabilistic LLM State Tracking**: Letting an LLM agent state machine track the ontology. Rejected because of state-drift risk.

## Consequences
### Positive
- 100% predictable decision behavior.
- Replay tests can mathematically guarantee that no decision has drifted.
- Simplifies testing and automated CI verification gates.

### Negative
- Less flexibility in handling unexpected edge cases compared to interactive agent models.
- Heavy reliance on the ontology compiler to map unstructured data perfectly into structured fields first.

## How this is verified
- Verified via `test_replay_service.py` and `test_decision_replay.py`, confirming that replaying identical incidents produces the exact same cryptographic hash.
- Enforced by continuous benchmarking in `run_benchmarks.py`, validating deterministic execution across all registered solution packs.
