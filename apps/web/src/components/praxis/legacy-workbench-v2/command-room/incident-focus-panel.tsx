import { FileMagnifyingGlass, Waveform } from "@phosphor-icons/react";
import type { QueueTicket } from "@/lib/hooks/use-command-feed";

import { normalizeRootCause, recommendationFor, sourceFor, type DataStatus } from "@/components/praxis/legacy-workbench-v2/command-room/types";

type LinkedIncident = {
  id: string;
  title: string;
  rootCause: string;
  ticketCount: number;
  confidence: number;
  impact: number;
};

function confidenceFor(ticket?: QueueTicket) {
  if (!ticket) return "--";
  if (ticket.ticketId === "INC-4821") return "0.92";
  return (Math.max(0.55, Math.min(0.95, ticket.score / 100))).toFixed(2);
}

function rootCauseFor(ticket?: QueueTicket, linkedIncident?: LinkedIncident) {
  if (ticket?.ticketId === "INC-4821") return "bearing degradation";
  return normalizeRootCause(ticket?.category || linkedIncident?.rootCause);
}

export function IncidentFocusPanel({
  ticket,
  linkedIncident,
  dataStatus,
}: {
  ticket?: QueueTicket;
  linkedIncident?: LinkedIncident;
  dataStatus: DataStatus;
}) {
  const stateBadge =
    dataStatus === "live"
      ? "Live incident context"
      : dataStatus === "demo"
        ? "Demo incident context"
        : dataStatus === "stale"
          ? "Stale incident snapshot"
          : dataStatus === "loading"
            ? "Loading context"
            : "Fallback mode";
  const title = ticket?.ticketId === "INC-4821" ? "Press Line 3 vibration cascade" : ticket?.title;
  return (
    <section className="praxis-v2-panel-strong h-full max-h-[340px] overflow-y-auto p-4 sm:p-5 py-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="praxis-v2-eyebrow">Case Inspector</div>
          <p className="mt-1 text-xs text-zinc-400">Selected operational incident context</p>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="rounded-md border border-zinc-700/70 bg-zinc-900/75 px-2 py-1 text-[10px] text-zinc-300">{stateBadge}</span>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-900/75 text-violet-300">
            <FileMagnifyingGlass size={15} />
          </div>
        </div>
      </div>

      {!ticket ? (
        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 text-sm text-zinc-400">
          {dataStatus === "loading"
            ? "Loading selected incident."
            : "No selected case. A high-priority incident will be auto-selected when records arrive."}
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-xl border border-zinc-700/80 bg-zinc-950/70 p-4">
            <div className="mono-data text-xs text-violet-200">{ticket.ticketId}</div>
            <h2 className="mt-1.5 text-xl font-semibold leading-tight text-zinc-100">{title}</h2>
            <div className="mt-2 text-sm text-zinc-400">Source: {sourceFor(ticket)}</div>
          </div>

          <div className="mt-2.5 grid grid-flow-dense grid-cols-2 gap-2">
            <Stat label="Priority score" value={String(ticket.score)} mono />
            <Stat label="Confidence" value={confidenceFor(ticket)} mono />
            <Stat label="Root cause" value={rootCauseFor(ticket, linkedIncident)} />
            <Stat label="Incident cluster" value={linkedIncident?.id || ticket.incidentId || "--"} mono />
          </div>

          <div className="mt-2.5 rounded-xl border border-violet-500/30 bg-violet-500/10 p-3.5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-violet-100">Recommended workflow</div>
            <p className="mt-2 text-sm leading-6 text-violet-50">{recommendationFor(ticket)}</p>
          </div>

          <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg border border-zinc-700/70 bg-zinc-900/75 px-3 py-2 text-xs text-zinc-300">
            <Waveform size={14} className="text-emerald-300" />
            Replay trail is hash-linked and operator-reviewable.
          </div>

          <div className="mt-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/75 p-3">
            <div className="praxis-v2-eyebrow">Event Chain Snapshot</div>
            <div className="mt-2 space-y-2">
              {[
                "signal ingested",
                "operator ticket correlated",
                "cluster linked",
                "workflow routed",
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${index < 3 ? "bg-violet-300" : "bg-zinc-500"}`} />
                  <span className="text-xs text-zinc-300">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/70 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className={`mt-1 text-xs text-zinc-100 ${mono ? "mono-data" : ""}`}>{value}</div>
    </div>
  );
}
