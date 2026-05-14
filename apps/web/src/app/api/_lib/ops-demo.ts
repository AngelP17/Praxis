import {
  DEMO_AUDIT,
  DEMO_EVENT_STREAM,
  DEMO_INCIDENTS,
  DEMO_METRICS,
  DEMO_TICKETS,
  getDemoIncident,
} from "@/lib/demo-scenario";

type Ticket = (typeof DEMO_TICKETS)[number];

export const DEMO_ASSETS = [
  { id: 101, asset_name: "Press Line 3 PLC", asset_type: "controller", site_id: "Plant-A", criticality: "critical", owner_team: "Mechanical Ops", dependency_json: "{\"upstream\": [\"edge-gateway-03\"]}" },
  { id: 102, asset_name: "Telemetry Ingest API", asset_type: "service", site_id: "Core-Cluster", criticality: "high", owner_team: "Platform Reliability", dependency_json: "{\"upstream\": [\"ingress-controller\", \"kafka\"]}" },
  { id: 103, asset_name: "Historian Database", asset_type: "database", site_id: "Plant-A", criticality: "high", owner_team: "Data Engineering", dependency_json: "{\"upstream\": [\"storage-array-01\"]}" },
] as const;

export const DEMO_PLATFORM_SUMMARY = {
  status: "healthy",
  service: "resilience-pilot",
  namespace: "default",
  replicas: { desired: 3, available: 3, ready: 3 },
  slo: {
    availability: { target: 99.5, current: 99.982, status: "met" },
    mttr: { target_seconds: 30, current_seconds: 12, status: "met" },
    error_rate: { target_percent: 0.5, current_percent: 0.14, status: "met" },
    p95_latency_ms: { target_ms: 500, current_ms: 184, status: "met" },
  },
  latest_incident_id: "INC-20260422153045",
  updated_at: new Date("2026-04-27T16:42:00.000Z").toISOString(),
};

export const DEMO_PLATFORM_TOPOLOGY = {
  nodes: [
    { id: "edge-plant-a", label: "Edge Plant A", group: "edge", status: "healthy", role: "telemetry intake" },
    { id: "astraea-core", label: "Astraea Core", group: "decision", status: "healthy", role: "deterministic scoring" },
    { id: "platform-cluster", label: "Platform Cluster", group: "runtime", status: "healthy", role: "orchestration + api" },
  ],
  edges: [
    { source: "edge-plant-a", target: "astraea-core", label: "signal stream" },
    { source: "astraea-core", target: "platform-cluster", label: "decision route" },
  ],
};

export const DEMO_PLATFORM_CONTROLS = [
  {
    category: "resilience",
    name: "Replay hash verification",
    artifact: "artifacts/latest/praxis_proof.json",
    status: "healthy",
    risk_reduced: "audit drift",
    why: "Replay chain and proof hash remain stable for deterministic runs.",
  },
  {
    category: "operations",
    name: "Operator approval checkpoint",
    artifact: "human_feedback",
    status: "healthy",
    risk_reduced: "unsafe automation",
    why: "High-risk actions require explicit operator review before closure.",
  },
];

function buildDecision(ticket: Ticket) {
  const confidence = ticket.confidence_score ?? 0.82;
  const recommendationBase = ticket.resolution_notes || "Route incident to the responsible owner";
  return {
    id: Number(ticket.ticket_id.replace(/\D/g, "")) || 4821,
    ticket_id: ticket.ticket_id,
    priority_score: ticket.priority_score ?? 75,
    confidence_score: confidence,
    root_cause_hypothesis: ticket.root_cause_hypothesis || "correlated operational signal",
    decision_ts: ticket.created_at,
    replay_hash: `sha256:${ticket.ticket_id.toLowerCase()}.demo`,
    recommendations: [
      {
        id: Number(`${Number(ticket.ticket_id.replace(/\D/g, "")) || 4821}1`),
        rank: 1,
        action_label: recommendationBase,
        rationale: `Praxis correlated ${ticket.requester || "live signals"} with incident history and current operating risk.`,
        risk_level: ticket.priority_raw || "High",
        confidence,
        status: "ready_for_operator",
      },
      {
        id: Number(`${Number(ticket.ticket_id.replace(/\D/g, "")) || 4821}2`),
        rank: 2,
        action_label: "Capture evidence bundle and replay hash",
        rationale: "Preserve the decision trail before closure so the incident can be replayed during review.",
        risk_level: "Medium",
        confidence: Math.max(0.62, confidence - 0.06),
        status: "ready_for_operator",
      },
    ],
  };
}

export function getDemoTicket(ticketId: string) {
  return DEMO_TICKETS.find((ticket) => ticket.ticket_id === ticketId) ?? DEMO_TICKETS[0];
}

export function getDemoDecision(ticketId: string) {
  return buildDecision(getDemoTicket(ticketId));
}

export function getDemoAuditExport(incidentId: string) {
  return {
    incident_id: incidentId,
    incident_title: getDemoIncident(incidentId).incident.title,
    exported_at: new Date("2026-04-27T16:42:00.000Z").toISOString(),
    events: DEMO_EVENT_STREAM,
    decisions: [getDemoDecision("INC-4821")],
    feedback: DEMO_AUDIT,
  };
}

export function getDemoIncidentTimeline(incidentId: string) {
  return {
    incident_id: incidentId,
    timeline: [
      { phase: "signal", detail: "Telemetry threshold crossed on press-line-3", timestamp: "T+00s" },
      { phase: "decision", detail: "Praxis priority raised to 96 with confidence 0.92", timestamp: "T+04s" },
      { phase: "workflow", detail: "Mechanical escalation route created", timestamp: "T+09s" },
      { phase: "feedback", detail: "Ops Lead approved / Reliability requested extra sample", timestamp: "T+15s" },
    ],
  };
}

export function getDemoMetrics() {
  return {
    totalTickets: DEMO_TICKETS.length,
    openTickets: DEMO_TICKETS.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status)).length,
    criticalTickets: DEMO_TICKETS.filter((ticket) => ticket.priority_raw === "Critical").length,
    activeIncidents: DEMO_INCIDENTS.length,
    totalIncidents: DEMO_INCIDENTS.length,
    ...DEMO_METRICS,
  };
}
