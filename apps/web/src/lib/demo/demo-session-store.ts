"use client";

import { create } from "zustand";

import { DEMO_EVENT_STREAM, DEMO_INCIDENTS, DEMO_METRICS, DEMO_TICKETS } from "@/lib/demo-scenario";
import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { getDemoProof, getDemoRun } from "@/lib/praxis-demo-data";
import type { FieldLabRun } from "@/lib/praxis-client";
import { getPackIdForScenario, SCENARIOS } from "@/lib/scenarios";
import type { Incident, Ticket, TicketComment, TicketDetailPayload } from "@/types";

export type DemoAuditEntry = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  note: string;
};

type RecommendationStatus = "ready_for_operator" | "accepted" | "rejected" | "overridden";
type DecisionStatus = "pending" | "approved" | "rejected";

type DemoSessionState = {
  tickets: Ticket[];
  incidents: Incident[];
  commentsByTicketId: Record<string, TicketComment[]>;
  recommendationStatusById: Record<number, RecommendationStatus>;
  decisionStatusById: Record<number, DecisionStatus>;
  fieldlabRuns: FieldLabRun[];
  chaosMode: "healthy" | "degraded";
  auditLog: DemoAuditEntry[];
  ticketCounter: number;
  resetDemo: () => void;
  createTicket: (payload: Record<string, unknown>) => TicketDetailPayload;
  updateTicket: (ticketId: string, payload: Record<string, unknown>) => TicketDetailPayload;
  addComment: (ticketId: string, body: string) => TicketComment;
  updateComment: (ticketId: string, commentId: number, body: string) => void;
  deleteComment: (ticketId: string, commentId: number) => void;
  resolveIncident: (incidentId: string) => void;
  setDecisionStatus: (decisionId: number, status: Exclude<DecisionStatus, "pending">, note?: string) => void;
  setRecommendationStatus: (recommendationId: number, status: RecommendationStatus, note?: string) => void;
  runPipeline: (packId: string) => FieldLabRun;
  setChaosMode: (mode: "healthy" | "degraded") => void;
};

const DEMO_NOW = new Date("2026-04-27T17:00:00.000Z").toISOString();

function audit(action: string, target: string, note: string): DemoAuditEntry {
  return {
    id: `${action}:${target}:${Date.now()}`,
    ts: new Date().toISOString(),
    actor: "demo.operator",
    action,
    target,
    note,
  };
}

function cloneSeedTickets() {
  return DEMO_TICKETS.map((ticket) => ({ ...ticket }));
}

function cloneSeedIncidents() {
  return DEMO_INCIDENTS.map((incident) => ({ ...incident }));
}

function seedComments(): Record<string, TicketComment[]> {
  return {
    [DEMO_TICKETS[0].ticket_id]: [
      {
        id: 7001,
        ticket_id: DEMO_TICKETS[0].ticket_id,
        author_username: "operator",
        author_display_name: "Demo Operator",
        body: "Route confirmed. Remediation window approved for the next maintenance stop.",
        created_at: "2026-04-27T16:24:00.000Z",
        updated_at: "2026-04-27T16:24:00.000Z",
        attachments: [],
      },
    ],
  };
}

function seedAuditLog(): DemoAuditEntry[] {
  return DEMO_TICKETS.map((ticket) =>
    audit("scenario.seeded", ticket.ticket_id, `${ticket.title} loaded from generated demo registry.`),
  );
}

function buildTicketFromPayload(payload: Record<string, unknown>, counter: number): Ticket {
  const title = typeof payload.title === "string" && payload.title.trim() ? payload.title.trim() : "New operational ticket";
  const status = typeof payload.status === "string" ? payload.status : "Open";
  const priority = typeof payload.priority === "string" ? payload.priority : "Medium";
  const categoryId = typeof payload.category_id === "number" ? payload.category_id : undefined;
  const category = categoryId === 2 ? "Kubernetes" : categoryId === 3 ? "Access" : categoryId === 4 ? "Network" : "Mechanical";
  const ticketId = `INC-DEMO-${String(counter).padStart(3, "0")}`;

  return {
    ticket_id: ticketId,
    title,
    status,
    priority_raw: priority,
    priority_score: priority === "Critical" ? 91 : priority === "High" ? 84 : priority === "Medium" ? 72 : 48,
    root_cause_hypothesis: "operator_reported_issue",
    confidence_score: 0.78,
    site: typeof payload.site_id === "string" && payload.site_id.trim() ? payload.site_id.trim() : "Plant-A",
    assignee: typeof payload.staff_assigned === "string" && payload.staff_assigned.trim() ? payload.staff_assigned.trim() : "M. Santos",
    category,
    category_id: categoryId,
    created_at: DEMO_NOW,
    days_open: 0,
    description: typeof payload.description === "string" ? payload.description : "Demo ticket created by an operator.",
    resolution_notes: typeof payload.resolution_notes === "string" ? payload.resolution_notes : "Review new signal, attach evidence, and assign owner.",
    requester: typeof payload.requester === "string" && payload.requester.trim() ? payload.requester.trim() : "demo.operator",
  };
}

function buildTicketDetail(ticket: Ticket, comments: TicketComment[] = []): TicketDetailPayload {
  return {
    ticket: {
      ...ticket,
      request_type: "incident",
    },
    decision: {
      priority_score: ticket.priority_score,
      confidence_score: ticket.confidence_score,
      root_cause_hypothesis: ticket.root_cause_hypothesis,
      sla_risk_score: 0.62,
      actionability_score: 0.79,
      recurrence_score: 0.42,
    },
    recommendations: [
      {
        rank: 1,
        action_label: ticket.resolution_notes || "Review and assign the responsible owner.",
        rationale: "Demo session state keeps this ticket available across command center, dashboard, and ticket workspace.",
        confidence: ticket.confidence_score ?? 0.78,
      },
    ],
    similar_cases: DEMO_TICKETS.slice(0, 3).map((item) => ({
      ticket_id: item.ticket_id,
      title: item.title,
      status: item.status,
    })),
    events: DEMO_EVENT_STREAM.slice(0, 4).map((event) => ({
      event_type: event.event_type,
      event_ts: event.occurred_at,
      actor_type: "system",
      actor_id: event.source,
      payload: { severity: event.severity, site: event.site },
    })),
    linked_incident: ticket.incident_id ? { id: ticket.incident_id } : undefined,
    comments,
    attachments: [],
  };
}

const DEMO_SESSION_STORAGE_KEY = "praxis-demo-session-v1";

type DemoSessionSnapshot = Omit<
  DemoSessionState,
  | "resetDemo"
  | "createTicket"
  | "updateTicket"
  | "addComment"
  | "updateComment"
  | "deleteComment"
  | "resolveIncident"
  | "setDecisionStatus"
  | "setRecommendationStatus"
  | "runPipeline"
  | "setChaosMode"
>;

function seedState(): DemoSessionSnapshot {
  return {
    tickets: cloneSeedTickets(),
    incidents: cloneSeedIncidents(),
    commentsByTicketId: seedComments(),
    recommendationStatusById: {},
    decisionStatusById: {},
    fieldlabRuns: SCENARIOS.map((scenario) => getDemoRun(getPackIdForScenario(scenario.id))),
    chaosMode: "healthy" as const,
    auditLog: seedAuditLog(),
    ticketCounter: 1,
  };
}

function initialState(): DemoSessionSnapshot {
  if (typeof window === "undefined" || !IS_DEMO_MODE) return seedState();
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as { state?: Partial<DemoSessionSnapshot> };
    if (!parsed.state || !Array.isArray(parsed.state.tickets) || !Array.isArray(parsed.state.incidents)) {
      return seedState();
    }
    return { ...seedState(), ...parsed.state };
  } catch {
    return seedState();
  }
}

function toSnapshot(state: DemoSessionState): DemoSessionSnapshot {
  return {
    tickets: state.tickets,
    incidents: state.incidents,
    commentsByTicketId: state.commentsByTicketId,
    recommendationStatusById: state.recommendationStatusById,
    decisionStatusById: state.decisionStatusById,
    fieldlabRuns: state.fieldlabRuns,
    chaosMode: state.chaosMode,
    auditLog: state.auditLog,
    ticketCounter: state.ticketCounter,
  };
}

export const useDemoSessionStore = create<DemoSessionState>()(
  (set, get) => ({
      ...initialState(),
      resetDemo: () => set(seedState()),
      createTicket: (payload) => {
        const state = get();
        const ticket = buildTicketFromPayload(payload, state.ticketCounter);
        set({
          tickets: [ticket, ...state.tickets],
          commentsByTicketId: { ...state.commentsByTicketId, [ticket.ticket_id]: [] },
          ticketCounter: state.ticketCounter + 1,
          auditLog: [audit("ticket.create", ticket.ticket_id, ticket.title), ...state.auditLog],
        });
        return buildTicketDetail(ticket, []);
      },
      updateTicket: (ticketId, payload) => {
        const state = get();
        const existing = state.tickets.find((ticket) => ticket.ticket_id === ticketId) ?? buildTicketFromPayload(payload, state.ticketCounter);
        const updated: Ticket = {
          ...existing,
          title: typeof payload.title === "string" ? payload.title : existing.title,
          status: typeof payload.status === "string" ? payload.status : existing.status,
          priority_raw: typeof payload.priority === "string" ? payload.priority : existing.priority_raw,
          assignee: typeof payload.staff_assigned === "string" ? payload.staff_assigned : existing.assignee,
          requester: typeof payload.requester === "string" ? payload.requester : existing.requester,
          description: typeof payload.description === "string" ? payload.description : existing.description,
          resolution_notes: typeof payload.resolution_notes === "string" ? payload.resolution_notes : existing.resolution_notes,
          site: typeof payload.site_id === "string" ? payload.site_id : existing.site,
        };
        set({
          tickets: state.tickets.map((ticket) => (ticket.ticket_id === ticketId ? updated : ticket)),
          auditLog: [audit("ticket.update", ticketId, updated.title), ...state.auditLog],
        });
        return buildTicketDetail(updated, state.commentsByTicketId[ticketId] ?? []);
      },
      addComment: (ticketId, body) => {
        const state = get();
        const existing = state.commentsByTicketId[ticketId] ?? [];
        const comment: TicketComment = {
          id: Math.max(7000, ...Object.values(state.commentsByTicketId).flat().map((entry) => entry.id)) + 1,
          ticket_id: ticketId,
          author_username: "operator",
          author_display_name: "Demo Operator",
          body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          attachments: [],
        };
        set({
          commentsByTicketId: { ...state.commentsByTicketId, [ticketId]: [...existing, comment] },
          auditLog: [audit("comment.create", ticketId, body.slice(0, 80)), ...state.auditLog],
        });
        return comment;
      },
      updateComment: (ticketId, commentId, body) => {
        const state = get();
        set({
          commentsByTicketId: {
            ...state.commentsByTicketId,
            [ticketId]: (state.commentsByTicketId[ticketId] ?? []).map((comment) =>
              comment.id === commentId ? { ...comment, body, updated_at: new Date().toISOString() } : comment,
            ),
          },
          auditLog: [audit("comment.update", ticketId, `comment ${commentId}`), ...state.auditLog],
        });
      },
      deleteComment: (ticketId, commentId) => {
        const state = get();
        set({
          commentsByTicketId: {
            ...state.commentsByTicketId,
            [ticketId]: (state.commentsByTicketId[ticketId] ?? []).filter((comment) => comment.id !== commentId),
          },
          auditLog: [audit("comment.delete", ticketId, `comment ${commentId}`), ...state.auditLog],
        });
      },
      resolveIncident: (incidentId) => {
        const state = get();
        set({
          incidents: state.incidents.map((incident) => incident.id === incidentId ? { ...incident, status: "Resolved" } : incident),
          tickets: state.tickets.map((ticket) =>
            ticket.incident_id === incidentId ? { ...ticket, status: "Resolved", resolved_at: new Date().toISOString() } : ticket,
          ),
          auditLog: [audit("incident.resolve", incidentId, "Resolved in demo session."), ...state.auditLog],
        });
      },
      setDecisionStatus: (decisionId, status, note) => {
        const state = get();
        set({
          decisionStatusById: { ...state.decisionStatusById, [decisionId]: status },
          auditLog: [audit(`decision.${status}`, String(decisionId), note ?? "Operator action recorded."), ...state.auditLog],
        });
      },
      setRecommendationStatus: (recommendationId, status, note) => {
        const state = get();
        set({
          recommendationStatusById: { ...state.recommendationStatusById, [recommendationId]: status },
          auditLog: [audit(`recommendation.${status}`, String(recommendationId), note ?? "Recommendation action recorded."), ...state.auditLog],
        });
      },
      runPipeline: (packId) => {
        const state = get();
        const proof = getDemoProof(packId);
        const run = getDemoRun(packId);
        const stampedRun = {
          ...run,
          run_id: proof.run_id,
          status: "completed" as const,
          updated_at: new Date().toISOString(),
        };
        set({
          fieldlabRuns: [stampedRun, ...state.fieldlabRuns.filter((item) => item.run_id !== stampedRun.run_id)],
          // Re-running the same pack supersedes its prior ledger entry instead of duplicating it.
          auditLog: [
            audit("fieldlab.run", stampedRun.run_id, `${packId} proof sealed in demo session.`),
            ...state.auditLog.filter((entry) => !(entry.action === "fieldlab.run" && entry.target === stampedRun.run_id)),
          ],
        });
        return stampedRun;
      },
      setChaosMode: (mode) => {
        const state = get();
        if (state.chaosMode === mode) return;
        set({
          chaosMode: mode,
          auditLog: [audit("platform.chaos", mode, mode === "degraded" ? "Demo degraded mode applied." : "Demo platform reset."), ...state.auditLog],
        });
      },
    }),
);

if (typeof window !== "undefined" && IS_DEMO_MODE) {
  useDemoSessionStore.subscribe((state) => {
    window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify({ state: toSnapshot(state), version: 0 }));
  });
}

export function selectDemoMetrics(state: DemoSessionState) {
  return deriveDemoMetrics(state.tickets, state.incidents);
}

export function deriveDemoMetrics(tickets: Ticket[], incidents: Incident[]) {
  const openTickets = tickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status));
  return {
    ...DEMO_METRICS,
    total_open: openTickets.length,
    critical: openTickets.filter((ticket) => ticket.priority_raw === "Critical").length,
    sla_breach_risk: openTickets.filter((ticket) => ticket.days_open >= 3 || (ticket.priority_score ?? 0) >= 85).length,
    incident_clusters: incidents.filter((incident) => !["Resolved", "Closed"].includes(incident.status)).length,
  };
}

export function getDemoTicketDetailFromSession(ticketId: string): TicketDetailPayload {
  const state = useDemoSessionStore.getState();
  const ticket = state.tickets.find((item) => item.ticket_id === ticketId) ?? state.tickets[0];
  return buildTicketDetail(ticket, state.commentsByTicketId[ticket.ticket_id] ?? []);
}
