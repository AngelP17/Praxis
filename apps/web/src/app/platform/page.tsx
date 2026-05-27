"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowsClockwise, Network, ShieldCheck, Siren, WarningDiamond, FileText } from "@phosphor-icons/react";

import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { DEMO_EVIDENCE } from "@/lib/demo-scenario";
import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/api";

type PlatformSummary = {
  status: string;
  service: string;
  namespace: string;
  replicas: { desired: number; available: number; ready: number };
  slo: {
    availability: { target: number; current: number; status: string };
    mttr: { target_seconds: number; current_seconds: number; status: string };
    error_rate: { target_percent: number; current_percent: number; status: string };
    p95_latency_ms: { target_ms: number; current_ms: number; status: string };
  };
  latest_incident_id: string;
  updated_at: string;
};

type Topology = {
  nodes: Array<{ id: string; label: string; group: string; status: string; role: string }>;
  edges: Array<{ source: string; target: string; label: string }>;
};

type Control = {
  category: string;
  name: string;
  artifact: string;
  status: string;
  risk_reduced: string;
  why: string;
};

const FALLBACK_SUMMARY: PlatformSummary = {
  status: "healthy",
  service: "resilience-pilot",
  namespace: "default",
  replicas: { desired: 3, available: 3, ready: 3 },
  slo: {
    availability: { target: 99.5, current: 99.982, status: "met" },
    mttr: { target_seconds: 30, current_seconds: 12, status: "met" },
    error_rate: { target_percent: 0.5, current_percent: 0.14, status: "met" },
    p95_latency_ms: { target_ms: 500, current_ms: 184, status: "met" },
  },
  latest_incident_id: "INC-20260422153045",
  updated_at: new Date().toISOString(),
};

export default function PlatformOverviewPage() {
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [topology, setTopology] = useState<Topology | null>(null);
  const [controls, setControls] = useState<Control[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [warning, setWarning] = useState<string | null>(null);
  const [chaosMessage, setChaosMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setWarning(null);
    try {
      const [summaryR, topologyR, controlsR] = await Promise.allSettled([
        fetchJsonWithTimeout<PlatformSummary>("/api/platform/summary"),
        fetchJsonWithTimeout<Topology>("/api/platform/topology"),
        fetchJsonWithTimeout<Control[]>("/api/platform/controls"),
      ]);

      const nextSummary = summaryR.status === "fulfilled" ? summaryR.value : FALLBACK_SUMMARY;
      const nextTopology = topologyR.status === "fulfilled" ? topologyR.value : { nodes: [], edges: [] };
      const nextControls = controlsR.status === "fulfilled" ? controlsR.value : [];
      const failures = [summaryR, topologyR, controlsR].filter((item) => item.status === "rejected");

      setSummary(nextSummary);
      setTopology(nextTopology);
      setControls(nextControls);
      setStatus("ready");
      if (failures.length > 0) {
        setWarning(null);
      }
    } catch (error) {
      setSummary(FALLBACK_SUMMARY);
      setTopology({ nodes: [], edges: [] });
      setControls([]);
      setStatus("error");
      setWarning(error instanceof Error ? error.message : "Platform overview unavailable.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function triggerChaos(mode: "degraded" | "reset") {
    try {
      const result = await postJsonWithTimeout<{ message?: string }>(
        mode === "degraded" ? "/api/platform/chaos/degraded" : "/api/platform/chaos/reset",
        undefined
      );
      setChaosMessage(result.message || `Chaos mode ${mode}`);
    } catch (error) {
      setChaosMessage(error instanceof Error ? error.message : "Chaos operation failed.");
    }
  }

  if (status === "loading") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Platform" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  if (status === "error" && !summary) {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Platform" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Platform overview unavailable" message={warning || "Could not load platform APIs."} onRetry={refresh} />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Platform" />
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">
          <section className="praxis-v2-panel-enhanced p-8 sm:p-10 py-24 sm:py-32">
            <div className="max-w-5xl flex flex-wrap items-start justify-between gap-6">
              <div className="flex-1">
                <div className="praxis-v2-eyebrow-enhanced">Platform Overview</div>
                <h1 className="mt-4 font-semibold tracking-tight text-zinc-50" style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", lineHeight: "1.1" }}>Observability and SRE Control Plane</h1>
                <p className="mt-5 text-base text-zinc-400 leading-relaxed">Service: {summary?.service} · Namespace: {summary?.namespace} · Latest incident: {summary?.latest_incident_id}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => void refresh()} className="btn-enhanced inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/70 px-5 py-2.5 text-sm text-zinc-200 transition-transform duration-500 hover:scale-105 hover:border-zinc-500">
                  <ArrowsClockwise size={15} />
                  Refresh
                </button>
                <button onClick={() => void triggerChaos("degraded")} className="btn-enhanced inline-flex min-h-11 items-center gap-2 rounded-full border border-violet-500/35 bg-violet-500/12 px-5 py-2.5 text-sm text-violet-100 transition-transform duration-500 hover:scale-105 hover:bg-violet-500/18">
                  <WarningDiamond size={15} />
                  Chaos Degraded
                </button>
                <button onClick={() => void triggerChaos("reset")} className="btn-enhanced inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-5 py-2.5 text-sm text-emerald-100 transition-transform duration-500 hover:scale-105 hover:bg-emerald-500/18">
                  <ShieldCheck size={15} />
                  Chaos Reset
                </button>
              </div>
            </div>
            {warning ? <div className="mt-6 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm text-violet-100">{warning}</div> : null}
            {chaosMessage ? <div className="mt-5 rounded-xl border border-zinc-600/50 bg-zinc-800/60 px-5 py-3 text-sm text-zinc-200">{chaosMessage}</div> : null}
          </section>

          <section className="py-24 sm:py-32">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 grid-flow-dense">
              <Metric label="Availability" value={`${summary?.slo.availability.current ?? 0}%`} target={`target ${summary?.slo.availability.target ?? 0}%`} tone={summary?.slo.availability.status === "met" ? "ok" : "risk"} />
              <Metric label="MTTR" value={`${summary?.slo.mttr.current_seconds ?? 0}s`} target={`target ${summary?.slo.mttr.target_seconds ?? 0}s`} tone={summary?.slo.mttr.status === "met" ? "ok" : "risk"} />
              <Metric label="Error Rate" value={`${summary?.slo.error_rate.current_percent ?? 0}%`} target={`target ${summary?.slo.error_rate.target_percent ?? 0}%`} tone={summary?.slo.error_rate.status === "met" ? "ok" : "risk"} />
              <Metric label="P95 Latency" value={`${summary?.slo.p95_latency_ms.current_ms ?? 0}ms`} target={`target ${summary?.slo.p95_latency_ms.target_ms ?? 0}ms`} tone={summary?.slo.p95_latency_ms.status === "met" ? "ok" : "risk"} />
            </div>
          </section>

          <section className="py-24 sm:py-32">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr,1fr] grid-flow-dense">
              <div className="praxis-v2-panel-enhanced card-hover-physics p-6 transition-transform duration-500 hover:scale-105 sm:p-8">
                <div className="flex items-center justify-between">
                  <div className="praxis-v2-eyebrow-enhanced">Topology</div>
                  <Network size={16} className="text-violet-200" />
                </div>
                {!topology || topology.nodes.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState title="Topology unavailable" message="Live topology graph not returned. Platform service may be offline." />
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {topology.nodes.map((node) => (
                      <div key={node.id} className="card-hover-physics rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 transition-transform duration-500 hover:scale-105">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-base font-medium text-zinc-100">{node.label}</div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${node.status === "healthy" ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100" : "border-violet-500/40 bg-violet-500/15 text-violet-100"}`}>{node.status}</span>
                        </div>
                        <div className="mt-2 text-sm text-zinc-400">{node.role}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="praxis-v2-panel-enhanced card-hover-physics p-6 transition-transform duration-500 hover:scale-105 sm:p-8">
                <div className="flex items-center justify-between">
                  <div className="praxis-v2-eyebrow-enhanced">Controls & Evidence</div>
                  <Siren size={16} className="text-violet-200" />
                </div>
                {controls.length === 0 ? (
                  <div className="mt-6 space-y-3">
                    {DEMO_EVIDENCE.map((artifact) => (
                      <div key={artifact.id} className="card-hover-physics flex items-start gap-4 rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 transition-transform duration-500 hover:scale-105">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-700/60 bg-zinc-900/70">
                          <FileText size={15} className="text-zinc-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate text-base font-medium text-zinc-100">{artifact.label}</div>
                            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${artifact.severity === "crit" ? "border-rose-500/40 bg-rose-500/15 text-rose-100" : artifact.severity === "warn" ? "border-violet-500/40 bg-violet-500/15 text-violet-100" : artifact.severity === "ok" ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-100" : "border-zinc-600/60 bg-zinc-800/60 text-zinc-400"}`}>{artifact.severity}</span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-500">
                            <span className="mono-data">{artifact.path}</span>
                            <span>·</span>
                            <span>{artifact.size}</span>
                          </div>
                          <div className="mt-1 text-xs text-zinc-600">hash: {artifact.hash}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {controls.slice(0, 8).map((control) => (
                      <div key={`${control.category}-${control.name}`} className="card-hover-physics rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 transition-transform duration-500 hover:scale-105">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-base font-medium text-zinc-100">{control.name}</div>
                          <span className="mono-data text-xs text-zinc-500 font-medium">{control.status}</span>
                        </div>
                        <div className="mt-1.5 text-sm text-zinc-400">{control.category}</div>
                        <div className="mt-1.5 text-sm leading-relaxed text-zinc-500">{control.why}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </CommandShell>
  );
}

function Metric({
  label,
  value,
  target,
  tone,
}: {
  label: string;
  value: string;
  target: string;
  tone: "ok" | "risk";
}) {
  return (
    <div className="praxis-v2-panel-enhanced card-hover-physics p-6 transition-transform duration-500 hover:scale-105">
      <div className="praxis-v2-eyebrow-enhanced">{label}</div>
      <div className={`mono-data mt-4 font-semibold leading-none ${tone === "ok" ? "text-emerald-100" : "text-rose-100"}`} style={{ fontSize: "clamp(2rem, 3vw, 2.5rem)" }}>{value}</div>
      <div className="mt-3 text-xs text-zinc-500">{target}</div>
    </div>
  );
}
