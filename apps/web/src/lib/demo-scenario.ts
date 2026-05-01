import type { Incident, Ticket } from "@/types";

const NOW = new Date("2026-04-27T16:42:00.000Z");

function isoMinutesAgo(minutes: number) {
  return new Date(NOW.getTime() - minutes * 60_000).toISOString();
}

type RationaleToken = { token: string; value: string; weight: number };
type EvidenceArtifact = { id: string; label: string; path: string; size: string; hash: string; severity: "crit" | "warn" | "ok" | "info" };
type FeedbackEntry = { actor: string; kind: "APPROVE" | "REJECT" | "REVIEW" | "ACK"; ts: string; note: string };
type AuditEntry = { ts: string; actor: string; action: string; hash: string };

export const DEMO_RATIONALE: RationaleToken[] = [
  { token: "vibration_rms", value: "12.4 mm/s", weight: 0.41 },
  { token: "operator_ticket_corr", value: "0.91", weight: 0.27 },
  { token: "bearing_temp_drift", value: "+18C", weight: 0.18 },
  { token: "historical_match", value: "INC-2023-089", weight: 0.14 },
];

export const DEMO_EVIDENCE: EvidenceArtifact[] = [
  { id: "slo", label: "SLO burn rate", path: "slo_burn_rate.csv", size: "2.1 KB", hash: "9f1e-c2", severity: "warn" },
  { id: "k8s", label: "K8s event window", path: "k8s_event_window.json", size: "14.6 KB", hash: "a4d2-77", severity: "ok" },
  { id: "wave", label: "Forensic waveform", path: "forensic_waveform.bin", size: "1.8 MB", hash: "5b07-91", severity: "crit" },
  { id: "runbook", label: "Operator runbook", path: "runbook.bearing.md", size: "3.4 KB", hash: "0c9a-2f", severity: "info" },
];

export const DEMO_FEEDBACK: FeedbackEntry[] = [
  { actor: "Ops Lead / M. Santos", kind: "APPROVE", ts: isoMinutesAgo(22), note: "Correct routing. Bearing temp drift confirms degradation." },
  { actor: "Reliability / A. Rahman", kind: "REVIEW", ts: isoMinutesAgo(12), note: "Request one more vibration sampling window before final closure." },
  { actor: "Mechanical / L. Okafor", kind: "ACK", ts: isoMinutesAgo(6), note: "Crew dispatched to Press Line 3. ETA 18 minutes." },
];

export const DEMO_AUDIT: AuditEntry[] = [
  { ts: "10:20:14Z", actor: "ops.lead.santos", action: "feedback.approve", hash: "0c9a-2f" },
  { ts: "10:05:41Z", actor: "orchestrator.v3", action: "workflow.route", hash: "5b07-91" },
  { ts: "09:18:22Z", actor: "astraea.core", action: "decision.commit", hash: "a4d2-77" },
  { ts: "08:31:15Z", actor: "operator_joe", action: "ticket.open", hash: "9f1e-c2" },
  { ts: "08:30:00Z", actor: "sensor_gateway", action: "signal.ingest", hash: "3a11-04" },
];

export const DEMO_TICKETS: Ticket[] = [
  {
    ticket_id: "INC-4821",
    title: "Press Line 3 vibration cascade",
    status: "Open",
    priority_raw: "Critical",
    priority_score: 96,
    root_cause_hypothesis: "bearing degradation",
    confidence_score: 0.92,
    site: "Plant-A",
    assignee: "M. Santos",
    category: "Mechanical",
    created_at: isoMinutesAgo(185),
    days_open: 3,
    incident_id: "IR-2026-041",
    description: "Accelerometer stream crossed deterministic threshold and operator ticket correlation confirmed a mechanical failure path.",
    resolution_notes: "Route to mechanical team and schedule bearing replacement.",
    requester: "machine telemetry + operator ticket",
  },
  {
    ticket_id: "INC-4814",
    title: "Kubernetes ingress retries spiking for telemetry ingest API",
    status: "In Progress",
    priority_raw: "High",
    priority_score: 88,
    root_cause_hypothesis: "ingress_controller_backpressure",
    confidence_score: 0.84,
    site: "Core-Cluster",
    assignee: "A. Rahman",
    category: "Kubernetes",
    created_at: isoMinutesAgo(122),
    days_open: 2,
    incident_id: "IR-2026-040",
    requester: "prometheus",
  },
  {
    ticket_id: "INC-4799",
    title: "ERP auth failures correlated with IAM policy drift",
    status: "Waiting for Info",
    priority_raw: "High",
    priority_score: 82,
    root_cause_hypothesis: "policy_drift",
    confidence_score: 0.8,
    site: "ERP",
    assignee: "S. Patel",
    category: "Access",
    created_at: isoMinutesAgo(340),
    days_open: 4,
    incident_id: "IR-2026-039",
    requester: "helpdesk",
  },
  {
    ticket_id: "INC-4785",
    title: "Packaging line barcode scanner fleet intermittent timeout",
    status: "Open",
    priority_raw: "Medium",
    priority_score: 69,
    root_cause_hypothesis: "edge_switch_flap",
    confidence_score: 0.72,
    site: "Plant-C",
    assignee: "J. Kim",
    category: "Network",
    created_at: isoMinutesAgo(430),
    days_open: 5,
    incident_id: "IR-2026-038",
    requester: "operator-ticket",
  },
  {
    ticket_id: "INC-4762",
    title: "Batch historian lag exceeded SLO for 14 minutes",
    status: "Resolved",
    priority_raw: "Medium",
    priority_score: 53,
    root_cause_hypothesis: "storage_iops_saturation",
    confidence_score: 0.77,
    site: "Data-Lake",
    assignee: "L. Rivera",
    category: "Data",
    created_at: isoMinutesAgo(700),
    days_open: 1,
    incident_id: "IR-2026-037",
    requester: "monitoring",
  },
];

export const DEMO_INCIDENTS: Incident[] = [
  {
    id: "IR-2026-041",
    title: "Press Line 3 vibration cascade",
    status: "Investigating",
    root_cause_hypothesis: "bearing degradation",
    ticket_count: 12,
    confidence: 88,
    business_impact_score: 84,
    opened_at: isoMinutesAgo(190),
  },
  {
    id: "IR-2026-040",
    title: "Telemetry ingest API congestion wave",
    status: "Mitigating",
    root_cause_hypothesis: "ingress_controller_backpressure",
    ticket_count: 8,
    confidence: 79,
    business_impact_score: 71,
    opened_at: isoMinutesAgo(140),
  },
  {
    id: "IR-2026-039",
    title: "ERP identity control drift",
    status: "Monitoring",
    root_cause_hypothesis: "policy_drift",
    ticket_count: 6,
    confidence: 74,
    business_impact_score: 63,
    opened_at: isoMinutesAgo(355),
  },
];

export const DEMO_METRICS = {
  total_open: 4,
  critical: 1,
  sla_breach_risk: 3,
  incident_clusters: 3,
};

export function getDemoReplay(ticketId: string) {
  const ticket = DEMO_TICKETS.find((t) => t.ticket_id === ticketId) ?? DEMO_TICKETS[0];
  const root = ticket.root_cause_hypothesis || "unknown_root";
  return {
    ticket_id: ticket.ticket_id,
    latest_decision: {
      priority_score: ticket.priority_score || 0,
      root_cause_hypothesis: root,
    },
    decision_history: [
      {
        id: 1,
        decision_ts: isoMinutesAgo(120),
        priority_score: Math.max(35, (ticket.priority_score || 75) - 12),
        root_cause_hypothesis: `${root}_initial`,
        confidence_score: 0.63,
      },
      {
        id: 2,
        decision_ts: isoMinutesAgo(72),
        priority_score: Math.max(45, (ticket.priority_score || 75) - 6),
        root_cause_hypothesis: root,
        confidence_score: 0.79,
      },
      {
        id: 3,
        decision_ts: isoMinutesAgo(9),
        priority_score: ticket.priority_score || 0,
        root_cause_hypothesis: root,
        confidence_score: ticket.confidence_score || 0.85,
      },
    ],
    events: [
      { event_type: "signal_ingested", event_ts: isoMinutesAgo(190), actor_type: "sensor_gateway" },
      { event_type: "cluster_linked", event_ts: isoMinutesAgo(138), actor_type: "astraea" },
      { event_type: "workflow_routed", event_ts: isoMinutesAgo(72), actor_type: "orchestrator" },
      { event_type: "operator_feedback_recorded", event_ts: isoMinutesAgo(24), actor_type: "operator" },
    ],
    operator_feedback: [
      {
        feedback_type: "approve",
        feedback_note: "Ops Lead approves route to mechanical team based on deterministic evidence.",
        feedback_ts: isoMinutesAgo(22),
        operator_id: "ops.lead.m.santos",
      },
      {
        feedback_type: "question",
        feedback_note: "Reliability requests one more vibration sampling window before final closure.",
        feedback_ts: isoMinutesAgo(12),
        operator_id: "reliability.a.rahman",
      },
    ],
    similar_cases: DEMO_TICKETS.filter((t) => t.ticket_id !== ticket.ticket_id).slice(0, 3).map((t) => ({
      ticket_id: t.ticket_id,
      title: t.title,
      status: t.status,
    })),
  };
}

export function getDemoIncident(incidentId: string) {
  const incident = DEMO_INCIDENTS.find((i) => i.id === incidentId) ?? DEMO_INCIDENTS[0];
  const tickets = DEMO_TICKETS.filter((t) => t.incident_id === incident.id);
  return {
    incident: {
      title: incident.title,
      status: incident.status,
      ticket_count: incident.ticket_count,
      confidence: incident.confidence,
      business_impact_score: incident.business_impact_score,
      opened_at: incident.opened_at,
    },
    common_cause:
      "Signal anomalies, maintenance telemetry, and queue comments resolve to one deterministic hypothesis with strong cross-source agreement.",
    recommended_action:
      "Route to mechanical team and schedule bearing replacement with an additional vibration sampling window before closure.",
    tickets: tickets.map((ticket) => ({
      ticket_id: ticket.ticket_id,
      title: ticket.title,
      status: ticket.status,
      priority_score: ticket.priority_score,
    })),
  };
}
