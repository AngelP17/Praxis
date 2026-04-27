"use client";

import { useEffect } from "react";
import { ArrowClockwise, MagnifyingGlass, ShieldChevron, SignOut } from "@phosphor-icons/react";
import type { FeedMode, FeedStatus, QueueTicket } from "@/lib/hooks/use-command-feed";

import { MagneticActionButton } from "@/components/sentinel-v2/motion/magnetic-action-button";
import { StatusPulse } from "@/components/sentinel-v2/motion/status-pulse";
import { SignalConstellation } from "@/components/sentinel-v2/command-room/signal-constellation";
import { IncidentFocusPanel } from "@/components/sentinel-v2/command-room/incident-focus-panel";
import { AstraeaDecisionPanel } from "@/components/sentinel-v2/command-room/astraea-decision-panel";
import { ReplayHashRail } from "@/components/sentinel-v2/command-room/replay-hash-rail";
import { EvidenceRibbon } from "@/components/sentinel-v2/command-room/evidence-ribbon";
import { OperatorFeedbackStack } from "@/components/sentinel-v2/command-room/operator-feedback-stack";
import { AuditTrailLedger } from "@/components/sentinel-v2/command-room/audit-trail-ledger";
import { displayStatus, statusLabel } from "@/components/sentinel-v2/command-room/types";

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

  useEffect(() => {
    if (tickets.length === 0) return;
    const currentExists = selectedTicketId ? tickets.some((ticket) => ticket.ticketId === selectedTicketId) : false;
    if (!currentExists) {
      onSelectTicket(tickets[0].ticketId);
    }
  }, [tickets, selectedTicketId, onSelectTicket]);

  return (
    <main className="sentinel-v2-root min-h-[100dvh] overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="sentinel-v2-grid" />
      <div className="sentinel-v2-noise" />
      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <header className="sentinel-v2-panel mb-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-900/75 text-amber-300">
                  <ShieldChevron size={15} />
                </div>
                <span className="mono-data text-[11px] uppercase tracking-[0.22em] text-zinc-300">Aether Sentinel</span>
                <StatusPulse mode={feedMode} label={stateLabel} />
              </div>
              <h1 className="mt-2 text-xl font-semibold leading-tight text-zinc-100 sm:text-2xl">
                Industrial command room for deterministic incident decisions
              </h1>
              <div className="mt-1.5 text-xs text-zinc-500">
                Last sync {formatSync(lastSyncSeconds)} | {clockText()} UTC
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/75 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
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
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/75 px-4 py-2 text-sm text-zinc-200 transition hover:border-rose-400/40 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <SignOut size={15} />
                {isSigningOut ? "Signing out..." : "Logout"}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <label className="relative block w-full max-w-[540px]">
              <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search signal queue, category, operator, or incident..."
                className="min-h-10 w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-400/45"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {warnings.slice(0, 2).map((warning) => (
                <div key={warning} className="rounded-full border border-amber-500/25 bg-amber-500/12 px-3 py-1.5 text-xs text-amber-100">
                  {warning}
                </div>
              ))}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-12 items-stretch gap-4">
          <div className="col-span-12 xl:col-span-3">
            <SignalConstellation tickets={tickets} selectedId={selectedTicketId} onSelect={onSelectTicket} dataStatus={state} />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <IncidentFocusPanel ticket={selectedTicket} linkedIncident={linkedIncident} dataStatus={state} />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <AstraeaDecisionPanel ticket={selectedTicket} dataStatus={state} />
          </div>
        </section>

        <section className="mt-3.5">
          <ReplayHashRail ticket={selectedTicket} dataStatus={state} />
        </section>

        <section className="mt-3.5 grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr,1fr,1fr]">
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
              { id: "a2", label: "Astraea decision record", hash: "sha256:3a7d4e77ab01", timestamp: "28m ago" },
              { id: "a3", label: "Operator review artifact", hash: "sha256:772f1c08f447", timestamp: "15m ago" },
              { id: "a4", label: "Workflow closure snapshot", hash: "sha256:f8bd14c0a882", timestamp: "6m ago" },
            ]}
          />
        </section>

        <footer className="mt-5 pb-1">
          <div className="sentinel-v2-panel px-4 py-3 text-xs text-zinc-400">
            Signal → Decision → Workflow → Feedback → Replay is active for{" "}
            <span className="mono-data text-amber-100">{selectedTicket?.ticketId || "INC-4821"}</span> with confidence{" "}
            <span className="mono-data text-zinc-200">{confidenceFor(selectedTicket).toFixed(2)}</span>.
          </div>
        </footer>
      </div>
    </main>
  );
}
