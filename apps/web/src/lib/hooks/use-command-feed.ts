"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Incident, Ticket } from "@/types";
import { DEMO_INCIDENTS, DEMO_METRICS, DEMO_TICKETS } from "@/lib/demo-scenario";
import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { deriveDemoMetrics, useDemoSessionStore } from "@/lib/demo/demo-session-store";
import { fetchJsonWithTimeout, resolveApiPath } from "@/lib/api";

export type QueueMetrics = {
  total_open: number;
  critical: number;
  sla_breach_risk: number;
  incident_clusters: number;
};

export type FeedStatus = "loading" | "ready" | "error";
export type FeedMode = "live" | "demo" | "stale" | "offline";

export type FeedState = {
  tickets: Ticket[];
  incidents: Incident[];
  metrics: QueueMetrics | null;
  status: FeedStatus;
  mode: FeedMode;
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
  mode: "offline",
  syncedAt: Date.now(),
  errorMessage: null,
  warnings: [],
};

const FEED_CACHE_KEY = "praxis.command.feed.cache.v2";

function isClosedStatus(status: string) {
  return status === "Closed" || status === "Resolved";
}

function signalPriorityOrder(a: Ticket, b: Ticket) {
  return (b.priority_score ?? 0) - (a.priority_score ?? 0);
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
  const mappedRecommendation =
    ticket.resolution_notes?.trim() ||
      describeAction({
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
      });

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
    requester: ticket.requester,
    recommendation: mappedRecommendation,
  };
}

function readCachedFeed(): Pick<FeedState, "tickets" | "incidents" | "metrics" | "syncedAt"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FEED_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      tickets?: Ticket[];
      incidents?: Incident[];
      metrics?: QueueMetrics | null;
      syncedAt?: number;
    };
    if (!Array.isArray(parsed.tickets) || !Array.isArray(parsed.incidents)) return null;
    return {
      tickets: parsed.tickets,
      incidents: parsed.incidents,
      metrics: parsed.metrics ?? null,
      syncedAt: typeof parsed.syncedAt === "number" ? parsed.syncedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function writeCachedFeed(state: Pick<FeedState, "tickets" | "incidents" | "metrics" | "syncedAt">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(state));
  } catch {
    // best effort cache; ignore quota/storage errors
  }
}

export function useCommandFeed() {
  const demoTickets = useDemoSessionStore((state) => state.tickets);
  const demoIncidents = useDemoSessionStore((state) => state.incidents);
  const demoMetrics = useMemo(() => deriveDemoMetrics(demoTickets, demoIncidents), [demoIncidents, demoTickets]);
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
      if (IS_DEMO_MODE) {
        const syncedAt = Date.now();
        syncStart.current = syncedAt;
        setFeed({
          tickets: demoTickets,
          incidents: demoIncidents,
          metrics: demoMetrics,
          status: "ready",
          mode: "demo",
          syncedAt,
          errorMessage: null,
          warnings: [],
        });
        setLastSyncSeconds(0);
        return;
      }
      try {
        const [ticketsR, metricsR, incidentsR] = await Promise.allSettled([
          fetchJsonWithTimeout<Ticket[]>("/api/tickets?limit=160", 5000),
          fetchJsonWithTimeout<QueueMetrics>("/api/metrics", 5000),
          fetchJsonWithTimeout<Incident[]>("/api/incidents", 5000),
        ]);
        if (ticketsR.status === "rejected") throw ticketsR.reason;
        const liveTickets = Array.isArray(ticketsR.value) ? ticketsR.value : [];
        const openSignals = liveTickets.filter((ticket) => !isClosedStatus(ticket.status));
        
        // Only swap with demo data if demo mode is explicitly requested
        if (IS_DEMO_MODE && openSignals.length === 0 && DEMO_TICKETS.length > 0) {
          const syncedAt = Date.now();
          syncStart.current = syncedAt;
          setFeed({
            tickets: DEMO_TICKETS,
            incidents: DEMO_INCIDENTS,
            metrics: DEMO_METRICS,
            status: "ready",
            mode: "demo",
            syncedAt,
            errorMessage: null,
            warnings: [],
          });
          setLastSyncSeconds(0);
          return;
        }

        const warnings: string[] = [];
        const metrics = metricsR.status === "fulfilled" ? metricsR.value : (warnings.push("Metrics unavailable"), null);
        const incidents = incidentsR.status === "fulfilled" ? incidentsR.value : (warnings.push("Incident clustering unavailable"), []);
        const mode: FeedMode = warnings.length > 0 ? "stale" : "live";

        if (!mountedRef.current) return;
        const syncedAt = Date.now();
        syncStart.current = syncedAt;
        setFeed({
          tickets: liveTickets,
          incidents,
          metrics,
          status: "ready",
          mode,
          syncedAt,
          errorMessage: null,
          warnings,
        });
        writeCachedFeed({
          tickets: liveTickets,
          incidents,
          metrics,
          syncedAt,
        });
        setLastSyncSeconds(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Command center could not load live API.";
        if (!mountedRef.current) return;
        const cached = readCachedFeed();
        if (cached && cached.tickets.length > 0) {
          const syncedAt = Date.now();
          syncStart.current = syncedAt;
          setFeed({
            tickets: cached.tickets,
            incidents: cached.incidents,
            metrics: cached.metrics,
            status: "ready",
            mode: "stale",
            syncedAt,
            errorMessage: null,
            warnings: ["Stale data with last known records", `Live API unavailable: ${message}`],
          });
          setLastSyncSeconds(0);
          return;
        }
        if (IS_DEMO_MODE && DEMO_TICKETS.length > 0) {
          const syncedAt = Date.now();
          syncStart.current = syncedAt;
          setFeed({
            tickets: DEMO_TICKETS,
            incidents: DEMO_INCIDENTS,
            metrics: DEMO_METRICS,
            status: "ready",
            mode: "demo",
            syncedAt,
            errorMessage: null,
            warnings: [],
          });
          setLastSyncSeconds(0);
          return;
        }
        setFeed({
          tickets: [],
          incidents: [],
          metrics: null,
          status: "error",
          mode: "offline",
          syncedAt: Date.now(),
          errorMessage: message,
          warnings: [],
        });
      }
    },
    [demoIncidents, demoMetrics, demoTickets]
  );

  useEffect(() => {
    mountedRef.current = true;
    void hydrate();

    if (IS_DEMO_MODE) {
      let active = true;
      let timer: number | undefined;
      const tick = () => {
        setLastSyncSeconds(Math.floor((Date.now() - syncStart.current) / 1000));
        if (active) {
          timer = window.setTimeout(tick, 1000);
        }
      };
      timer = window.setTimeout(tick, 1000);
      return () => {
        active = false;
        mountedRef.current = false;
        if (timer !== undefined) {
          window.clearTimeout(timer);
        }
      };
    }

    // Connect to live events and decisions SSE stream
    const eventsSourceUrl = resolveApiPath("/api/events/stream");
    const decisionsSourceUrl = resolveApiPath("/api/decisions/stream");

    let eventsSource: EventSource | null = null;
    let decisionsSource: EventSource | null = null;

    try {
      eventsSource = new EventSource(eventsSourceUrl);
      eventsSource.addEventListener("event_ingested", () => {
        void hydrate();
      });
    } catch (e) {
      console.warn("Failed to subscribe to live events SSE stream:", e);
    }

    try {
      decisionsSource = new EventSource(decisionsSourceUrl);
      decisionsSource.addEventListener("decision_evaluated", () => {
        void hydrate();
      });
    } catch (e) {
      console.warn("Failed to subscribe to live decisions SSE stream:", e);
    }

    let active = true;
    let timer: number | undefined;
    const tick = () => {
      setLastSyncSeconds(Math.floor((Date.now() - syncStart.current) / 1000));
      if (active) {
        timer = window.setTimeout(tick, 1000);
      }
    };
    timer = window.setTimeout(tick, 1000);
    return () => {
      active = false;
      mountedRef.current = false;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      if (eventsSource) eventsSource.close();
      if (decisionsSource) decisionsSource.close();
    };
  }, [hydrate]);

  const liveQueue = useMemo(
    () =>
      feed.tickets
        .filter((t) => !isClosedStatus(t.status))
        .sort(signalPriorityOrder)
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
