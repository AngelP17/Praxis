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
  { token: "gpo_permission_drift", value: "drifted", weight: 0.41 },
  { token: "ping_failure", value: "failed", weight: 0.27 },
  { token: "last_seen_drift", value: "14m ago", weight: 0.18 },
  { token: "historical_match", value: "INC-2026-041", weight: 0.14 },
];

export const DEMO_EVIDENCE: EvidenceArtifact[] = [
  { id: "gpo", label: "GPO permission status", path: "gpo_drift_status.json", size: "1.2 KB", hash: "9f1e-c2", severity: "crit" },
  { id: "ping", label: "Printer ping check", path: "printer_ping_test.json", size: "0.8 KB", hash: "a4d2-77", severity: "warn" },
  { id: "logs", label: "Active Directory audit logs", path: "ad_audit_records.log", size: "45.1 KB", hash: "5b07-91", severity: "info" },
  { id: "runbook", label: "GPO drift remediation runbook", path: "runbook.printer.md", size: "3.4 KB", hash: "0c9a-2f", severity: "info" },
];

export const DEMO_FEEDBACK: FeedbackEntry[] = [
  { actor: "Ops Lead / M. Santos", kind: "APPROVE", ts: isoMinutesAgo(22), note: "Correct routing. GPO drift confirms access degradation." },
  { actor: "Reliability / A. Rahman", kind: "REVIEW", ts: isoMinutesAgo(12), note: "Request verify Active Directory replication status before final closure." },
  { actor: "IT Operations / L. Okafor", kind: "ACK", ts: isoMinutesAgo(6), note: "Spooler restarted and printers mapped successfully." },
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
    title: "Printer mapping GPO permission drift: labeling workflow blocked",
    status: "Open",
    priority_raw: "Critical",
    priority_score: 87,
    root_cause_hypothesis: "gpo_permission_drift",
    confidence_score: 0.91,
    site: "Plant-TX",
    assignee: "M. Santos",
    category: "Endpoint",
    created_at: isoMinutesAgo(185),
    days_open: 3,
    incident_id: "IR-2026-041",
    description: "Zebra printer mapping failure delayed shipping due to Active Directory GPO permission mismatch.",
    resolution_notes: "Override GPO permission settings, map Zebra printers by IP, and restart spooler.",
    requester: "praxis.adapters.printer",
  },
  {
    ticket_id: "INC-4814",
    title: "Primary ISP link offline: Firewall-EDGE-01 backup failover failed",
    status: "In Progress",
    priority_raw: "High",
    priority_score: 88,
    root_cause_hypothesis: "failover_route_degraded",
    confidence_score: 0.88,
    site: "Plant-A",
    assignee: "A. Rahman",
    category: "Networking",
    created_at: isoMinutesAgo(122),
    days_open: 2,
    incident_id: "IR-2026-040",
    description: "Primary WAN interface offline. Starlink backup interface degraded with severe high packet loss and route configuration errors.",
    resolution_notes: "Reset backup interfaces, temporarily route traffic via LTE, and flush DNS.",
    requester: "network_monitor",
  },
  {
    ticket_id: "INC-4799",
    title: "Active Directory GPO onboarding drift: new user blocked from ERP",
    status: "Waiting for Info",
    priority_raw: "High",
    priority_score: 85,
    root_cause_hypothesis: "ad_onboarding_drift",
    confidence_score: 0.85,
    site: "Plant-A",
    assignee: "S. Patel",
    category: "Access Control",
    created_at: isoMinutesAgo(340),
    days_open: 4,
    incident_id: "IR-2026-039",
    description: "New hires cannot access ERP, printers, or email groups due to Active Directory onboarding group mapping drift.",
    resolution_notes: "Synchronize Okta identity groups, reconcile Active Directory group policy settings, and provision required ERP licenses.",
    requester: "active_directory",
  },
  {
    ticket_id: "INC-4785",
    title: "PostgreSQL database replication lag alert: connection pool saturated",
    status: "Open",
    priority_raw: "High",
    priority_score: 92,
    root_cause_hypothesis: "postgresql_replication_lag",
    confidence_score: 0.92,
    site: "Dallas",
    assignee: "J. Kim",
    category: "Database",
    created_at: isoMinutesAgo(430),
    days_open: 5,
    incident_id: "IR-2026-038",
    description: "PostgreSQL replica lag exceeded SLA target by 120s due to connection pool saturation on Pgpool load balancer.",
    resolution_notes: "Re-route write queries, tune connection pools via pgpool, and verify promoted primary database state.",
    requester: "postgres-replica",
  },
];

export const DEMO_INCIDENTS: Incident[] = [
  {
    id: "IR-2026-041",
    title: "Printer GPO Drift",
    status: "Investigating",
    root_cause_hypothesis: "gpo_permission_drift",
    ticket_count: 8,
    confidence: 91,
    business_impact_score: 87,
    opened_at: isoMinutesAgo(190),
  },
  {
    id: "IR-2026-040",
    title: "Network Edge Failover",
    status: "Mitigating",
    root_cause_hypothesis: "failover_route_degraded",
    ticket_count: 8,
    confidence: 88,
    business_impact_score: 88,
    opened_at: isoMinutesAgo(140),
  },
  {
    id: "IR-2026-039",
    title: "Identity Onboarding Drift",
    status: "Monitoring",
    root_cause_hypothesis: "ad_onboarding_drift",
    ticket_count: 8,
    confidence: 85,
    business_impact_score: 85,
    opened_at: isoMinutesAgo(355),
  },
  {
    id: "IR-2026-038",
    title: "Database Replication Lag",
    status: "Investigating",
    root_cause_hypothesis: "postgresql_replication_lag",
    ticket_count: 12,
    confidence: 92,
    business_impact_score: 92,
    opened_at: isoMinutesAgo(520),
  },
];

export const DEMO_METRICS = {
  total_open: 4,
  critical: 1,
  sla_breach_risk: 3,
  incident_clusters: 4,
  signals_processed_24h: 2418736,
  avg_decision_latency_ms: 184,
  replay_coverage_percent: 100,
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
  { event_id: "evt-8f4a21", source: "praxis.adapters.printer", event_type: "com.praxis.asset.printer.offline", severity: "critical", site: "Plant-TX", occurred_at: isoMinutesAgo(188), created_at: isoMinutesAgo(187) },
  { event_id: "evt-77a2b4", source: "network_monitor", event_type: "com.praxis.infra.wan.offline", severity: "high", site: "Plant-A", occurred_at: isoMinutesAgo(121), created_at: isoMinutesAgo(120) },
  { event_id: "evt-42de90", source: "active_directory", event_type: "com.praxis.identity.ad.gpo_drift", severity: "medium", site: "Plant-A", occurred_at: isoMinutesAgo(338), created_at: isoMinutesAgo(337) },
  { event_id: "evt-12bc09", source: "postgres-replica", event_type: "com.praxis.database.replication.lag", severity: "high", site: "Dallas", occurred_at: isoMinutesAgo(514), created_at: isoMinutesAgo(513) },
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
        feedback_note: "Ops Lead approves route based on deterministic evidence.",
        feedback_ts: isoMinutesAgo(22),
        operator_id: "ops.lead.m.santos",
      },
      {
        feedback_type: "question",
        feedback_note: "Reliability requests verification of AD replication before final closure.",
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
      "Route to respective operations team, reconcile group policies, and verify interface / database replication state.",
    tickets: tickets.map((ticket) => ({
      ticket_id: ticket.ticket_id,
      title: ticket.title,
      status: ticket.status,
      priority_score: ticket.priority_score,
    })),
  };
}
