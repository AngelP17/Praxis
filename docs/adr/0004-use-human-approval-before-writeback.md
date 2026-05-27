# ADR 0004: Use Human Approval Before Writeback

## Status
Accepted

## Context
Executing automated remediations (such as modifying firewalls or database partitions) without human authorization exposes enterprises to catastrophic risks. If the decision engine miscalculates severity or acts on stale telemetry, unilateral writebacks could cause cascading outages.

## Decision
We enforce a strict **Human-in-the-loop (HITL) Approval Policy** for all high-impact actions.
- The `action` block of a proposed intervention defaults to `pending`.
- Any external writeback is strictly blocked until an authorized human operator marks the status as `approved` via an explicit cryptographic sign-off.
- The approved status is transactionally committed along with the operator identity and public key signature before the transactional outbox fires.
- Low-risk actions can execute in `read_only` or `assisted_action` modes, but they must be explicitly permitted by the ontology and the deployment plan's risk register.

## Alternatives Considered
- **Full Autonomous Closed-Loop**: Allowing the engine to trigger writebacks autonomously based on confidence scores. Rejected due to high operational risk.
- **Time-Gated Approval (Auto-Approve after X minutes)**: Rejected because it does not provide explicit accountability.

## Consequences
### Positive
- Prevents rogue automated changes.
- Ensures a clear line of accountability and legal trace for every action.
- Allows operators to override and reject bad recommendations.

### Negative
- Increases MTTR (Mean Time To Resolution) since a human operator must review and approve the decision.
- Requires building and maintaining a highly available operator dashboard and alerting pipelines.

## How this is verified
- Enforced at integration level: `test_decision_approval_creates_outbox` asserts that outbox events are only created when the decision transitions to an approved status.
- Verified in frontend UI components which display distinct status workflows for operator sign-offs.
