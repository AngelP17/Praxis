"use client";

import Link from "next/link";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";
import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import {
  Shield,
  WarningCircle,
  CheckCircle,
  Lightning,
  ArrowRight,
  Clock,
  TrendUp,
} from "@phosphor-icons/react";

function StatusBadge({ status }: { status: string }) {
  const config = {
    healthy: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    degraded: { icon: WarningCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    critical: { icon: WarningCircle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    unknown: { icon: Clock, color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
  };
  const c = config[status as keyof typeof config] || config.unknown;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${c.border} ${c.bg} px-3 py-1.5 text-[11px] font-medium ${c.color}`}>
      <Icon size={12} />
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { metrics, recentTickets, activeIncidents, status, errorMessage, refresh } = useDashboardData();

  if (status === "loading") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Dashboard" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  if (status === "error") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Dashboard" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Dashboard unavailable" message={errorMessage || "The live dashboard could not load."} onRetry={refresh} />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Dashboard" />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-500">System Overview</div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight tracking-tight text-white">
                Operational Dashboard
              </h1>
              <StatusBadge status={metrics?.systemStatus || "unknown"} />
            </div>
          </div>

          {/* Dense Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense gap-3">
            {/* Large Status Card */}
            <div className="col-span-2 row-span-2 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-6">
              <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-500">Queue Overview</div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <div className="mono-data text-3xl font-semibold text-white">{metrics?.totalTickets ?? 0}</div>
                  <div className="mt-1 text-[11px] text-zinc-500">Total Tickets</div>
                </div>
                <div>
                  <div className="mono-data text-3xl font-semibold text-amber-300">{metrics?.openTickets ?? 0}</div>
                  <div className="mt-1 text-[11px] text-zinc-500">Open Queue</div>
                </div>
                <div>
                  <div className="mono-data text-3xl font-semibold text-rose-300">{metrics?.criticalTickets ?? 0}</div>
                  <div className="mt-1 text-[11px] text-zinc-500">Critical</div>
                </div>
                <div>
                  <div className="mono-data text-3xl font-semibold text-emerald-300">{metrics?.resolvedToday ?? 0}</div>
                  <div className="mt-1 text-[11px] text-zinc-500">Resolved Today</div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Link href="/command-center" className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-amber-400">
                  Command Center <ArrowRight size={12} />
                </Link>
                <Link href="/board" className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500">
                  Board View
                </Link>
              </div>
            </div>

            {/* Incident Clusters */}
            <div className="col-span-2 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
              <div className="flex items-center justify-between">
                <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-500">Active Incidents</div>
                <span className="mono-data text-[11px] text-zinc-500">{activeIncidents.length} clusters</span>
              </div>
              <div className="mt-4 space-y-2">
                {activeIncidents.length === 0 ? (
                  <div className="text-sm text-zinc-600">No active incidents</div>
                ) : (
                  activeIncidents.slice(0, 3).map((incident) => (
                    <Link
                      key={incident.id}
                      href={`/incidents/${incident.id}`}
                      className="flex items-center justify-between rounded-lg border border-zinc-800/50 bg-zinc-900/40 px-3 py-2.5 transition hover:border-amber-500/20"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="mono-data text-[10px] text-zinc-500">{incident.id}</span>
                          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] ${
                            incident.status === "Investigating" ? "border-rose-500/20 bg-rose-500/10 text-rose-200" :
                            incident.status === "Mitigating" ? "border-amber-500/20 bg-amber-500/10 text-amber-200" :
                            "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                          }`}>{incident.status}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-zinc-300">{incident.title}</p>
                      </div>
                      <ArrowRight size={12} className="shrink-0 text-zinc-600" />
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* SLA Risk */}
            <div className="col-span-1 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Clock size={11} className="text-amber-300" />
                SLA Risk
              </div>
              <div className="mono-data mt-3 text-2xl text-zinc-100">{metrics?.slaRiskCount ?? 0}</div>
              <div className="mt-1 text-[11px] text-zinc-500">tickets at risk</div>
            </div>

            {/* Incident Count */}
            <div className="col-span-1 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
                <TrendUp size={11} className="text-amber-300" />
                Incidents
              </div>
              <div className="mono-data mt-3 text-2xl text-zinc-100">{metrics?.incidentCount ?? 0}</div>
              <div className="mt-1 text-[11px] text-zinc-500">active clusters</div>
            </div>

            {/* Active Queue - Full Width */}
            <div className="col-span-2 md:col-span-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-5">
              <div className="flex items-center justify-between">
                <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-500">Active Queue</div>
                <Link href="/board" className="text-[11px] text-amber-300 transition hover:text-amber-200">View board</Link>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {recentTickets.length === 0 ? (
                  <EmptyState title="Clear queue" message="No active tickets requiring attention." />
                ) : (
                  recentTickets.slice(0, 6).map((ticket) => (
                    <Link
                      key={ticket.ticket_id}
                      href={`/tickets/${ticket.ticket_id}`}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-3 transition hover:border-amber-500/20"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="mono-data text-[10px] text-zinc-500">{ticket.ticket_id}</span>
                          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${
                            ticket.priority_raw === "Critical" ? "border-rose-500/20 bg-rose-500/10 text-rose-200" :
                            ticket.priority_raw === "High" ? "border-orange-500/20 bg-orange-500/10 text-orange-200" :
                            "border-zinc-700 bg-zinc-900/70 text-zinc-300"
                          }`}>
                            {ticket.priority_raw}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-zinc-200">{ticket.title}</p>
                      </div>
                      <span className="ml-3 shrink-0 mono-data text-[10px] text-zinc-500">{ticket.days_open}d</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommandShell>
  );
}
