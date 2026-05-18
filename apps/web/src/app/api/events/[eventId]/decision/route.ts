import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_EVENT_STREAM } from "@/lib/demo-scenario";

function demoDecisionForEvent(eventId: string) {
  const event = DEMO_EVENT_STREAM.find((item) => item.event_id === eventId) ?? DEMO_EVENT_STREAM[0];
  return {
    id: 4800 + DEMO_EVENT_STREAM.findIndex((item) => item.event_id === event.event_id) + 1,
    event_id: event.event_id,
    decision_ts: event.occurred_at,
    priority_score: event.severity === "critical" ? 0.81 : 0.62,
    severity_score: event.severity === "critical" ? 0.95 : 0.75,
    urgency_score: event.severity === "critical" ? 0.85 : 0.65,
    business_impact_score: event.severity === "critical" ? 0.79 : 0.58,
    sla_risk_score: 0.55,
    recurrence_score: 0.25,
    dependency_criticality_score: 0.4,
    actionability_score: 0.8,
    uncertainty_penalty: 0.05,
    root_cause_hypothesis: `${event.event_type}_operational_dependency_disruption`,
    confidence_score: 0.88,
    risk_level: event.severity === "critical" ? "high" : "medium",
    requires_human_review: true,
    replay_hash: `sha256:${event.event_id}.demo`,
    recommendations: [
      {
        id: 1,
        rank: 1,
        action_type: "workflow",
        action_label: "Validate asset status, notify site owner, and queue remediation workflow.",
        rationale: "Generated from the demo event stream and dependency context.",
        risk_level: event.severity === "critical" ? "high" : "medium",
        expected_benefit: "Preserve continuity while keeping the audit trail intact.",
        confidence: 0.88,
        recommended_runbook_id: "demo-runbook",
        status: "proposed",
      },
    ],
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return proxyBackend(`/api/events/${eventId}/decision`, undefined, () =>
    NextResponse.json(demoDecisionForEvent(eventId))
  );
}
