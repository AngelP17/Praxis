"use client";

import { useCallback, useEffect, useState } from "react";

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

function resolveApiPath(path: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase || apiBase === "/api") return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const cleanBase = apiBase.replace(/\/$/, "");
  if (cleanBase.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${cleanBase}${normalizedPath.slice(4)}`;
  }
  return `${cleanBase}${normalizedPath}`;
}

async function fetchJsonWithTimeout<T>(path: string, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resolvedPath = resolveApiPath(path);
    const response = await fetch(resolvedPath, { signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error(`${resolvedPath}: ${response.status}`);
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

export function useLandingData() {
  const [state, setState] = useState<LandingDataState>(initialState);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", errorMessage: null }));
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
        metrics: liveMetrics,
        recentIncidents: liveIncidents.slice(0, 6),
        liveSignals: liveTickets.slice(0, 8),
        status: errorMessages.length > 0 && !liveMetrics && liveIncidents.length === 0 && liveTickets.length === 0 ? "error" : "ready",
        errorMessage: errorMessages.length > 0 ? errorMessages.join("; ") : null,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      setState({
        ...initialState,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Failed to load landing data",
        lastUpdated: Date.now(),
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return { ...state, refresh };
}
