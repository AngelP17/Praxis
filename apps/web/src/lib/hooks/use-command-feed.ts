"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Incident, Ticket } from "@/types";

export type QueueMetrics = {
  total_open: number;
  critical: number;
  sla_breach_risk: number;
  incident_clusters: number;
};

export type FeedStatus = "loading" | "ready" | "error";

export type FeedState = {
  tickets: Ticket[];
  incidents: Incident[];
  metrics: QueueMetrics | null;
  status: FeedStatus;
  syncedAt: number;
  errorMessage: string | null;
  warnings: string[];
};

export type QueueTicket = {
  ticketId: string;
  title: string;
  status: string;
  priority: string;
  score: number;
  assignee: string;
  category: string;
  daysOpen: number;
  createdAt?: string;
  incidentId?: string;
  recommendation: string;
  requester?: string;
};

const initialFeed: FeedState = {
  tickets: [],
  incidents: [],
  metrics: null,
  status: "loading",
  syncedAt: Date.now(),
  errorMessage: null,
  warnings: [],
};

function isClosedStatus(status: string) {
  return status === "Closed" || status === "Resolved";
}

function describeAction(ticket: QueueTicket | undefined): string {
  if (!ticket) return "Select a case to inspect the recommended next move.";
  const cause = ticket.category.toLowerCase();
  const title = ticket.title.toLowerCase();
  if (cause.includes("server") || title.includes("server")) {
    return "Treat this as shared-service risk, review blast radius, and collapse duplicate work into a single incident response track.";
  }
  if (cause.includes("network") || title.includes("vpn") || title.includes("isp")) {
    return "Verify whether this is a local break or upstream path issue, then escalate with evidence instead of another comment loop.";
  }
  if (cause.includes("hardware")) {
    return "Batch hardware work with nearby queue items so the team clears setup debt in one pass instead of one-off touches.";
  }
  if (cause.includes("access") || cause.includes("permission")) {
    return "Collect the approval trail now and close the access change cleanly instead of leaving it stranded in waiting status.";
  }
  return ticket.recommendation;
}

function toQueueTicket(ticket: Ticket): QueueTicket {
  return {
    ticketId: ticket.ticket_id,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority_raw,
    score: ticket.priority_score ?? 0,
    assignee: ticket.assignee || "Unassigned",
    category: ticket.category || ticket.root_cause_hypothesis || "Unknown",
    daysOpen: ticket.days_open,
    createdAt: ticket.created_at,
    incidentId: ticket.incident_id,
    recommendation: describeAction({
      ticketId: ticket.ticket_id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority_raw,
      score: ticket.priority_score ?? 0,
      assignee: ticket.assignee || "Unassigned",
      category: ticket.category || ticket.root_cause_hypothesis || "Unknown",
      daysOpen: ticket.days_open,
      createdAt: ticket.created_at,
      incidentId: ticket.incident_id,
      recommendation: "Validate ownership, root cause, and next concrete action.",
    }),
  };
}

async function fetchJsonWithTimeout<T>(path: string, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(path, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Timed out loading ${path}`);
    }
    throw error instanceof Error ? error : new Error(`Could not load ${path}`);
  } finally {
    window.clearTimeout(timer);
  }
}

export function useCommandFeed() {
  const [feed, setFeed] = useState<FeedState>(initialFeed);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [lastSyncSeconds, setLastSyncSeconds] = useState(0);
  const syncStart = useRef(Date.now());
  const mountedRef = useRef(true);

  const hydrate = useCallback(
    async ({ notifyOnError = false }: { notifyOnError?: boolean } = {}) => {
      if (mountedRef.current) {
        setFeed((c) => ({ ...c, status: "loading", errorMessage: null, warnings: [] }));
      }
      try {
        const [ticketsR, metricsR, incidentsR] = await Promise.allSettled([
          fetchJsonWithTimeout<Ticket[]>("/api/tickets?limit=160", 5000),
          fetchJsonWithTimeout<QueueMetrics>("/api/metrics", 5000),
          fetchJsonWithTimeout<Incident[]>("/api/incidents", 5000),
        ]);
        if (ticketsR.status === "rejected") throw ticketsR.reason;

        const warnings: string[] = [];
        const metrics = metricsR.status === "fulfilled" ? metricsR.value : (warnings.push("Metrics unavailable"), null);
        const incidents = incidentsR.status === "fulfilled" ? incidentsR.value : (warnings.push("Incident clustering unavailable"), []);

        if (!mountedRef.current) return;
        const syncedAt = Date.now();
        syncStart.current = syncedAt;
        setFeed({ tickets: ticketsR.value, incidents, metrics, status: "ready", syncedAt, errorMessage: null, warnings });
        setLastSyncSeconds(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Command center could not load live API.";
        if (!mountedRef.current) return;
        setFeed({ tickets: [], incidents: [], metrics: null, status: "error", syncedAt: Date.now(), errorMessage: message, warnings: [] });
      }
    },
    []
  );

  useEffect(() => {
    mountedRef.current = true;
    void hydrate();
    const timer = window.setInterval(() => {
      setLastSyncSeconds(Math.floor((Date.now() - syncStart.current) / 1000));
    }, 1000);
    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
    };
  }, [hydrate]);

  const liveQueue = useMemo(
    () =>
      feed.tickets
        .filter((t) => !isClosedStatus(t.status))
        .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0))
        .map(toQueueTicket),
    [feed.tickets]
  );

  const searchTerm = search.trim().toLowerCase();
  const filteredQueue = useMemo(() => {
    if (!searchTerm) return liveQueue;
    return liveQueue.filter((t) =>
      [t.ticketId, t.title, t.assignee, t.category, t.priority, t.status].join(" ").toLowerCase().includes(searchTerm)
    );
  }, [liveQueue, searchTerm]);

  const selectedTicket = filteredQueue.find((t) => t.ticketId === selectedTicketId) ?? filteredQueue[0];

  const incidents = useMemo(
    () =>
      feed.incidents.map((i) => ({
        id: i.id,
        title: i.title,
        rootCause: i.root_cause_hypothesis || "Unknown cause",
        ticketCount: i.ticket_count,
        confidence: i.confidence > 1 ? i.confidence / 100 : i.confidence,
        impact: i.business_impact_score,
      })),
    [feed.incidents]
  );

  const linkedIncident = useMemo(() => {
    if (!selectedTicket) return undefined;
    return (
      incidents.find((i) => i.id === selectedTicket.incidentId) ??
      incidents.find((i) => i.rootCause.toLowerCase().includes(selectedTicket.category.toLowerCase()))
    );
  }, [incidents, selectedTicket]);

  const totalTickets = feed.tickets.length;
  const openTickets = feed.metrics?.total_open ?? liveQueue.length;
  const closedResolved = feed.tickets.filter((t) => isClosedStatus(t.status)).length;
  const criticalOpen =
    feed.metrics?.critical ??
    feed.tickets.filter((t) => !isClosedStatus(t.status) && t.priority_raw === "Critical").length;
  const slaRisk = feed.metrics?.sla_breach_risk ?? liveQueue.filter((t) => t.daysOpen >= 3).length;

  return {
    feed,
    hydrate,
    lastSyncSeconds,
    search,
    setSearch,
    selectedTicketId,
    setSelectedTicketId,
    filteredQueue,
    selectedTicket,
    linkedIncident,
    incidents,
    totalTickets,
    openTickets,
    closedResolved,
    criticalOpen,
    slaRisk,
  };
}
