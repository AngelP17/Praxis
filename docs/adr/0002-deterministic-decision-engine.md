# ADR 0002: Deterministic Decision Engine

## Status
Accepted

## Context
Astraea scores and prioritizes operational events. In early prototypes, the scoring algorithm used non-deterministic components (random initialization, timestamp-dependent weights, external API calls). This caused:
- Different scores for the same event on re-evaluation
- Unreproducible post-mortems
- Operator distrust ("why did this score change?")
- Failed regulatory audits

## Decision
Astraea will be a **deterministic decision engine**. Every decision is a pure function of:
1. Normalized event payload
2. Feature snapshot (extracted at decision time)
3. Active rule version
4. Engine version

The output includes a `replay_hash` (SHA-256 of inputs) that can be independently verified.

## Consequences

### Positive
- Decisions are reproducible
- Post-mortems can reconstruct exact reasoning
- Operators can verify decisions
- Regulatory compliance is simplified
- A/B testing of rule versions is explicit

### Negative
- Cannot use non-deterministic ML models in the core scoring path
- Feature extraction must be versioned and snapshotted
- Slightly more storage (feature snapshots per decision)

## Mitigation
- Non-deterministic components (similar case retrieval, fuzzy matching) are allowed **outside** the core decision path
- Feature snapshots are stored as JSONB in PostgreSQL
- Rule versioning uses semantic versioning with migration scripts

## Date
2024-01-15

## Author
Angel Pinzon
