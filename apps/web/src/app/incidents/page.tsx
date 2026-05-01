"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Incident } from "@/types";
import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import {
  Shield,
  TrendUp,
  Clock,
  ArrowRight,
  MagnifyingGlass,
} from "@phosphor-icons/react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filtered, setFiltered] = useState<Incident[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadIncidents = useCallback(async () => {
    setStatus("loading");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${base}/api/incidents`, { cache: "no-store" });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = (await response.json()) as Incident[];
      setIncidents(data);
      setFiltered(data);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load incidents");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadIncidents();
  }, [loadIncidents]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(incidents);
      return;
    }
    const term = search.toLowerCase();
    setFiltered(incidents.filter((i) =>
      [i.id, i.title, i.root_cause_hypothesis].join(" ").toLowerCase().includes(term)
    ));
  }, [search, incidents]);

  const statuses = Array.from(new Set(incidents.map((i) => i.status)));

  if (status === "loading") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Incidents" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  if (status === "error") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Incidents" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Incidents unavailable" message={errorMessage || "Could not load incident data."} onRetry={loadIncidents} />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Incidents" />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-500">Incident Browser</div>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <h1 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight tracking-tight text-white">
                Incident Clusters
              </h1>
              <div className="mono-data text-[11px] text-zinc-500">{incidents.length} total</div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="relative block w-full max-w-md">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents..."
                className="min-h-10 w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-400/45"
              />
            </label>
          </div>

          {/* Status Filters */}
          {statuses.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {filtered.length === incidents.length ? (
                <button
                  onClick={() => setFiltered(incidents)}
                  className="rounded-full border px-3 py-1.5 text-[11px] transition border-amber-500/30 bg-amber-500/10 text-amber-200 hover:scale-105 transition-transform duration-500"
                >
                  All
                </button>
              ) : (
                <button
                  onClick={() => setFiltered(incidents)}
                  className="rounded-full border px-3 py-1.5 text-[11px] transition border-zinc-700 bg-zinc-900/70 text-zinc-400 hover:border-zinc-600 hover:scale-105 transition-transform duration-500"
                >
                  All
                </button>
              )}
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltered(incidents.filter((i) => i.status === s))}
                  className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1.5 text-[11px] text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300 hover:scale-105 transition-transform duration-500"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Dense List */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <EmptyState title="No incidents found" message={search ? "Try adjusting your search." : "No incidents in the system."} />
            ) : (
              filtered.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="group flex flex-col gap-3 rounded-xl border border-zinc-800/70 bg-zinc-950/60 p-5 transition hover:border-amber-500/20 hover:bg-zinc-900/80 hover:scale-105 transition-transform duration-500 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="mono-data text-[10px] text-zinc-500">{incident.id}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                        incident.status === "Investigating" ? "border-rose-500/20 bg-rose-500/10 text-rose-200" :
                        incident.status === "Mitigating" ? "border-amber-500/20 bg-amber-500/10 text-amber-200" :
                        "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-medium text-zinc-100">{incident.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{incident.root_cause_hypothesis}</p>
                  </div>

                  <div className="flex items-center gap-6 text-[11px] text-zinc-500 sm:shrink-0">
                    <span className="inline-flex items-center gap-1.5">
                      <Shield size={10} className="text-zinc-600" />
                      {incident.ticket_count} tickets
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <TrendUp size={10} className="text-zinc-600" />
                      Impact {incident.business_impact_score}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={10} className="text-zinc-600" />
                      {Math.round(incident.confidence)}%
                    </span>
                    <ArrowRight size={14} className="text-zinc-600 transition group-hover:text-amber-300" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </CommandShell>
  );
}
