"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Incident } from "@/types";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { Pill, TopbarTitle, WorkbenchShell } from "@/components/praxis/workbench/WorkbenchShell";
import { DEMO_INCIDENTS } from "@/lib/demo-scenario";
import { fetchJsonWithTimeout } from "@/lib/api";
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
      const data = await fetchJsonWithTimeout<Incident[]>("/api/incidents", 5000);
      const validData = Array.isArray(data) && data.length > 0 ? data : DEMO_INCIDENTS;
      setIncidents(validData);
      setFiltered(validData);
      setStatus("ready");
      if (!Array.isArray(data) || data.length === 0) setErrorMessage(null);
    } catch (error) {
      setIncidents(DEMO_INCIDENTS);
      setFiltered(DEMO_INCIDENTS);
      setStatus("ready");
      setErrorMessage(null);
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

  const statuses = incidents.length > 0 ? Array.from(new Set(incidents.map((i) => i.status))) : [];

  if (status === "loading") {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Incident Browser" subtitle="Loading…" />}>
        <div className="p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </WorkbenchShell>
    );
  }

  const investigatingCount = incidents.filter((incident) => incident.status === "Investigating").length;
  const mitigatingCount = incidents.filter((incident) => incident.status === "Mitigating").length;

  return (
    <WorkbenchShell
      topbar={
        <TopbarTitle
          title="Incident Browser"
          subtitle={`Cluster posture · ${incidents.length} total · ${investigatingCount} investigating · ${mitigatingCount} mitigating`}
          right={
            <>
              <Pill tone="plasma">{incidents.length} incidents</Pill>
              <Pill tone="argon">{statuses.length} states</Pill>
            </>
          }
        />
      }
    >
      <div className="overflow-auto">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 praxis-v2-panel-enhanced p-5 sm:p-6">
            <div className="praxis-v2-eyebrow-enhanced">Incident clusters</div>
            <h1 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight tracking-tight text-white">
              Investigations, mitigations, and closure lanes in one view
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              Browse grouped incidents with deterministic root-cause context and linked operational ticket pressure.
            </p>
            {errorMessage ? (
              <div className="mt-4 border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-100">{errorMessage}</div>
            ) : null}
          </div>

          <div className="mb-6 praxis-v2-panel-enhanced p-4 sm:p-5">
            <label className="relative block w-full max-w-md">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search incidents..."
                className="min-h-10 w-full border border-zinc-700/70 bg-zinc-950/80 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/45"
              />
            </label>
          </div>

          {statuses.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {filtered.length === incidents.length ? (
                <button
                  onClick={() => setFiltered(incidents)}
                  className="rounded-full border px-3 py-1.5 text-[11px] transition border-violet-500/30 bg-violet-500/10 text-violet-200 hover:scale-[1.01] duration-500"
                >
                  All
                </button>
              ) : (
                <button
                  onClick={() => setFiltered(incidents)}
                  className="rounded-full border px-3 py-1.5 text-[11px] transition border-zinc-700 bg-zinc-900/70 text-zinc-400 hover:border-zinc-600 hover:scale-[1.01] duration-500"
                >
                  All
                </button>
              )}
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFiltered(incidents.filter((i) => i.status === s))}
                  className="rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1.5 text-[11px] text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300 hover:scale-[1.01] duration-500"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <EmptyState title="No incidents found" message={search ? "Try adjusting your search." : "No incidents in the system."} />
            ) : (
              filtered.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="group flex flex-col gap-3 border border-zinc-800/70 bg-zinc-950/60 p-5 transition hover:border-violet-500/20 hover:bg-zinc-900/80 hover:scale-[1.01] duration-500 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="mono-data text-[10px] text-zinc-500">{incident.id}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                        incident.status === "Investigating" ? "border-rose-500/20 bg-rose-500/10 text-rose-200" :
                        incident.status === "Mitigating" ? "border-violet-500/20 bg-violet-500/10 text-violet-200" :
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
                    <ArrowRight size={14} className="text-zinc-600 transition group-hover:text-violet-300" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </WorkbenchShell>
  );
}
