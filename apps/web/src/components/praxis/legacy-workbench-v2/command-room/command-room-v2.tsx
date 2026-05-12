"use client";

import { useEffect } from "react";
import { ArrowClockwise, MagnifyingGlass, ShieldChevron, SignOut } from "@phosphor-icons/react";
import type { FeedMode, FeedStatus, QueueTicket } from "@/lib/hooks/use-command-feed";

import { MagneticActionButton } from "@/components/praxis/legacy-workbench-v2/motion/magnetic-action-button";
import { StatusPulse } from "@/components/praxis/legacy-workbench-v2/motion/status-pulse";
import { SignalConstellation } from "@/components/praxis/legacy-workbench-v2/command-room/signal-constellation";
import { IncidentFocusPanel } from "@/components/praxis/legacy-workbench-v2/command-room/incident-focus-panel";
import { PraxisDecisionPanel } from "@/components/praxis/legacy-workbench-v2/command-room/astraea-decision-panel";
import { ReplayHashRail } from "@/components/praxis/legacy-workbench-v2/command-room/replay-hash-rail";
import { EvidenceRibbon } from "@/components/praxis/legacy-workbench-v2/command-room/evidence-ribbon";
import { OperatorFeedbackStack } from "@/components/praxis/legacy-workbench-v2/command-room/operator-feedback-stack";
import { AuditTrailLedger } from "@/components/praxis/legacy-workbench-v2/command-room/audit-trail-ledger";
import { displayStatus, statusLabel } from "@/components/praxis/legacy-workbench-v2/command-room/types";

type LinkedIncident = {
  id: string;
  title: string;
  rootCause: string;
  ticketCount: number;
  confidence: number;
  impact: number;
};

function formatSync(seconds: number) {
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function clockText() {
  return new Date().toISOString().slice(11, 19);
}

function confidenceFor(ticket?: QueueTicket) {
  if (!ticket) return 0.84;
  if (ticket.ticketId === "INC-4821") return 0.92;
  return Math.max(0.55, Math.min(0.95, ticket.score / 100));
}

export function CommandRoomV2({
  feedStatus,
  feedMode,
  lastSyncSeconds,
  warnings,
  search,
  onSearchChange,
  onRefresh,
  onExport,
  isExporting,
  onLogout,
  isSigningOut,
  tickets,
  selectedTicketId,
  onSelectTicket,
  selectedTicket,
  linkedIncident,
  visibleCountForStatus,
}: {
  feedStatus: FeedStatus;
  feedMode: FeedMode;
  lastSyncSeconds: number;
  warnings: string[];
  search: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isExporting: boolean;
  onLogout: () => void;
  isSigningOut: boolean;
  tickets: QueueTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
  selectedTicket?: QueueTicket;
  linkedIncident?: LinkedIncident;
  visibleCountForStatus: number;
}) {
  const state = displayStatus(feedStatus, feedMode, visibleCountForStatus);
  const stateLabel = statusLabel(state);
  const pulseMode = state === "live" ? "live" : state === "demo" ? "demo" : state === "stale" ? "stale" : "offline";
  const queueSummary =
    tickets.length > 0
      ? `queue ${tickets.length} visible`
      : state === "demo"
        ? "queue seeded from demo scenario"
        : state === "stale"
          ? "queue restored from last known records"
          : "queue pending live sync";

  useEffect(() => {
    if (tickets.length === 0) return;
    const currentExists = selectedTicketId ? tickets.some((ticket) => ticket.ticketId === selectedTicketId) : false;
    if (!currentExists) {
      const preferred = tickets.find((ticket) => ticket.ticketId === "INC-4821") ?? tickets[0];
      onSelectTicket(preferred.ticketId);
    }
  }, [tickets, selectedTicketId, onSelectTicket]);

  return (
    <main className="praxis-v2-root min-h-[100dvh] overflow-x-hidden px-4 py-2 sm:px-6 lg:px-8">
      <div className="praxis-v2-grid" />
      <div className="praxis-v2-noise" />
      <div className="praxis-v2-amber-field" />
      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <header className="praxis-v2-panel mb-2 p-3 sm:p-3.5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-900/75 text-violet-300">
                  <ShieldChevron size={15} />
                </div>
                <span className="mono-data text-[11px] uppercase tracking-[0.22em] text-zinc-300">Praxis</span>
                <StatusPulse mode={pulseMode} label={stateLabel} />
              </div>
              <h1 className="mt-1.5 text-lg font-semibold leading-tight text-zinc-100 sm:text-xl">
                Signal → Decision → Workflow → Feedback → Replay
              </h1>
              <div className="mt-1 text-xs text-zinc-500">Last sync {formatSync(lastSyncSeconds)} | {clockText()} UTC | {queueSummary}</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/75 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500 hover:scale-105 transition-transform duration-500"
              >
                <ArrowClockwise size={15} />
                Refresh
              </button>
              <MagneticActionButton onClick={onExport} disabled={isExporting}>
                {isExporting ? "Exporting..." : "Export Audit Bundle"}
              </MagneticActionButton>
              <button
                type="button"
                onClick={onLogout}
                disabled={isSigningOut}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/75 px-4 py-2 text-sm text-zinc-200 transition hover:border-rose-400/40 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70 hover:scale-105 transition-transform duration-500"
              >
                <SignOut size={15} />
                {isSigningOut ? "Signing out..." : "Logout"}
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full max-w-[540px]">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search signal queue, category, operator, or incident..."
                className="min-h-10 w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/45"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {warnings.slice(0, 2).map((warning) => (
                <div key={warning} className="rounded-full border border-violet-500/25 bg-violet-500/12 px-3 py-1.5 text-xs text-violet-100">
                  {warning}
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="praxis-v2-ops-path grid grid-flow-dense grid-cols-12 items-stretch gap-3 rounded-2xl p-0.5 py-20">
          <div className="col-span-12 xl:col-span-3">
            <SignalConstellation tickets={tickets} selectedId={selectedTicketId} onSelect={onSelectTicket} dataStatus={state} />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <IncidentFocusPanel ticket={selectedTicket} linkedIncident={linkedIncident} dataStatus={state} />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <PraxisDecisionPanel ticket={selectedTicket} dataStatus={state} />
          </div>
        </section>

        <section className="mt-2 praxis-v2-ops-path rounded-2xl p-0.5 py-20">
          <ReplayHashRail ticket={selectedTicket} dataStatus={state} />
        </section>

        <section className="praxis-v2-ops-path mt-2 grid grid-flow-dense grid-cols-1 gap-3 rounded-2xl p-0.5 py-20 xl:grid-cols-[1.45fr,1fr,1fr]">
          <EvidenceRibbon
            dataStatus={state}
            items={[
              {
                id: "ev1",
                label: "SLO burn rate",
                source: "prometheus / burn-rate analyzer",
                timestamp: "13m ago",
              },
              {
                id: "ev2",
                label: "Kubernetes event window",
                source: "cluster events / ingress + node metrics",
                timestamp: "22m ago",
              },
              {
                id: "ev3",
                label: "Forensic waveform capture",
                source: "line-03 edge capture stream",
                timestamp: "31m ago",
              },
              {
                id: "ev4",
                label: "Operator response runbook",
                source: "runbooks / mechanical escalation",
                timestamp: "40m ago",
              },
            ]}
          />

          <OperatorFeedbackStack
            dataStatus={state}
            feedback={[
              {
                id: "f1",
                author: "Ops Lead · M. Santos",
                verdict: "approve",
                comment: "Ops Lead approves deterministic route for INC-4821.",
                timestamp: "15m ago",
              },
              {
                id: "f2",
                author: "Reliability · A. Rahman",
                verdict: "question",
                comment: "Reliability asks for one more vibration sampling window before closure.",
                timestamp: "9m ago",
              },
            ]}
          />

          <AuditTrailLedger
            dataStatus={state}
            items={[
              { id: "a1", label: "Signal ingest checkpoint", hash: "sha256:inc-4821c9a2f", timestamp: "36m ago" },
              { id: "a2", label: "Praxis decision record", hash: "sha256:3a7d4e77ab01", timestamp: "28m ago" },
              { id: "a3", label: "Operator review artifact", hash: "sha256:772f1c08f447", timestamp: "15m ago" },
              { id: "a4", label: "Workflow closure snapshot", hash: "sha256:f8bd14c0a882", timestamp: "6m ago" },
            ]}
          />
        </section>

        <footer className="mt-2 pb-1">
          <div className="praxis-v2-panel px-4 py-3 text-xs text-zinc-400">
            Signal → Decision → Workflow → Feedback → Replay is active for{" "}
            <span className="mono-data text-violet-100">{selectedTicket?.ticketId || "INC-4821"}</span> with confidence{" "}
            <span className="mono-data text-zinc-200">{confidenceFor(selectedTicket).toFixed(2)}</span>.
          </div>
        </footer>
      </div>
    </main>
  );
}
