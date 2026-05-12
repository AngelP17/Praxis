# Demo Transcript

## Narrative Walkthrough (3 minutes)

> "I will start with the signal queue. This event came from machine telemetry on Press Line 3."

Open the Command Center at `http://localhost:3000/command-center`.

Point to the signal queue. Highlight:
- Machine ID
- Vibration RMS value (12.4, threshold 8.0)
- Severity: critical
- Source: machine telemetry + operator ticket

> "Astraea evaluated it using eight features: severity, urgency, business impact, SLA risk, recurrence, dependency criticality, actionability, and uncertainty."

Open the Decision Explanation panel. Highlight:
- Priority score: 87
- Confidence: 0.92
- Root cause hypothesis: "Bearing degradation causing vibration cascade"
- Replay hash: `sha256:a1b2c3d4...`

> "The decision was not just a score. It produced a root cause hypothesis, confidence value, recommendation, human review requirement, and replay hash."

Show the recommendation:
- "Route to mechanical team immediately. Schedule bearing replacement within 2 hours."
- Human review required: true

> "Now Praxis turns that decision into an operational workflow: incident correlation, ticket routing, feedback capture, and audit export."

Show the incident detail panel:
- Incident key: INC-2024-001
- Correlated events: sensor alert + operator ticket
- Ticket routed to mechanical team

> "The operator reviewed the context and accepted the recommendation."

Show the feedback panel:
- Actor: alice
- Feedback type: accept
- Note: "Correct priority. Bearing was indeed degraded."

> "The key design principle is accountability. After the incident, we can replay what the system knew, what it recommended, who acted, and why."

Open the Replay page. Show:
- Raw event preserved
- Normalized payload
- Feature snapshot at decision time
- Decision record with matching replay hash
- Operator feedback
- Resolution record

> "This is not a dashboard. It is an accountable operational system."

---

## Technical Highlights to Mention

1. **Deterministic scoring**: Given the same input, Astraea always produces the same output. The replay hash proves it.
2. **Human-in-the-loop**: No unilateral automation. Every critical decision requires operator review.
3. **Immutable records**: Raw events are never modified. Decision records are append-only.
4. **SLO-backed evidence**: For infrastructure incidents, we attach availability, latency, error rate, and MTTR context.
5. **Monorepo with 13 passing tests**: Unit tests for decision engine, integration tests for the full flagship path.

---

## Closing Statement

> "Praxis turns incident management from reactive firefighting into accountable operational intelligence. The value is not prediction alone. The value is decision accountability."
