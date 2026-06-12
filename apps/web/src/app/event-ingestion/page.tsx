"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Pulse, UploadSimple, Lightning, Check } from "@phosphor-icons/react";

import { TopbarTitle, WorkbenchShell } from "@/components/praxis/workbench/WorkbenchShell";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { ScenarioPicker } from "@/components/praxis/ScenarioPicker";
import { useToast } from "@/components/notifications";
import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/api";
import { deterministicHash } from "@/lib/deterministic-hash";
import { useScenarios } from "@/lib/hooks/useScenarios";
import { type Scenario } from "@/lib/scenarios";
import { DEMO_EVENT_STREAM } from "@/lib/demo-scenario";

type EventRow = {
  event_id: string;
  source: string;
  event_type: string;
  severity: string;
  site?: string;
  occurred_at: string;
  payload?: Record<string, unknown>;
};

type EvaluateResult = {
  id: number;
  event_id: string;
  priority_score: number;
  risk_level: string;
  confidence_score: number;
  root_cause_hypothesis: string;
  replay_hash: string;
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  high: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  medium: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
};

export default function EventIngestionPage() {
  const router = useRouter();
  const toast = useToast();
  const { scenarios } = useScenarios();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [pageStatus, setPageStatus] = useState<"loading" | "ready">("loading");
  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [source, setSource] = useState(scenarios[0].source);
  const [eventType, setEventType] = useState(scenarios[0].eventType);
  const [severity, setSeverity] = useState<string>(scenarios[0].severity);
  const [site, setSite] = useState(scenarios[0].site);
  const [assetId, setAssetId] = useState(scenarios[0].assetId);
  const [ingesting, setIngesting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState<EvaluateResult | null>(null);

  const loadEvents = useCallback(async () => {
    setPageStatus("loading");
    try {
      const rows = await fetchJsonWithTimeout<EventRow[]>("/api/events");
      setEvents(Array.isArray(rows) && rows.length > 0 ? rows : DEMO_EVENT_STREAM);
    } catch {
      setEvents(DEMO_EVENT_STREAM);
    } finally {
      setPageStatus("ready");
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    const updated = scenarios.find((scenario) => scenario.id === activeScenario.id);
    if (updated) {
      setActiveScenario(updated);
      setSource(updated.source);
      setEventType(updated.eventType);
      setSeverity(updated.severity);
      setSite(updated.site);
      setAssetId(updated.assetId);
    }
  }, [activeScenario.id, scenarios]);

  function applyScenario(scenario: Scenario) {
    setActiveScenario(scenario);
    setSource(scenario.source);
    setEventType(scenario.eventType);
    setSeverity(scenario.severity);
    setSite(scenario.site);
    setAssetId(scenario.assetId);
  }

  async function handleIngest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (ingesting) return;
    setIngesting(true);
    try {
      const payload = {
        source,
        event_type: eventType,
        severity,
        site,
        asset_id: assetId,
        asset: { asset_id: assetId, site, line: activeScenario.line },
        payload: activeScenario.payload,
      };
      const result = await postJsonWithTimeout<{ event_id?: string }>("/api/events/ingest", payload);
      toast.success("Event ingested", result.event_id ? `event_id: ${result.event_id}` : "Stored in operational_events");
      await loadEvents();
    } catch (err) {
      toast.error("Ingest failed", err instanceof Error ? err.message : "Check API gateway");
    } finally {
      setIngesting(false);
    }
  }

  async function handleEvaluate() {
    if (evaluating) return;
    setEvaluating(true);
    setLastResult(null);
    try {
      const payload = {
        source,
        event_type: eventType,
        severity,
        site,
        asset_id: assetId,
        specversion: "1.0",
        type: eventType,
        data: {
          scenario_id: activeScenario.id,
          asset_id: assetId,
          site,
          line: activeScenario.line,
          severity,
          raw: activeScenario.payload,
        },
        subject: `asset:${assetId}`,
      };
      const result = await postJsonWithTimeout<EvaluateResult>("/api/decisions/evaluate", payload);
      setLastResult(result);
      toast.success("Decision generated", `Priority ${result.priority_score?.toFixed(1)} · ${result.risk_level} risk`);
    } catch (err) {
      toast.error("Evaluation failed (using demo fallback)", err instanceof Error ? err.message : "");
      const replayHash = await deterministicHash({
        scenario_id: activeScenario.id,
        source,
        event_type: eventType,
        asset_id: assetId,
        site,
        line: activeScenario.line,
        payload: {
          severity,
          raw: activeScenario.payload,
        },
      });
      setLastResult({
        id: 9000 + scenarios.findIndex((s) => s.id === activeScenario.id) + 1,
        event_id: `evt-demo-${activeScenario.id}`,
        priority_score: activeScenario.priorityScore,
        risk_level: activeScenario.severity === "critical" ? "critical" : activeScenario.severity === "high" ? "high" : "medium",
        confidence_score: activeScenario.confidenceScore,
        root_cause_hypothesis: activeScenario.rootCause,
        replay_hash: replayHash,
      });
    } finally {
      setEvaluating(false);
    }
  }

  if (pageStatus === "loading") {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Ingestion" subtitle="raw events / normalization / decisions" />}>
        <div className="flex-1 p-8">
          <LoadingSkeleton />
        </div>
      </WorkbenchShell>
    );
  }

  return (
    <WorkbenchShell topbar={<TopbarTitle title="Ingestion" subtitle="raw events / normalization / decisions" />}>
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">

          {/* Header */}
          <section className="praxis-v2-panel-enhanced p-8 sm:p-10 py-20 sm:py-24">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex-1">
                <div className="praxis-v2-eyebrow-enhanced">Event Ingestion</div>
                <h1 className="mt-4 font-display font-semibold tracking-tight text-zinc-50" style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)", lineHeight: "1.1" }}>
                  Real-time Signal Intake
                </h1>
                <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Submit operational events into the Praxis spine. Switch scenarios with the picker or press{" "}
                  <kbd className="rounded border border-zinc-700 px-1 font-mono text-[10px]">1</kbd>-
                  <kbd className="rounded border border-zinc-700 px-1 font-mono text-[10px]">{scenarios.length}</kbd>.
                </p>
              </div>
              <ScenarioPicker activeId={activeScenario.id} onChange={applyScenario} />
            </div>
          </section>

          <div className="grid grid-cols-12 gap-5 grid-flow-dense">
            {/* Ingest form */}
            <div className="col-span-12 xl:col-span-5">
              <form onSubmit={handleIngest} className="praxis-v2-panel-enhanced h-full p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="praxis-v2-eyebrow-enhanced">Signal Parameters</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-lg">{activeScenario.icon}</span>
                      <span className="text-base font-semibold text-zinc-100">{activeScenario.label}</span>
                    </div>
                  </div>
                  <div className="inline-flex h-10 w-10 items-center justify-center border border-zinc-700/70 bg-zinc-900/70 text-violet-300">
                    <UploadSimple size={16} />
                  </div>
                </div>

                <div className="mt-6 grid grid-flow-dense gap-3 sm:grid-cols-2">
                  <Field label="Source" value={source} onChange={setSource} mono />
                  <Field label="Event Type" value={eventType} onChange={setEventType} mono />
                  <Field label="Severity" value={severity} onChange={setSeverity} />
                  <Field label="Site" value={site} onChange={setSite} />
                  <div className="sm:col-span-2">
                    <Field label="Asset ID" value={assetId} onChange={setAssetId} mono />
                  </div>
                </div>

                {/* Payload preview */}
                <div className="mt-4 border border-zinc-800 bg-zinc-950/60 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 mb-2">Payload preview</div>
                  <pre className="font-mono text-[11px] text-zinc-400 overflow-auto max-h-28 leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(activeScenario.payload, null, 2)}
                  </pre>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={ingesting}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-violet-500 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-violet-400 transition-all duration-300 hover:scale-105 disabled:opacity-60"
                  >
                    <Pulse size={14} className={ingesting ? "animate-spin" : ""} />
                    {ingesting ? "Ingesting…" : "Ingest Event"}
                  </button>
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-500/20 transition-all duration-300 hover:scale-105 disabled:opacity-60"
                  >
                    <Lightning size={14} className={evaluating ? "animate-pulse" : ""} />
                    {evaluating ? "Evaluating…" : "Ingest + Evaluate"}
                  </button>
                </div>
              </form>
            </div>

            {/* Result + live feed */}
            <div className="col-span-12 xl:col-span-7 flex flex-col gap-5">
              {/* Decision result */}
              {lastResult && (
                <div className="praxis-v2-panel-enhanced p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="praxis-v2-eyebrow-enhanced" style={{ color: "var(--praxis-argon)" }}>Decision Generated</div>
                      <div className="mt-1 font-mono text-xs text-zinc-500">{lastResult.event_id}</div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check size={16} />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-flow-dense grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard label="Decision ID" value={String(lastResult.id)} />
                    <StatCard label="Priority" value={typeof lastResult.priority_score === "number" ? lastResult.priority_score.toFixed(1) : "n/a"} />
                    <StatCard label="Risk" value={lastResult.risk_level ?? "n/a"} />
                    <StatCard label="Confidence" value={typeof lastResult.confidence_score === "number" ? lastResult.confidence_score.toFixed(2) : "n/a"} />
                  </div>
                  <div className="mt-3 border border-zinc-800 bg-zinc-950/50 px-4 py-3">
                    <div className="font-mono text-[10px] text-zinc-500">root cause · {lastResult.root_cause_hypothesis}</div>
                    <div className="mt-1 font-mono text-[10px] text-zinc-600 break-all">{lastResult.replay_hash}</div>
                  </div>
                  <button
                    onClick={() => router.push("/decision-center")}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-all duration-300 hover:scale-105"
                  >
                    View in Decision Center
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {/* Live feed */}
              <div className="praxis-v2-panel-enhanced flex-1 p-6">
                <div className="praxis-v2-eyebrow-enhanced">Live Event Feed</div>
                <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto">
                  {events.length === 0 ? (
                    <EmptyState title="No events yet" message="Ingest events to populate the live stream." />
                  ) : (
                    events.slice(0, 20).map((row) => (
                      <div
                        key={row.event_id}
                        className="border border-zinc-800/80 bg-zinc-900/60 px-3 py-2.5 transition-all duration-300 hover:border-zinc-700"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="mono-data text-xs text-zinc-100">{row.event_id}</span>
                          <span className="mono-data text-[10px] text-zinc-600">
                            {typeof row.occurred_at === "string"
                              ? row.occurred_at.replace("T", " ").slice(0, 19)
                              : String(row.occurred_at)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-zinc-300">{row.event_type}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-mono text-[10px] text-zinc-500">{row.source}</span>
                          <span className="font-mono text-[10px] text-zinc-700">·</span>
                          <span className={`rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase ${SEVERITY_BADGE[row.severity] ?? "border-zinc-700 text-zinc-500"}`}>
                            {row.severity}
                          </span>
                          {row.site && <span className="font-mono text-[10px] text-zinc-600">{row.site}</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scenario quick-select strip */}
          <section className="praxis-v2-panel p-5 py-20 sm:py-24">
            <div className="praxis-v2-eyebrow mb-4">Quick scenario select</div>
            <div className="grid grid-flow-dense grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
              {scenarios.map((scenario, idx) => (
                <button
                  key={scenario.id}
                  onClick={() => applyScenario(scenario)}
                  className={`border px-3 py-3 text-left transition-all duration-300 hover:scale-105 ${
                    scenario.id === activeScenario.id
                      ? "border-violet-500/45 bg-violet-500/12 text-violet-100"
                      : "border-zinc-700/60 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                  }`}
                >
                  <div className="text-base">{scenario.icon}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">{idx + 1}</div>
                  <div className="mt-0.5 text-xs font-medium leading-tight">{scenario.label}</div>
                  <div className="mt-1 font-mono text-[9px] text-zinc-600">{scenario.site}</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </WorkbenchShell>
  );
}

function Field({
  label,
  value,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <label>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-10 w-full border border-zinc-700/70 bg-zinc-950/80 px-3 text-sm text-zinc-100 outline-none transition focus:border-violet-400/45 ${mono ? "font-mono text-xs" : ""}`}
      />
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/60 px-3 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">{label}</div>
      <div className="mono-data mt-1.5 text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
}
