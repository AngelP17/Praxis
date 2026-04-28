"use client";

import { useCallback, useEffect, useState } from "react";
import type { Ticket, Incident } from "@/types";

export type SystemStatus = "healthy" | "degraded" | "critical" | "unknown";

export type DashboardMetrics = {
  totalTickets: number;
  openTickets: number;
  criticalTickets: number;
  resolvedToday: number;
  avgDecisionLatency: number;
  incidentCount: number;
  slaRiskCount: number;
  systemStatus: SystemStatus;
};

export type DashboardState = {
  metrics: DashboardMetrics | null;
  recentTickets: Ticket[];
  activeIncidents: Incident[];
  status: "loading" | "ready" | "error";
  errorMessage: string | null;
  lastUpdated: number;
};

const initialState: DashboardState = {
  metrics: null,
  recentTickets: [],
  activeIncidents: [],
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

function calculateSystemStatus(metrics: DashboardMetrics): SystemStatus {
  if (metrics.criticalTickets > 5 || metrics.slaRiskCount > 10) return "critical";
  if (metrics.criticalTickets > 2 || metrics.slaRiskCount > 5) return "degraded";
  return "healthy";
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardState>(initialState);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", errorMessage: null }));
    try {
      const [metrics, incidents, tickets] = await Promise.allSettled([
        fetchJsonWithTimeout<{
          total_open: number;
          critical: number;
          sla_breach_risk: number;
          incident_clusters: number;
        }>("/api/metrics", 5000),
        fetchJsonWithTimeout<Incident[]>("/api/incidents", 5000),
        fetchJsonWithTimeout<Ticket[]>("/api/tickets?limit=50", 5000),
      ]);

      const liveMetrics = metrics.status === "fulfilled" ? metrics.value : null;
      const liveIncidents = incidents.status === "fulfilled" ? incidents.value : [];
      const liveTickets = tickets.status === "fulfilled" ? tickets.value : [];

      const openTickets = liveTickets.filter((t) => !["Resolved", "Closed"].includes(t.status));
      const criticalTickets = openTickets.filter((t) => t.priority_raw === "Critical");
      const resolvedToday = liveTickets.filter((t) => {
        if (!t.resolved_at) return false;
        const resolved = new Date(t.resolved_at);
        const now = new Date();
        return resolved.toDateString() === now.toDateString();
      });

      const dashboardMetrics: DashboardMetrics = {
        totalTickets: liveTickets.length,
        openTickets: openTickets.length,
        criticalTickets: criticalTickets.length,
        resolvedToday: resolvedToday.length,
        avgDecisionLatency: 0,
        incidentCount: liveIncidents.length,
        slaRiskCount: liveMetrics?.sla_breach_risk ?? 0,
        systemStatus: "unknown",
      };
      dashboardMetrics.systemStatus = calculateSystemStatus(dashboardMetrics);

      const errorMessages: string[] = [];
      if (metrics.status === "rejected") errorMessages.push(`Metrics: ${metrics.reason.message}`);
      if (incidents.status === "rejected") errorMessages.push(`Incidents: ${incidents.reason.message}`);
      if (tickets.status === "rejected") errorMessages.push(`Tickets: ${tickets.reason.message}`);

      setState({
        metrics: dashboardMetrics,
        recentTickets: openTickets.slice(0, 10),
        activeIncidents: liveIncidents.filter((i) => i.status !== "Closed" && i.status !== "Resolved").slice(0, 6),
        status: errorMessages.length > 0 && !liveMetrics && liveIncidents.length === 0 && liveTickets.length === 0 ? "error" : "ready",
        errorMessage: errorMessages.length > 0 ? errorMessages.join("; ") : null,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      setState({
        ...initialState,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Failed to load dashboard data",
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
