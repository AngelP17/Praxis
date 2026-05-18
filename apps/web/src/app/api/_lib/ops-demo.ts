import {
  DEMO_AUDIT,
  DEMO_EVENT_STREAM,
  DEMO_INCIDENTS,
  DEMO_METRICS,
  DEMO_TICKETS,
  getDemoIncident,
} from "@/lib/demo-scenario";
import { getDemoProof } from "@/lib/praxis-demo-data";
import type { CatalogOptions, TicketAttachment, TicketComment, TicketDetailPayload } from "@/types";
import { createHash } from "crypto";

function deterministicTicketHash(ticketId: string): string {
  const data = JSON.stringify({ ticket_id: ticketId });
  const digest = createHash("sha256").update(data).digest("hex").slice(0, 32);
  return `sha256:${digest}`;
}

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

const BASE_DEMO_LABELS = [
  { id: 1, name: "needs-triage", color: "#8B5CFF" },
  { id: 2, name: "mechanical", color: "#3EFFA8" },
  { id: 3, name: "customer-facing", color: "#F97316" },
];

const BASE_DEMO_CATEGORIES = [
  { id: 1, name: "Mechanical", color: "#8B5CFF", icon: "wrench", is_custom: false, is_active: true },
  { id: 2, name: "Kubernetes", color: "#3EFFA8", icon: "cloud", is_custom: false, is_active: true },
  { id: 3, name: "Access", color: "#F97316", icon: "shield", is_custom: false, is_active: true },
  { id: 4, name: "Network", color: "#60A5FA", icon: "network", is_custom: false, is_active: true },
];

const BASE_DEMO_ASSIGNEES = ["M. Santos", "A. Rahman", "S. Patel", "J. Kim", "L. Rivera"];
export const DEMO_USERS = [
  { username: "admin", role: "admin", display_name: "Admin" },
  { username: "operator", role: "agent", display_name: "Demo Operator" },
  { username: "viewer", role: "viewer", display_name: "Viewer" },
];

let demoUsers = [...DEMO_USERS];
let demoCategories = [...BASE_DEMO_CATEGORIES];
let demoLabels = [...BASE_DEMO_LABELS];
let demoAssignees = [...BASE_DEMO_ASSIGNEES];

const DEMO_ATTACHMENTS: TicketAttachment[] = [
  {
    id: 9001,
    original_name: "bearing-waveform.bin",
    mime_type: "application/octet-stream",
    file_size: 1887436,
    created_at: new Date("2026-04-27T16:20:00.000Z").toISOString(),
    uploaded_by: "operator",
    comment_id: null,
    url: "/api/attachments/9001",
  },
];

const DEMO_COMMENTS: TicketComment[] = [
  {
    id: 7001,
    ticket_id: "INC-4821",
    author_username: "operator",
    author_display_name: "Demo Operator",
    body: "Mechanical route confirmed. Bearing replacement window approved for the next maintenance stop.",
    created_at: new Date("2026-04-27T16:24:00.000Z").toISOString(),
    updated_at: new Date("2026-04-27T16:24:00.000Z").toISOString(),
    attachments: [],
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
    replay_hash: deterministicTicketHash(ticket.ticket_id),
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

export function getDemoUsers() {
  return [...demoUsers];
}

export function createDemoUser(payload: { username: string; role: string; display_name: string }) {
  const created = { ...payload };
  demoUsers = [...demoUsers.filter((user) => user.username !== created.username), created];
  return created;
}

export function updateDemoUser(username: string, patch: Partial<{ role: string; display_name: string }>) {
  const existing = demoUsers.find((user) => user.username === username) ?? {
    username,
    role: patch.role ?? "viewer",
    display_name: patch.display_name ?? username,
  };
  const updated = {
    ...existing,
    ...patch,
  };
  demoUsers = demoUsers.map((user) => (user.username === username ? updated : user));
  if (!demoUsers.find((user) => user.username === username)) {
    demoUsers = [...demoUsers, updated];
  }
  return updated;
}

export function deleteDemoUser(username: string) {
  demoUsers = demoUsers.filter((user) => user.username !== username);
  return { status: "success", username };
}

export function getDemoCatalogOptions(): CatalogOptions {
  return {
    categories: [...demoCategories],
    labels: [...demoLabels],
    staff: [...demoAssignees],
    assignees: [...demoAssignees],
    requesters: ["machine telemetry + operator ticket", "prometheus", "helpdesk", "operator-note"],
    users: getDemoUsers(),
  };
}

export function createDemoCategory(payload: { name: string; color: string; icon: string }) {
  const created = {
    id: Math.max(0, ...demoCategories.map((category) => category.id)) + 1,
    name: payload.name,
    color: payload.color,
    icon: payload.icon,
    is_custom: true,
    is_active: true,
  };
  demoCategories = [...demoCategories, created];
  return created;
}

export function updateDemoCategory(categoryId: number, patch: Partial<(typeof demoCategories)[number]>) {
  const existing = demoCategories.find((category) => category.id === categoryId);
  const updated = { ...(existing ?? demoCategories[0]), ...patch, id: categoryId };
  demoCategories = demoCategories.map((category) => (category.id === categoryId ? updated : category));
  return updated;
}

export function deleteDemoCategory(categoryId: number) {
  demoCategories = demoCategories.filter((category) => category.id !== categoryId);
  return { status: "success", id: categoryId };
}

export function getDemoLabels() {
  return [...demoLabels];
}

export function createDemoLabel(payload: { name: string; color: string }) {
  const created = {
    id: Math.max(0, ...demoLabels.map((label) => label.id)) + 1,
    name: payload.name,
    color: payload.color,
  };
  demoLabels = [...demoLabels, created];
  return created;
}

export function deleteDemoLabel(labelId: number) {
  demoLabels = demoLabels.filter((label) => label.id !== labelId);
  return { status: "success", id: labelId };
}

export function getDemoAssignees() {
  return [...demoAssignees];
}

export function createDemoAssignee(displayName: string) {
  if (!demoAssignees.includes(displayName)) {
    demoAssignees = [...demoAssignees, displayName];
  }
  return { display_name: displayName };
}

export function deleteDemoAssignee(displayName: string) {
  demoAssignees = demoAssignees.filter((assignee) => assignee !== displayName);
  return { status: "success", display_name: displayName };
}

export function getDemoTicketDetail(ticketId: string): TicketDetailPayload {
  const ticket = getDemoTicket(ticketId);
  const recommendationBase = ticket.resolution_notes || "Route incident to the responsible owner";

  return {
    ticket: {
      ...ticket,
      category_id:
        demoCategories.find((category) => category.name.toLowerCase() === (ticket.category ?? "").toLowerCase())?.id ?? 1,
      request_type: "incident",
      labels: demoLabels.filter((label) =>
        ticket.ticket_id === "INC-4821" ? ["needs-triage", "mechanical"].includes(label.name) : label.name === "needs-triage",
      ),
    },
    decision: {
      priority_score: ticket.priority_score,
      confidence_score: ticket.confidence_score,
      root_cause_hypothesis: ticket.root_cause_hypothesis,
      sla_risk_score: 0.74,
      actionability_score: 0.87,
      recurrence_score: 0.68,
    },
    recommendations: [
      {
        rank: 1,
        action_label: recommendationBase,
        rationale: `Praxis correlated ${ticket.requester || "live signals"} with historic incident patterns and current risk.`,
        confidence: ticket.confidence_score ?? 0.82,
      },
    ],
    similar_cases: [
      { ticket_id: "INC-2023-089", title: "Bearing degradation on Press Line 2", status: "Resolved" },
      { ticket_id: "INC-2024-112", title: "Telemetry drift after toolhead warmup", status: "Closed" },
    ],
    events: DEMO_EVENT_STREAM.slice(0, 4).map((event, index) => ({
      event_type: event.event_type,
      event_ts: new Date(`2026-04-27T16:2${index}:00.000Z`).toISOString(),
      actor_type: "system",
      actor_id: event.source,
      payload: {
        severity: event.severity,
        site: event.site,
        occurred_at: event.occurred_at,
      },
    })),
    linked_incident: ticket.incident_id ? { id: ticket.incident_id, title: getDemoIncident(ticket.incident_id).incident.title } : undefined,
    comments: ticket.ticket_id === "INC-4821" ? DEMO_COMMENTS : [],
    attachments: ticket.ticket_id === "INC-4821" ? DEMO_ATTACHMENTS : [],
  };
}

export function createDemoTicketDetail(payload: Record<string, unknown> = {}): TicketDetailPayload {
  const now = new Date("2026-04-27T17:00:00.000Z").toISOString();
  const title = typeof payload.title === "string" && payload.title.trim() ? payload.title.trim() : "New operational ticket";
  const assignee = typeof payload.staff_assigned === "string" && payload.staff_assigned.trim() ? payload.staff_assigned.trim() : "M. Santos";
  const requester = typeof payload.requester === "string" && payload.requester.trim() ? payload.requester.trim() : "operator";
  const categoryId = typeof payload.category_id === "number" ? payload.category_id : 1;
  const category = demoCategories.find((item) => item.id === categoryId)?.name ?? "Mechanical";
  return {
    ticket: {
      ticket_id: "INC-DEMO-NEW",
      title,
      status: typeof payload.status === "string" ? payload.status : "Open",
      priority_raw: typeof payload.priority === "string" ? payload.priority : "Medium",
      priority_score: 72,
      root_cause_hypothesis: "operator_reported_issue",
      confidence_score: 0.78,
      site: typeof payload.site_id === "string" ? payload.site_id : "Plant-A",
      assignee,
      category,
      category_id: categoryId,
      created_at: now,
      days_open: 0,
      description: typeof payload.description === "string" ? payload.description : "Demo ticket created through local fallback path.",
      resolution_notes: typeof payload.resolution_notes === "string" ? payload.resolution_notes : "",
      requester,
      request_type: typeof payload.request_type === "string" ? payload.request_type : "incident",
      labels: demoLabels.filter((label) => Array.isArray(payload.label_ids) && payload.label_ids.includes(label.id)),
    },
    decision: {
      priority_score: 0.72,
      confidence_score: 0.78,
      root_cause_hypothesis: "operator_reported_issue",
      sla_risk_score: 0.52,
      actionability_score: 0.79,
      recurrence_score: 0.34,
    },
    recommendations: [
      {
        rank: 1,
        action_label: "Review the new operational signal and assign the first owner.",
        rationale: "Demo fallback keeps ticket creation interactive when the backend is unavailable.",
        confidence: 0.78,
      },
    ],
    similar_cases: [],
    events: [],
    linked_incident: undefined,
    comments: [],
    attachments: [],
  };
}

export function getDemoComments(ticketId: string) {
  return getDemoTicketDetail(ticketId).comments;
}

export function getDemoAttachments(ticketId: string) {
  return getDemoTicketDetail(ticketId).attachments;
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

export const DEMO_ONTOLOGY_OBJECTS = [
  {
    object_key: "press-line-3-plc",
    object_type: "Asset",
    display_name: "Press Line 3 PLC",
    properties_json: { site: "Plant-A", owner_team: "Mechanical Ops", criticality: "critical" },
    source_refs_json: ["press-line-3.plc", "operator-console"],
    confidence: 0.92,
  },
  {
    object_key: "telemetry-ingest-api",
    object_type: "Service",
    display_name: "Telemetry Ingest API",
    properties_json: { site: "Core-Cluster", role: "signal ingestion", status: "healthy" },
    source_refs_json: ["prometheus", "ingress-controller"],
    confidence: 0.87,
  },
  {
    object_key: "historian-db",
    object_type: "Database",
    display_name: "Historian Database",
    properties_json: { site: "Plant-A", owner_team: "Data Engineering", tier: "primary" },
    source_refs_json: ["storage-array-01", "historian"],
    confidence: 0.84,
  },
];

export const DEMO_ONTOLOGY_LINKS = [
  { source: "press-line-3-plc", target: "telemetry-ingest-api", relation: "emits_to", confidence: 0.9 },
  { source: "telemetry-ingest-api", target: "historian-db", relation: "persists_to", confidence: 0.86 },
  { source: "press-line-3-plc", target: "historian-db", relation: "correlates_with", confidence: 0.78 },
];

export const DEMO_ONTOLOGY_ACTIONS = [
  { action_type: "route_mechanical", display_name: "Route to mechanical", mode: "approval", requires_approval: true },
  { action_type: "capture_evidence", display_name: "Capture evidence bundle", mode: "automatic", requires_approval: false },
  { action_type: "escalate_platform", display_name: "Escalate to platform", mode: "approval", requires_approval: true },
];

export function getDemoValueCase(valueCaseId = "manufacturing-printer-gpo") {
  const proof = getDemoProof(valueCaseId);
  return {
    value_case_id: `vc_${valueCaseId}`,
    solution_pack_id: valueCaseId,
    customer_context_json: { industry: "manufacturing", environment: "fieldlab-demo" },
    assumptions_json: {
      evidence_trust: proof.evidence.evidence_trust,
      raw_events: proof.evidence.raw_events,
      ontology_objects: proof.ontology.objects_created,
    },
    formulas_json: {
      primary_driver: proof.value_case.primary_value_driver,
      annual_value: proof.value_case.estimated_annual_value,
    },
    estimated_annual_value: proof.value_case.estimated_annual_value,
    confidence: proof.value_case.confidence,
    evidence_refs_json: proof.evidence.sources,
  };
}

export function getDemoDiscovery(packId = "manufacturing-printer-gpo") {
  const proof = getDemoProof(packId);
  return {
    object_candidates: DEMO_ONTOLOGY_OBJECTS.map((object) => ({
      object_key: object.object_key,
      object_type: object.object_type,
      display_name: object.display_name,
      confidence: object.confidence,
    })),
    inferred_links: DEMO_ONTOLOGY_LINKS,
    mapping_confidence: proof.ontology.mapping_confidence,
    next_best_questions: proof.decision.next_best_questions,
    recommended_solution_pack: packId,
  };
}
