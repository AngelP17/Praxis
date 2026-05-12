# ADR 0003: Human Review Over Auto-Remediation

## Status
Accepted

## Context
Many incident management platforms offer fully automated remediation: auto-restart pods, auto-scale infrastructure, auto-escalate tickets. This sounds efficient but creates risks:
- Automated actions can create secondary failures
- Context may be incomplete when the system acts
- Regulatory and safety environments require human approval
- Operator skill atrophies if the system always decides

## Decision
Praxis will **recommend** action but require **human approval** for all critical decisions. The system:
1. Scores and prioritizes events
2. Generates recommendations with explanation
3. Presents them to operators
4. Captures operator feedback (accept, reject, override)
5. Uses feedback to improve future recommendations

Auto-remediation is explicitly out of scope for the flagship acceptance path.

## Consequences

### Positive
- Prevents automated secondary failures
- Preserves operator judgment and context
- Creates a feedback loop for continuous improvement
- Satisfies regulatory requirements
- Builds operator trust in the system

### Negative
- Slower response time for trivial incidents
- Requires 24/7 operator coverage
- More complex UI (must support review workflows)

## Mitigation
- Low-risk, high-confidence recommendations can be pre-approved via policy
- The UI is optimized for rapid review (keyboard shortcuts, batch actions)
- Response time is measured and reported as an SLO

## Date
2024-01-15

## Author
Angel Pinzon
