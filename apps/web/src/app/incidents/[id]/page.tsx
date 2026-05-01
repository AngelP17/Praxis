"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChartLine, Hash, ShieldCheck, Waveform } from "@phosphor-icons/react/dist/ssr";

import { getDemoIncident } from "@/lib/demo-scenario";
import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/client-api";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { SignalMarquee } from "@/components/sentinel-v2/motion/signal-marquee";

type IncidentDetailPayload = {
  incident: {
    title: string;
    status: string;
    ticket_count: number;
    confidence?: number;
    business_impact_score?: number;
    opened_at?: string;
  };
  common_cause: string;
  recommended_action: string;
  tickets: Array<{
    ticket_id: string;
    title: string;
    status: string;
    priority_score?: number;
  }>;
};

type TimelinePayload = {
  incident_id: string;
  timeline: Array<{ phase: string; timestamp?: string; detail: string; source?: string; label?: string }>;
};

function percent(value?: number | null) {
  if (typeof value !== "number") return "--";
  return `${Math.round(value)}%`;
}

function score(value?: number | null) {
  if (typeof value !== "number") return "--";
  return value.toFixed(1);
}

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const incidentId = params.id;

  const [payload, setPayload] = useState<IncidentDetailPayload | null>(null);
  const [timeline, setTimeline] = useState<TimelinePayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const loadIncident = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const [incidentR, timelineR] = await Promise.allSettled([
        fetchJsonWithTimeout<IncidentDetailPayload>(`/api/incidents/${incidentId}`),
        fetchJsonWithTimeout<TimelinePayload>(`/api/incidents/${incidentId}/timeline`),
      ]);

      const incidentData =
        incidentR.status === "fulfilled" ? incidentR.value : getDemoIncident(incidentId);

      const timelineData: TimelinePayload =
        timelineR.status === "fulfilled"
          ? timelineR.value
          : {
              incident_id: incidentId,
              timeline: [
                { phase: "signal", detail: "Telemetry threshold crossed on press-line-3", timestamp: "T+00s" },
                { phase: "decision", detail: "Astraea priority raised to 96 with confidence 0.92", timestamp: "T+04s" },
                { phase: "workflow", detail: "Mechanical escalation route created", timestamp: "T+09s" },
                { phase: "feedback", detail: "Ops Lead approved / Reliability requested extra sample", timestamp: "T+15s" },
              ],
            };

      setPayload(incidentData);
      setTimeline(timelineData);
      setStatus("ready");
      if (incidentR.status === "rejected") {
        setNotice("Demo scenario active. Incident detail returned from seeded records.");
      }
    } catch (error) {
      setStatus("error");
      setNotice(error instanceof Error ? error.message : "Incident detail unavailable.");
    }
  }, [incidentId]);

  useEffect(() => {
    void loadIncident();
  }, [loadIncident]);

  async function resolveIncident() {
    setResolving(true);
    try {
      await postJsonWithTimeout(`/api/incidents/${incidentId}/resolve`, {
        summary: "Resolved from forensic command interface with mechanical replacement workflow.",
      });
      setNotice(`Incident ${incidentId} marked resolved.`);
      await loadIncident();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Resolve operation failed.");
    } finally {
      setResolving(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="sentinel-v2-root min-h-[100dvh] overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="sentinel-v2-grid" />
        <div className="sentinel-v2-noise" />
        <div className="sentinel-v2-amber-field" />
        <div className="relative z-10 mx-auto max-w-[1580px]">
          <LoadingSkeleton />
        </div>
      </main>
    );
  }

  if (status === "error" || !payload) {
    return (
      <main className="sentinel-v2-root min-h-[100dvh] overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        <div className="sentinel-v2-grid" />
        <div className="sentinel-v2-noise" />
        <div className="sentinel-v2-amber-field" />
        <div className="relative z-10 mx-auto max-w-[1580px]">
          <ErrorState title="Incident detail unavailable" message={notice || "Could not load incident payload."} onRetry={() => void loadIncident()} />
        </div>
      </main>
    );
  }

  return (
    <main className="sentinel-v2-root min-h-[100dvh] overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="sentinel-v2-grid" />
      <div className="sentinel-v2-noise" />
      <div className="sentinel-v2-amber-field" />

      <div className="relative z-10 mx-auto w-full max-w-[1580px]">
        <section className="sentinel-v2-panel-strong p-5 sm:p-6 py-20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="sentinel-v2-eyebrow">Incident Detail</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">{payload.incident.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-300">
                Forensic incident context with timeline reconstruction, deterministic recommendation, and closure control.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/command-center"
                className="inline-flex min-h-10 items-center rounded-full border border-zinc-700/70 bg-zinc-900/75 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:scale-105 transition-transform duration-500"
              >
                Command center
              </Link>
              <button
                onClick={() => void resolveIncident()}
                disabled={resolving}
                className="inline-flex min-h-10 items-center rounded-full border border-emerald-500/35 bg-emerald-500/12 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-500/18 disabled:opacity-60 hover:scale-105 transition-transform duration-500"
              >
                {resolving ? "Resolving..." : "Resolve Incident"}
              </button>
              <Link
                href="/replay/INC-4821"
                className="inline-flex min-h-10 items-center rounded-full border border-zinc-700/70 bg-zinc-900/75 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:scale-105 transition-transform duration-500"
              >
                Replay
              </Link>
            </div>
          </div>

          {notice ? (
            <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100">{notice}</div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 grid-flow-dense">
            <Stat label="Status" value={payload.incident.status} />
            <Stat label="Linked Tickets" value={String(payload.incident.ticket_count)} mono />
            <Stat label="Confidence" value={percent(payload.incident.confidence)} mono />
            <Stat label="Impact Score" value={score(payload.incident.business_impact_score)} mono />
          </div>
        </section>

        <section className="mt-4 grid grid-cols-12 gap-4 grid-flow-dense py-20">
          <div className="col-span-12 xl:col-span-7">
            <div className="sentinel-v2-panel h-full p-4 sm:p-5">
              <div className="sentinel-v2-eyebrow">Incident Focus</div>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{payload.common_cause}</p>
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/12 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-amber-100">Astraea recommendation</div>
                <p className="mt-2 text-sm leading-7 text-amber-50">{payload.recommended_action}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 grid-flow-dense">
                {["SLO burn rate", "Kubernetes event window", "Forensic waveform capture", "Operator response runbook"].map((item, index) => (
                  <div key={item} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2.5">
                    <div className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
                      {index % 2 === 0 ? <ChartLine size={13} className="text-amber-200" /> : <Waveform size={13} className="text-amber-200" />}
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5">
            <div className="sentinel-v2-panel h-full p-4 sm:p-5">
              <div className="sentinel-v2-eyebrow">Timeline Reconstruction</div>
              <div className="mt-3 space-y-2">
                {(timeline?.timeline || []).map((item, index) => (
                  <div key={`${item.phase}-${index}`} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm capitalize text-zinc-100">{item.phase}</div>
                      <span className="mono-data text-[11px] text-zinc-500">{item.timestamp || "--"}</span>
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">{item.detail}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3">
                <div className="sentinel-v2-eyebrow">Incident Ledger</div>
                <div className="mt-2 space-y-2">
                  <LedgerItem label="Replay hash" value="sha256:inc-4821c9a2f" />
                  <LedgerItem label="Root cause" value="bearing degradation" />
                  <LedgerItem label="Workflow route" value="Mechanical response lane" />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/70 bg-zinc-900/75 px-3 py-2 text-xs text-zinc-300">
                  <ShieldCheck size={13} className="text-emerald-300" />
                  Human-reviewed before closure
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 sentinel-v2-panel p-4 sm:p-5 py-20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="sentinel-v2-eyebrow">Correlated Tickets</div>
            <div className="mono-data text-[11px] text-zinc-500">{payload.tickets.length} linked records</div>
          </div>
          <div className="mt-3 space-y-2">
            {payload.tickets.map((ticket) => (
              <Link
                key={ticket.ticket_id}
                href={`/tickets/${ticket.ticket_id}`}
                className="grid gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2.5 transition hover:border-amber-400/35 hover:scale-105 transition-transform duration-500 md:grid-cols-[130px,minmax(0,1fr),180px] grid-flow-dense"
              >
                <div className="mono-data text-xs text-zinc-100">{ticket.ticket_id}</div>
                <div className="text-sm text-zinc-300">{ticket.title}</div>
                <div className="flex items-center gap-2 md:justify-end">
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300">{ticket.status}</span>
                  <span className="mono-data rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-100">
                    {score(ticket.priority_score)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 py-20">
          <SignalMarquee
            items={[
              payload.incident.title,
              "priority 96 / confidence 0.92",
              "root cause bearing degradation",
              "route mechanical team",
              "replay hash sha256:inc-4821c9a2f",
            ]}
          />
        </section>

        <footer className="mt-4 pb-1">
          <div className="sentinel-v2-panel px-4 py-2.5 text-xs text-zinc-400">
            <div className="inline-flex items-center gap-1.5">
              <Hash size={12} className="text-amber-200" />
              Incident linked to replay hash chain and audit export.
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/75 p-3.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className={`mt-1.5 text-lg font-semibold text-zinc-100 ${mono ? "mono-data" : ""}`}>{value}</div>
    </div>
  );
}

function LedgerItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="mono-data mt-1 text-xs text-zinc-100">{value}</div>
    </div>
  );
}
