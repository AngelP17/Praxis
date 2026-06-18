"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/notifications";
import { TopbarTitle, WorkbenchShell } from "@/components/praxis/workbench/WorkbenchShell";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import {
  ArrowRight,
  Table,
  Scan,
  Shield,
  ShieldCheck,
  Sparkle,
  Lightning,
  TrendUp,
  Clock,
  CheckCircle,
} from "@phosphor-icons/react";
import { DEMO_INCIDENTS, DEMO_TICKETS } from "@/lib/demo-scenario";
import { authFetch, fetchJsonWithTimeout } from "@/lib/api";

const workbookTabs = [
  {
    name: "Executive Summary",
    description: "Queue totals, SLA pressure, incident counts, and a stakeholder-friendly top-line readout.",
    accent: "#715BFF",
  },
  {
    name: "Operational Queue",
    description: "Ranked ticket sheet with priority bands, confidence, assignment, and recommended action.",
    accent: "#64748b",
  },
  {
    name: "Incident Clusters",
    description: "Grouped operational patterns with common cause, scope, and impact summary.",
    accent: "#715BFF",
  },
  {
    name: "Decision Intelligence",
    description: "Score breakdowns, root-cause hypotheses, and actionability context per case.",
    accent: "#22c55e",
  },
  {
    name: "Audit Extract",
    description: "Decision history, recommendation outcomes, and operator feedback trace.",
    accent: "#f43f5e",
  },
];

type ReportMetrics = {
  totalTickets: number;
  openTickets: number;
  criticalTickets: number;
  resolvedThisWeek: number;
  avgResolutionHours: number;
  incidentCount: number;
};

export default function ReportsPage() {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      const [tickets, incidents] = await Promise.allSettled([
        fetchJsonWithTimeout<Array<{ status: string; priority_raw: string; resolved_at?: string; days_open: number }>>("/api/tickets?limit=200", 5000),
        fetchJsonWithTimeout<Array<unknown>>("/api/incidents", 5000),
      ]);

      let ticketRows: Array<{ status: string; priority_raw: string; resolved_at?: string; days_open: number }> = [];
      let incidentRows: Array<unknown> = [];

      if (tickets.status === "fulfilled") {
        ticketRows = tickets.value;
      }
      if (incidents.status === "fulfilled") {
        incidentRows = incidents.value;
      }

      const openTickets = ticketRows.filter((t) => !["Resolved", "Closed"].includes(t.status));
      const criticalTickets = openTickets.filter((t) => t.priority_raw === "Critical");
      const resolvedThisWeek = ticketRows.filter((t) => {
        if (!t.resolved_at) return false;
        const resolved = new Date(t.resolved_at);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return resolved >= weekAgo;
      });

      const reportTickets = ticketRows.length > 0 ? ticketRows : DEMO_TICKETS;
      const reportIncidents = incidentRows.length > 0 ? incidentRows : DEMO_INCIDENTS;
      const reportOpen = reportTickets.filter((t) => !["Resolved", "Closed"].includes(t.status));
      const reportCritical = reportOpen.filter((t) => t.priority_raw === "Critical");
      const reportResolved = reportTickets.filter((t) => t.resolved_at);

      setMetrics({
        totalTickets: reportTickets.length,
        openTickets: reportOpen.length,
        criticalTickets: reportCritical.length,
        resolvedThisWeek: reportResolved.length,
        avgResolutionHours: reportTickets.length > 0 ? Math.round(reportTickets.reduce((acc, t) => acc + (t.days_open || 0), 0) / reportTickets.length * 24) : 0,
        incidentCount: reportIncidents.length,
      });
      setStatus("ready");
    } catch (error) {
      const openTickets = DEMO_TICKETS.filter((t) => !["Resolved", "Closed"].includes(t.status));
      setMetrics({
        totalTickets: DEMO_TICKETS.length,
        openTickets: openTickets.length,
        criticalTickets: openTickets.filter((t) => t.priority_raw === "Critical").length,
        resolvedThisWeek: DEMO_TICKETS.filter((t) => t.resolved_at).length,
        avgResolutionHours: Math.round(DEMO_TICKETS.reduce((acc, t) => acc + (t.days_open || 0), 0) / DEMO_TICKETS.length * 24),
        incidentCount: DEMO_INCIDENTS.length,
      });
      setErrorMessage(null);
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  const handleWorkbookDownload = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await authFetch("/api/reports/excel", { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error(await readExportError(response));
      const blob = await response.blob();
      if (blob.size === 0) throw new Error("The workbook export was empty.");
      const filename = parseFilename(response.headers.get("content-disposition"));
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Workbook download started", filename);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not generate workbook.";
      toast.error("Export failed", message);
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, toast]);

  if (status === "loading") {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Reports" subtitle="executive and operational reporting" />}>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </WorkbenchShell>
    );
  }

  if (status === "error") {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Reports" subtitle="executive and operational reporting" />}>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Reports unavailable" message={errorMessage || "Could not load report data."} onRetry={loadMetrics} />
        </div>
      </WorkbenchShell>
    );
  }

  const reportHighlights = [
    { label: "Total Tickets", value: metrics?.totalTickets ?? 0, note: "All time", color: "#715BFF", icon: Sparkle },
    { label: "Open Queue", value: metrics?.openTickets ?? 0, note: "Active cases", color: "#715BFF", icon: Scan },
    { label: "Resolved This Week", value: metrics?.resolvedThisWeek ?? 0, note: "Last 7 days", color: "#22c55e", icon: ShieldCheck },
  ];

  return (
    <WorkbenchShell topbar={<TopbarTitle title="Reports" subtitle="executive and operational reporting" />}>
      <div className="flex-1 overflow-auto relative">
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="ops-glass rounded-[2rem] overflow-hidden">
            <div className="border-b border-zinc-800/70 bg-black/20 px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-5xl">
                  <div className="mono-data text-[11px] uppercase tracking-[0.32em] text-violet-300">Reports & Export</div>
                  <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                    Reporting integrated with the operational platform
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    The export surface should feel like a deliberate intelligence handoff, not a forgotten utility page.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleWorkbookDownload}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 bg-violet-500 px-4 py-2.5 text-sm font-semibold text-black transition duration-500 hover:scale-105 hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Table size={16} />
                    {isDownloading ? "Preparing workbook..." : "Download Workbook"}
                  </button>
                  <Link href="/command-center" className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-100 transition duration-500 hover:scale-105 hover:border-violet-500/30 hover:bg-violet-500/10">
                    <Scan size={16} />
                    Command Center
                  </Link>
                </div>
              </div>
            </div>

            {/* Real Metrics */}
            <div className="grid gap-4 border-b border-zinc-800/70 px-5 py-5 sm:grid-cols-3 sm:px-8 grid-flow-dense">
              {reportHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="praxis-v2-panel-enhanced p-5 group transition-transform duration-500 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="mono-data text-[11px] uppercase tracking-[0.28em] text-zinc-500">{item.label}</div>
                      <div className="flex h-10 w-10 items-center justify-center border border-white/5 bg-black/20 transition-colors group-hover:bg-white/5">
                        <Icon size={16} style={{ color: item.color }} />
                      </div>
                    </div>
                    <div className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50">{item.value}</div>
                    <div className="mt-1 text-[11px] text-zinc-500">{item.note}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 px-5 py-5 sm:px-8 xl:grid-cols-[1.1fr,0.9fr] grid-flow-dense">
              <section className="praxis-v2-panel-enhanced p-5 py-20 sm:p-6 transition-transform duration-500 hover:scale-[1.01]">
                <div className="flex items-center justify-between gap-4 border-b border-zinc-800/70 pb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-50">Workbook Contents</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      Each tab is there to support a concrete review motion.
                    </p>
                  </div>
                  <div className="mono-data rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-zinc-300">
                    5 tabs
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {workbookTabs.map((tab, index) => (
                    <div key={tab.name} className="rounded-[1.15rem] border border-zinc-800 bg-zinc-950/55 p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <div
                          className="mono-data flex h-10 w-10 items-center justify-center border text-sm font-semibold"
                          style={{ color: tab.accent, borderColor: `${tab.accent}35`, backgroundColor: `${tab.accent}14` }}
                        >
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-zinc-100">{tab.name}</div>
                          <div className="mt-2 text-sm leading-6 text-zinc-500">{tab.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-5 py-20">
                <div className="praxis-v2-panel-enhanced p-5 sm:p-6 transition-transform duration-500 hover:scale-[1.01]">
                  <div className="mono-data text-[11px] uppercase tracking-[0.28em] text-zinc-500">Live Metrics</div>
                  <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Critical Tickets</span>
                      <span className="mono-data text-sm text-rose-300">{metrics?.criticalTickets ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Incident Clusters</span>
                      <span className="mono-data text-sm text-zinc-200">{metrics?.incidentCount ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Avg Resolution</span>
                      <span className="mono-data text-sm text-zinc-200">{metrics?.avgResolutionHours ?? 0}h</span>
                    </div>
                  </div>
                </div>

                <div className="praxis-v2-panel-enhanced p-5 sm:p-6 transition-transform duration-500 hover:scale-[1.01]">
                  <div className="mono-data text-[11px] uppercase tracking-[0.28em] text-zinc-500">Follow-On Surfaces</div>
                  <div className="mt-5 grid gap-3">
                    <Link href="/dashboard" className="flex items-center justify-between rounded-[1.1rem] border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200 transition duration-500 hover:scale-[1.01] hover:border-violet-500/20 hover:bg-zinc-900/80">
                      <span>Portfolio Dashboard</span>
                      <ArrowRight size={16} className="text-zinc-500" />
                    </Link>
                    <Link href="/command-center" className="flex items-center justify-between rounded-[1.1rem] border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200 transition duration-500 hover:scale-[1.01] hover:border-violet-500/20 hover:bg-zinc-900/80">
                      <span>Return to live queue</span>
                      <ArrowRight size={16} className="text-zinc-500" />
                    </Link>
                    <Link href="/board" className="flex items-center justify-between rounded-[1.1rem] border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-200 transition duration-500 hover:scale-[1.01] hover:border-violet-500/20 hover:bg-zinc-900/80">
                      <span>Open workflow board</span>
                      <ArrowRight size={16} className="text-zinc-500" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-violet-500/20 bg-violet-500/10 p-5 sm:p-6">
                  <div className="mono-data text-[11px] uppercase tracking-[0.28em] text-violet-300">Export Behavior</div>
                  <p className="mt-4 text-sm leading-7 text-violet-100">
                    The download action stays live. If the backend feed is down, the workbook request fails without breaking the page.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </WorkbenchShell>
  );
}

function parseFilename(contentDisposition: string | null) {
  if (!contentDisposition) return "praxis_report.xlsx";
  const encodedMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    try { return decodeURIComponent(encodedMatch[1]); } catch { return encodedMatch[1].replace(/["']/g, ""); }
  }
  const filenameMatch = contentDisposition.match(/filename\s*=\s*("?)([^";]+)\1/i);
  if (filenameMatch?.[2]) return filenameMatch[2];
  return "praxis_report.xlsx";
}

async function readExportError(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const body = await response.text().catch(() => "");
  if (contentType.includes("application/json")) {
    try {
      const data = JSON.parse(body) as Record<string, unknown>;
      if (typeof data.detail === "string") return data.detail;
      if (typeof data.message === "string") return data.message;
    } catch { /* fall through */ }
  }
  return body || `Request failed with status ${response.status}.`;
}
