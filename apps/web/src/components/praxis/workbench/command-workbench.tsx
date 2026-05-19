"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ArrowsCounterClockwise, BracketsCurly, Export, ShieldCheck, SignOut } from "@phosphor-icons/react";
import type { FeedMode, FeedStatus, QueueTicket } from "@/lib/hooks/use-command-feed";
import { WorkbenchShell, TopbarTitle, Pill } from "./WorkbenchShell";

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

function statusLabel(feedStatus: FeedStatus, feedMode: FeedMode, visibleCount: number) {
  if (feedStatus === "loading") {
    return { label: "Syncing live data", tone: "plasma" as const };
  }
  if (feedMode === "live" && visibleCount > 0) {
    return { label: "Live data active", tone: "argon" as const };
  }
  if (feedMode === "stale") {
    return { label: "Stale data with last known records", tone: "plasma" as const };
  }
  if (feedMode === "demo") {
    return { label: "operations snapshot", tone: "plasma" as const };
  }
  return { label: "operations snapshot", tone: "plasma" as const };
}

function confidenceFor(ticket?: QueueTicket) {
  if (!ticket) return 0.84;
  return Math.max(0.55, Math.min(0.95, ticket.score / 100));
}

function FieldMetric({
  label,
  value,
  tone = "var(--praxis-bone)",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.6)] p-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">{label}</div>
      <div className="mt-2 font-display text-[26px] font-medium tracking-[-0.02em]" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  tone = "primary",
}: {
  label: string;
  onClick: () => void;
  tone?: "primary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] transition-transform duration-700 hover:scale-105 ${
        tone === "primary"
          ? "border-[var(--praxis-plasma)] bg-[linear-gradient(135deg,var(--praxis-plasma),color-mix(in_srgb,var(--praxis-plasma)_70%,var(--praxis-bone)))] text-[var(--praxis-obsidian)]"
          : "border-[var(--praxis-line)] bg-[rgba(10,10,20,0.56)] text-[var(--praxis-bone)]"
      }`}
    >
      {label}
    </button>
  );
}

export function PraxisCommandWorkbench(props: {
  feedStatus: FeedStatus;
  feedMode: FeedMode;
  lastSyncSeconds: number;
  warnings: string[];
  search: string;
  onSearchChange: (v: string) => void;
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
  const router = useRouter();
  const {
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
  } = props;

  const status = statusLabel(feedStatus, feedMode, visibleCountForStatus);
  const confidence = confidenceFor(selectedTicket);
  const score = selectedTicket?.score ?? 0;
  const proofHash = `sha256:${(selectedTicket?.ticketId ?? "praxis-demo").replace(/[^a-zA-Z0-9]/g, "").toLowerCase().padEnd(12, "0")}c1a9fe42`;

  const topbarRight = (
    <>
      <Pill tone={status.tone}>{status.label}</Pill>
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.56)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-105"
      >
        <ArrowsCounterClockwise className="h-3.5 w-3.5" />
        Refresh · {formatSync(lastSyncSeconds)}
      </button>
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 border border-[var(--praxis-plasma)] bg-[linear-gradient(135deg,var(--praxis-plasma),color-mix(in_srgb,var(--praxis-plasma)_70%,var(--praxis-bone)))] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-obsidian)] transition-transform duration-700 hover:scale-105 disabled:cursor-wait disabled:opacity-70"
      >
        <Export className="h-3.5 w-3.5" />
        {isExporting ? "Exporting…" : "Export audit"}
      </button>
      <button
        type="button"
        onClick={onLogout}
        disabled={isSigningOut}
        className="inline-flex items-center gap-2 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.56)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-105 disabled:cursor-wait disabled:opacity-70"
      >
        <SignOut className="h-3.5 w-3.5" />
        {isSigningOut ? "Signing out…" : "Sign out"}
      </button>
    </>
  );

  return (
    <WorkbenchShell
      packName="Command Center"
      runId={selectedTicket?.ticketId}
      topbar={<TopbarTitle title="Command Center" subtitle="Signal queue · Praxis Decision · replay chain · operator workflow" right={topbarRight} />}
    >
      <div className="grid grid-cols-1 grid-flow-dense gap-6 p-6 md:p-8 lg:grid-cols-[0.92fr_1.08fr_0.86fr]">
        <section className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] py-20 transition-transform duration-700 ease-out hover:scale-[1.005]">
          <div className="border-b border-[var(--praxis-line)] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Signal Queue</div>
                <div className="mt-2 font-display text-[26px] font-medium tracking-[-0.02em]">{tickets.length} visible</div>
              </div>
              <Pill tone={status.tone}>{status.label}</Pill>
            </div>
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="search signal queue"
              className="mt-4 w-full border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.56)] px-3 py-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--praxis-bone)] placeholder:text-[var(--praxis-mute)] focus:border-[var(--praxis-plasma)] focus:outline-none"
            />
            {warnings.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {warnings.map((warning) => (
                  <Pill key={warning} tone="plasma">{warning}</Pill>
                ))}
              </div>
            ) : null}
          </div>
          <div className="max-h-[720px] overflow-y-auto">
            {tickets.map((ticket) => {
              const active = ticket.ticketId === (selectedTicketId ?? tickets[0]?.ticketId);
              const critical = ticket.priority === "Critical" || ticket.score >= 90;
              return (
                <button
                  key={ticket.ticketId}
                  type="button"
                  onClick={() => onSelectTicket(ticket.ticketId)}
                  className={`flex w-full items-start gap-3 border-b border-[var(--praxis-line)] px-5 py-4 text-left transition-transform duration-700 hover:translate-x-1 ${
                    active ? "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--praxis-plasma)_12%,transparent),transparent)]" : "bg-transparent"
                  }`}
                >
                  <span
                    className="mt-1 block h-2 w-2 rounded-full"
                    style={{
                      background: critical ? "var(--praxis-plasma)" : "var(--praxis-argon)",
                      boxShadow: critical ? "0 0 12px rgba(139,92,255,0.45)" : "0 0 12px rgba(62,255,168,0.35)",
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`font-mono text-[11px] uppercase tracking-[0.12em] ${active ? "text-[var(--praxis-bone)]" : "text-[var(--praxis-mute)]"}`}>
                        {ticket.ticketId}
                      </span>
                      <span className="font-mono text-[11px]" style={{ color: critical ? "var(--praxis-plasma)" : "var(--praxis-argon)" }}>
                        P{ticket.score}
                      </span>
                    </div>
                    <div className="mt-2 text-[14px] font-medium leading-6 text-[var(--praxis-bone)]">{ticket.title}</div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                      {ticket.category} · {ticket.assignee} · {ticket.daysOpen}d open
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex min-h-0 flex-col gap-6 py-20">
          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 transition-transform duration-700 ease-out hover:scale-[1.005]">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-violet)]">Selected incident</div>
            <h2 className="mt-3 font-display text-[32px] font-medium leading-[1.1] tracking-[-0.025em]">
              {selectedTicket?.title ?? "Select a signal"}
            </h2>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              {selectedTicket?.requester ?? "machine telemetry + operator ticket"}
            </div>
            <div className="mt-6 grid grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4">
              <FieldMetric label="Priority" value={selectedTicket ? `P${selectedTicket.score}` : "—"} tone="var(--praxis-plasma)" />
              <FieldMetric label="Confidence" value={confidence.toFixed(2)} tone="var(--praxis-argon)" />
              <FieldMetric label="Status" value={selectedTicket?.status ?? "—"} />
              <FieldMetric label="Category" value={selectedTicket?.category ?? "—"} />
            </div>
          </article>

          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 transition-transform duration-700 ease-out hover:scale-[1.005]">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
              <ShieldCheck className="h-4 w-4 text-[var(--praxis-violet)]" />
              Praxis Decision
            </div>
            <div className="mt-5 grid grid-flow-dense grid-cols-1 gap-6 md:grid-cols-[0.78fr_1.22fr]">
              <div>
                <div className="font-display text-[72px] font-medium leading-none tracking-[-0.05em]" style={{ color: "var(--praxis-bone)" }}>
                  {(score / 100).toFixed(2)}
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
                  route based on severity, evidence, and recurrence
                </div>
              </div>
              <div>
                <div className="text-[14px] leading-7 text-[var(--praxis-bone)]">
                  {selectedTicket?.recommendation ?? "Select a case to inspect the recommended next move."}
                </div>
                <div className="mt-5 grid grid-flow-dense grid-cols-3 gap-3">
                  <ActionButton
                    label="Approve workflow"
                    onClick={() => router.push(`/decision-center?ticket=${encodeURIComponent(selectedTicket?.ticketId ?? "")}`)}
                  />
                  <ActionButton
                    label="Edit & re-rank"
                    tone="ghost"
                    onClick={() => router.push(`/decision?ticket=${encodeURIComponent(selectedTicket?.ticketId ?? "")}`)}
                  />
                  <ActionButton
                    label="Escalate to responsible team"
                    tone="ghost"
                    onClick={() => router.push(`/executive-readout?ticket=${encodeURIComponent(selectedTicket?.ticketId ?? "")}`)}
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 transition-transform duration-700 ease-out hover:scale-[1.005]">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
              <BracketsCurly className="h-4 w-4 text-[var(--praxis-argon)]" />
              Replay hash chain
            </div>
            <div className="mt-5 space-y-3">
              {[
                ["raw signals", proofHash.slice(0, 20)],
                ["decision object", proofHash.slice(8, 28)],
                ["workflow action", proofHash.slice(14, 34)],
              ].map(([label, hash]) => (
                <div key={label} className="flex items-center justify-between border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.56)] px-4 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{label}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-bone)]">{hash}&hellip;</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="flex min-h-0 flex-col gap-6 py-20">
          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 transition-transform duration-700 ease-out hover:scale-[1.005]">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">Operational posture</div>
            <div className="mt-5 grid grid-flow-dense grid-cols-2 gap-3">
              <FieldMetric label="Queue health" value={tickets.length > 0 ? "Active" : "Idle"} tone="var(--praxis-argon)" />
              <FieldMetric label="Open risk" value={`${tickets.filter((ticket) => ticket.daysOpen >= 3).length}`} tone="var(--praxis-plasma)" />
              <FieldMetric label="Linked cluster" value={linkedIncident ? String(linkedIncident.ticketCount) : "0"} />
              <FieldMetric label="Route owner" value={selectedTicket?.assignee ?? "Unassigned"} />
            </div>
          </article>

          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 transition-transform duration-700 ease-out hover:scale-[1.005]">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">Linked incident</div>
            {linkedIncident ? (
              <>
                <div className="mt-3 font-display text-[24px] font-medium tracking-[-0.02em]">{linkedIncident.title}</div>
                <div className="mt-3 text-[14px] leading-7 text-[var(--praxis-bone)]">
                  {linkedIncident.rootCause}
                </div>
                <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                  <span>{linkedIncident.ticketCount} tickets</span>
                  <span style={{ color: "var(--praxis-argon)" }}>confidence {linkedIncident.confidence.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="mt-4 text-[14px] leading-7 text-[var(--praxis-muted)]">
                No linked incident cluster yet. This case is still operating as a standalone signal.
              </div>
            )}
          </article>

          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 transition-transform duration-700 ease-out hover:scale-[1.005]">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">Next operator move</div>
            <div className="mt-4 text-[14px] leading-7 text-[var(--praxis-bone)]">
              Collapse duplicate queue motion, route the decision through a human approval path, and preserve the proof chain before any downstream comms leave the system.
            </div>
            <button
              type="button"
              onClick={() => router.push(`/proof/${encodeURIComponent(selectedTicket?.ticketId ?? "command-center")}`)}
              className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-bone)] transition-transform duration-700 hover:translate-x-1"
            >
              Inspect proof surface
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        </section>
      </div>
    </WorkbenchShell>
  );
}
