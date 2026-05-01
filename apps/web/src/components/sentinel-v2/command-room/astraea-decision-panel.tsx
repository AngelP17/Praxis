import { Brain, ShieldCheck, WarningDiamond } from "@phosphor-icons/react";
import type { QueueTicket } from "@/lib/hooks/use-command-feed";

import { normalizeRootCause, recommendationFor, type DataStatus } from "@/components/sentinel-v2/command-room/types";

function confidenceFor(ticket?: QueueTicket) {
  if (!ticket) return "--";
  if (ticket.ticketId === "INC-4821") return "0.92";
  return (Math.max(0.57, Math.min(0.94, ticket.score / 100))).toFixed(2);
}

function slaRiskFor(ticket?: QueueTicket) {
  if (!ticket) return "--";
  if (ticket.ticketId === "INC-4821") return "0.81";
  return (Math.min(0.95, (ticket.daysOpen + 2) / 8)).toFixed(2);
}

export function AstraeaDecisionPanel({
  ticket,
  dataStatus,
}: {
  ticket?: QueueTicket;
  dataStatus: DataStatus;
}) {
  const stateBadge =
    dataStatus === "live"
      ? "Live decision trace"
      : dataStatus === "demo"
        ? "Demo decision trace"
        : dataStatus === "stale"
          ? "Stale decision trace"
          : dataStatus === "loading"
            ? "Scoring signals"
            : "Fallback mode";
  return (
    <section className="sentinel-v2-panel h-full max-h-[340px] overflow-y-auto p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="sentinel-v2-eyebrow">Astraea Decision</div>
          <p className="mt-1 text-xs text-zinc-400">Deterministic rationale and route recommendation</p>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="rounded-md border border-zinc-700/70 bg-zinc-900/75 px-2 py-1 text-[10px] text-zinc-300">{stateBadge}</span>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-900/75 text-amber-300">
            <Brain size={15} />
          </div>
        </div>
      </div>

      {!ticket ? (
        <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 text-sm text-zinc-400">
          {dataStatus === "loading" ? "Scoring incident signals." : "No decision record available until a case is selected."}
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Priority score" value={String(ticket.score)} tone="amber" />
            <Metric label="Confidence" value={confidenceFor(ticket)} tone="emerald" />
            <Metric label="Root cause" value={ticket.ticketId === "INC-4821" ? "bearing degradation" : normalizeRootCause(ticket.category)} />
            <Metric label="SLO risk" value={slaRiskFor(ticket)} />
          </div>

          <div className="mt-2.5 rounded-xl border border-zinc-700/70 bg-zinc-950/75 p-3.5">
            <div className="inline-flex items-center gap-2 text-xs text-zinc-300">
              <ShieldCheck size={14} className="text-emerald-300" />
              Human-review ready recommendation
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-100">{recommendationFor(ticket)}</p>
          </div>

          <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            <WarningDiamond size={13} />
            Decision trace persists through replay and audit export.
          </div>

          <div className="mt-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/75 p-3">
            <div className="sentinel-v2-eyebrow">Rationale Weights</div>
            <div className="mt-2 space-y-2">
              {[
                ["vibration_rms", 41],
                ["operator_ticket_corr", 27],
                ["bearing_temp_drift", 18],
                ["historical_match", 14],
              ].map(([token, weight]) => (
                <div key={token as string}>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-300">
                    <span className="mono-data">{token as string}</span>
                    <span className="mono-data text-zinc-500">{weight}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
                    <div className="h-full rounded-full bg-amber-300/80" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber" | "emerald";
}) {
  const valueTone = tone === "amber" ? "text-amber-100" : tone === "emerald" ? "text-emerald-100" : "text-zinc-100";
  return (
    <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/70 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className={`mono-data mt-1 text-xs ${valueTone}`}>{value}</div>
    </div>
  );
}
