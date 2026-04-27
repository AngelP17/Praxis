# Demo Script: Interview Narrative

## The Pitch (60 seconds)

> "Aether Sentinel is an operational intelligence platform, not a dashboard. It treats every incident as a decision lifecycle: Signal -> Decision -> Workflow -> Feedback -> Replay."

> "Most systems show you that CPU is high. Aether Sentinel tells you that this CPU spike correlates with a ticket from three days ago, affects a business-critical workflow, and should be routed to the on-call engineer who resolved the last similar incident."

> "Every decision is deterministic, explainable, and replayable. Every recommendation can be reviewed, accepted, rejected, or overridden by a human operator. And every incident leaves an immutable audit trail."

## Architecture Narrative (2 minutes)

### Signal Ingestion
Events arrive from tickets, machine sensors, Kubernetes alerts, and operator notes. They are normalized into a canonical `OperationalEvent` schema and validated.

### Astraea Decision Engine
Astraea extracts features (severity, urgency, business impact, SLA risk, recurrence, dependency criticality, actionability, uncertainty penalty) and scores each event. The output includes a priority score, confidence score, root cause hypothesis, recommendation, and a deterministic replay hash.

### Aether Workflow
The workflow layer correlates events into incidents, creates or updates tickets, routes ownership, and captures human feedback.

### Platform Evidence
For infrastructure incidents, SLO evidence (availability, latency, error rate, MTTR) is attached from the Kubernetes platform service.

### Replay and Audit
After resolution, the full incident can be replayed from raw event to final state. The audit export produces a structured timeline with decisions, feedback, and evidence.

## Key Differentiators

1. **Deterministic decisions**: Same input always produces same output. Auditors can verify.
2. **Human-in-the-loop**: System recommends, human decides. No unilateral automation.
3. **Replayability**: Reconstruct any incident from source evidence.
4. **SLO-backed evidence**: Infrastructure incidents are judged by user impact, not just symptoms.
5. **Closed feedback loop**: Human feedback improves future recommendations.

## Technical Highlights

- Monorepo with 13 passing tests (unit + integration)
- FastAPI gateway with full CRUD for events, decisions, incidents, replay, audit
- PostgreSQL with immutable records and deterministic replay hashes
- Next.js 16 + React 19 + Tailwind CSS v4 frontend
- Framer Motion for purposeful UI transitions
- Phosphor Icons, Geist font, amber-only accent palette
- `make test` passes, `npm run build` passes, `npm audit --omit=dev` shows 0 vulnerabilities

## Common Questions

**Q: Why not fully automate remediation?**
A: Automated actions can create secondary failures. In regulated environments, human approval is required. The system recommends; humans decide.

**Q: Why deterministic scoring instead of ML?**
A: Determinism enables auditability and operator trust. Post-mortems can reconstruct exact reasoning. ML can be used outside the core scoring path for similarity matching.

**Q: What happens if the platform service is down?**
A: Decision scoring continues with symptom-only data. Platform evidence is fetched asynchronously and attached when available.

**Q: How do you prevent tight coupling in the monorepo?**
A: Strict package boundaries, separate `pyproject.toml` per package, and shared domain models that are versioned explicitly.

## Closing

> "Aether Sentinel turns incident management from reactive firefighting into accountable operational intelligence. The goal is not prediction alone. The goal is decision accountability."
