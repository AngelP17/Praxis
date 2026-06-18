"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DEMO_INCIDENTS, DEMO_METRICS, DEMO_TICKETS } from "@/lib/demo-scenario";
import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { deriveDemoMetrics, useDemoSessionStore } from "@/lib/demo/demo-session-store";
import { fetchJsonWithTimeout } from "@/lib/api";

export type SystemMetrics = {
  total_open: number;
  critical: number;
  sla_breach_risk: number;
  incident_clusters: number;
  signals_processed_24h: number;
  avg_decision_latency_ms: number;
  replay_coverage_percent: number;
  active_evidence_lanes: number;
};

export type RecentIncident = {
  id: string;
  title: string;
  status: string;
  root_cause_hypothesis: string;
  ticket_count: number;
  confidence: number;
  business_impact_score: number;
  opened_at: string;
};

export type LiveSignal = {
  ticket_id: string;
  title: string;
  status: string;
  priority_score: number;
  category: string;
  created_at: string;
};

export type LandingDataState = {
  metrics: SystemMetrics | null;
  recentIncidents: RecentIncident[];
  liveSignals: LiveSignal[];
  status: "loading" | "ready" | "error";
  errorMessage: string | null;
  lastUpdated: number;
};

const initialState: LandingDataState = {
  metrics: null,
  recentIncidents: [],
  liveSignals: [],
  status: "loading",
  errorMessage: null,
  lastUpdated: 0,
};

const demoMetrics: SystemMetrics = DEMO_METRICS;

const demoIncidents: RecentIncident[] = DEMO_INCIDENTS.map((incident) => ({
  id: incident.id,
  title: incident.title,
  status: incident.status,
  root_cause_hypothesis: incident.root_cause_hypothesis,
  ticket_count: incident.ticket_count,
  confidence: incident.confidence,
  business_impact_score: incident.business_impact_score,
  opened_at: incident.opened_at,
}));

const demoSignals: LiveSignal[] = DEMO_TICKETS.slice(0, 4).map((ticket) => ({
  ticket_id: ticket.ticket_id,
  title: ticket.title,
  status: ticket.status,
  priority_score: ticket.priority_score ?? 0,
  category: ticket.category ?? "Operations",
  created_at: ticket.created_at,
}));

export function useLandingData() {
  const demoTickets = useDemoSessionStore((state) => state.tickets);
  const demoIncidentsState = useDemoSessionStore((state) => state.incidents);
  const demoMetricsState = useMemo(() => deriveDemoMetrics(demoTickets, demoIncidentsState), [demoIncidentsState, demoTickets]);
  const [state, setState] = useState<LandingDataState>(initialState);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", errorMessage: null }));
    if (IS_DEMO_MODE) {
      setState({
        metrics: demoMetricsState,
        recentIncidents: demoIncidentsState.slice(0, 6).map((incident) => ({
          id: incident.id,
          title: incident.title,
          status: incident.status,
          root_cause_hypothesis: incident.root_cause_hypothesis,
          ticket_count: incident.ticket_count,
          confidence: incident.confidence,
          business_impact_score: incident.business_impact_score,
          opened_at: incident.opened_at,
        })),
        liveSignals: demoTickets.slice(0, 8).map((ticket) => ({
          ticket_id: ticket.ticket_id,
          title: ticket.title,
          status: ticket.status,
          priority_score: ticket.priority_score ?? 0,
          category: ticket.category ?? "Operations",
          created_at: ticket.created_at,
        })),
        status: "ready",
        errorMessage: null,
        lastUpdated: Date.now(),
      });
      return;
    }
    try {
      const [metrics, incidents, tickets] = await Promise.allSettled([
        fetchJsonWithTimeout<SystemMetrics>("/api/metrics", 5000),
        fetchJsonWithTimeout<RecentIncident[]>("/api/incidents", 5000),
        fetchJsonWithTimeout<LiveSignal[]>("/api/tickets?limit=10", 5000),
      ]);

      const liveMetrics = metrics.status === "fulfilled" ? metrics.value : null;
      const liveIncidents = incidents.status === "fulfilled" ? incidents.value : [];
      const liveTickets = tickets.status === "fulfilled" ? tickets.value : [];

      const errorMessages: string[] = [];
      if (metrics.status === "rejected") errorMessages.push(`Metrics: ${metrics.reason.message}`);
      if (incidents.status === "rejected") errorMessages.push(`Incidents: ${incidents.reason.message}`);
      if (tickets.status === "rejected") errorMessages.push(`Tickets: ${tickets.reason.message}`);

      setState({
        metrics: liveMetrics ?? (IS_DEMO_MODE ? demoMetrics : null),
        recentIncidents: (liveIncidents.length > 0 ? liveIncidents : IS_DEMO_MODE ? demoIncidents : []).slice(0, 6),
        liveSignals: (liveTickets.length > 0 ? liveTickets : IS_DEMO_MODE ? demoSignals : []).slice(0, 8),
        status: errorMessages.length > 0 && !IS_DEMO_MODE ? "error" : "ready",
        errorMessage: errorMessages.length > 0
          ? IS_DEMO_MODE
            ? "Deterministic demo feed active while live APIs reconnect."
            : errorMessages.join("; ")
          : null,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      setState(
        IS_DEMO_MODE
          ? {
              metrics: demoMetrics,
              recentIncidents: demoIncidents,
              liveSignals: demoSignals,
              status: "ready",
              errorMessage: "Deterministic demo feed active while live APIs reconnect.",
              lastUpdated: Date.now(),
            }
          : {
              metrics: null,
              recentIncidents: [],
              liveSignals: [],
              status: "error",
              errorMessage: error instanceof Error ? error.message : "Live operations feed unavailable.",
              lastUpdated: Date.now(),
            },
      );
    }
  }, [demoIncidentsState, demoMetricsState, demoTickets]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return { ...state, refresh };
}
