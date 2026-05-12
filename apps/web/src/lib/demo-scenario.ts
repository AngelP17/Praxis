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
  {
    ticket_id: "INC-4758",
    title: "Robot cell 12 torque variance after toolhead calibration",
    status: "In Progress",
    priority_raw: "High",
    priority_score: 79,
    root_cause_hypothesis: "calibration_offset",
    confidence_score: 0.73,
    site: "Plant-B",
    assignee: "N. Iversen",
    category: "Robotics",
    created_at: isoMinutesAgo(515),
    days_open: 2,
    incident_id: "IR-2026-036",
    requester: "quality-gate",
  },
  {
    ticket_id: "INC-4744",
    title: "Cold storage compressor telemetry dropped below heartbeat threshold",
    status: "Open",
    priority_raw: "High",
    priority_score: 76,
    root_cause_hypothesis: "edge_gateway_packet_loss",
    confidence_score: 0.69,
    site: "Warehouse-2",
    assignee: "R. Voss",
    category: "Facilities",
    created_at: isoMinutesAgo(620),
    days_open: 2,
    incident_id: "IR-2026-035",
    requester: "sensor-gateway",
  },
  {
    ticket_id: "INC-4731",
    title: "Supplier EDI queue stalled on customs document validation",
    status: "Waiting for Info",
    priority_raw: "Medium",
    priority_score: 61,
    root_cause_hypothesis: "schema_version_mismatch",
    confidence_score: 0.67,
    site: "Supply-Net",
    assignee: "T. Benitez",
    category: "Integration",
    created_at: isoMinutesAgo(880),
    days_open: 3,
    incident_id: "IR-2026-034",
    requester: "edi-monitor",
  },
  {
    ticket_id: "INC-4716",
    title: "Paint booth humidity controller drifted outside process window",
    status: "Monitoring",
    priority_raw: "Medium",
    priority_score: 58,
    root_cause_hypothesis: "humidity_sensor_drift",
    confidence_score: 0.71,
    site: "Plant-C",
    assignee: "K. Watanabe",
    category: "Process Control",
    created_at: isoMinutesAgo(960),
    resolved_at: isoMinutesAgo(90),
    days_open: 1,
    incident_id: "IR-2026-033",
    requester: "operator-note",
  },
  {
    ticket_id: "INC-4692",
    title: "Packaging label print queue delayed after firmware rollout",
    status: "Resolved",
    priority_raw: "Low",
    priority_score: 34,
    root_cause_hypothesis: "printer_firmware_regression",
    confidence_score: 0.74,
    site: "Plant-A",
    assignee: "D. Mehta",
    category: "Endpoint",
    created_at: isoMinutesAgo(1260),
    resolved_at: isoMinutesAgo(180),
    days_open: 1,
    incident_id: "IR-2026-032",
    requester: "helpdesk",
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
  {
    id: "IR-2026-036",
    title: "Robot torque variance after calibration",
    status: "Investigating",
    root_cause_hypothesis: "calibration_offset",
    ticket_count: 5,
    confidence: 73,
    business_impact_score: 66,
    opened_at: isoMinutesAgo(520),
  },
  {
    id: "IR-2026-035",
    title: "Cold storage telemetry loss",
    status: "Mitigating",
    root_cause_hypothesis: "edge_gateway_packet_loss",
    ticket_count: 4,
    confidence: 69,
    business_impact_score: 78,
    opened_at: isoMinutesAgo(622),
  },
  {
    id: "IR-2026-034",
    title: "Supplier EDI validation backlog",
    status: "Monitoring",
    root_cause_hypothesis: "schema_version_mismatch",
    ticket_count: 7,
    confidence: 67,
    business_impact_score: 54,
    opened_at: isoMinutesAgo(884),
  },
];

export const DEMO_METRICS = {
  total_open: 7,
  critical: 1,
  sla_breach_risk: 4,
  incident_clusters: 6,
  signals_processed_24h: 2418736,
  avg_decision_latency_ms: 184,
  replay_coverage_percent: 97,
  active_evidence_lanes: 4,
  p95_latency_ms: 438,
  error_rate_percent: 0.18,
  availability_percent: 99.982,
  mttr_seconds: 742,
};

export const DEMO_SIGNAL_SERIES = [
  { ts: "08:00", telemetry: 18420, tickets: 32, decisions: 29, risk: 42 },
  { ts: "09:00", telemetry: 20114, tickets: 37, decisions: 35, risk: 48 },
  { ts: "10:00", telemetry: 23891, tickets: 44, decisions: 41, risk: 63 },
  { ts: "11:00", telemetry: 26402, tickets: 51, decisions: 49, risk: 78 },
  { ts: "12:00", telemetry: 22918, tickets: 39, decisions: 44, risk: 57 },
  { ts: "13:00", telemetry: 25176, tickets: 43, decisions: 46, risk: 61 },
  { ts: "14:00", telemetry: 28770, tickets: 58, decisions: 55, risk: 84 },
  { ts: "15:00", telemetry: 26933, tickets: 46, decisions: 52, risk: 72 },
];

export const DEMO_EVENT_STREAM = [
  { event_id: "evt-8f4a21", source: "press-line-3.plc", event_type: "vibration_threshold_crossed", severity: "critical", site: "Plant-A", occurred_at: isoMinutesAgo(188), created_at: isoMinutesAgo(187) },
  { event_id: "evt-3c91de", source: "operator-console", event_type: "bearing_noise_reported", severity: "high", site: "Plant-A", occurred_at: isoMinutesAgo(182), created_at: isoMinutesAgo(181) },
  { event_id: "evt-77a2b4", source: "prometheus", event_type: "ingress_retry_burst", severity: "high", site: "Core-Cluster", occurred_at: isoMinutesAgo(121), created_at: isoMinutesAgo(120) },
  { event_id: "evt-42de90", source: "iam-audit", event_type: "policy_hash_changed", severity: "medium", site: "ERP", occurred_at: isoMinutesAgo(338), created_at: isoMinutesAgo(337) },
  { event_id: "evt-12bc09", source: "robot-cell-12", event_type: "torque_variance_detected", severity: "high", site: "Plant-B", occurred_at: isoMinutesAgo(514), created_at: isoMinutesAgo(513) },
  { event_id: "evt-66af31", source: "warehouse-edge-02", event_type: "compressor_heartbeat_missing", severity: "high", site: "Warehouse-2", occurred_at: isoMinutesAgo(619), created_at: isoMinutesAgo(618) },
];

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
