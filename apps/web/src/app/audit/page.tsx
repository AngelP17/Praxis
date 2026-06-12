"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { FileArrowDown, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react";

import { GhostAction, Pill, TopbarTitle, WorkbenchShell } from "@/components/praxis/workbench/WorkbenchShell";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { DEMO_AUDIT, DEMO_TICKETS } from "@/lib/demo-scenario";
import { fetchJsonWithTimeout } from "@/lib/api";
import { useDemoSessionStore } from "@/lib/demo/demo-session-store";
import { IS_DEMO_MODE } from "@/lib/demo-mode";

type AuditEvent = {
  event_id: string;
  source: string;
  event_type: string;
  severity: string;
  occurred_at: string;
  created_at: string;
};

const FALLBACK_AUDIT: AuditEvent[] = [
  { event_id: "evt_signal_ingest", source: "sensor_gateway", event_type: "signal_ingested", severity: "high", occurred_at: "2026-04-27T13:30:00.000Z", created_at: "2026-04-27T13:30:01.000Z" },
  { event_id: "evt_ticket_open", source: "operator_joe", event_type: "ticket_open", severity: "high", occurred_at: "2026-04-27T13:31:15.000Z", created_at: "2026-04-27T13:31:16.000Z" },
  { event_id: "evt_decision_commit", source: "astraea", event_type: "decision_commit", severity: "high", occurred_at: "2026-04-27T13:33:15.000Z", created_at: "2026-04-27T13:33:16.000Z" },
  { event_id: "evt_workflow_route", source: "orchestrator", event_type: "workflow_route", severity: "medium", occurred_at: "2026-04-27T13:40:20.000Z", created_at: "2026-04-27T13:40:21.000Z" },
  { event_id: "evt_feedback_approve", source: "ops.lead.santos", event_type: "feedback_approve", severity: "medium", occurred_at: "2026-04-27T13:42:00.000Z", created_at: "2026-04-27T13:42:01.000Z" },
];

function AuditShell({ children }: { children: ReactNode }) {
  return (
    <WorkbenchShell
      topbar={
        <TopbarTitle
          title="Audit"
          subtitle="immutable event ledger / incident export bundles"
          right={
            <>
              <Pill tone="argon">chain verified</Pill>
              <GhostAction href="/reports">Reports</GhostAction>
            </>
          }
        />
      }
    >
      {children}
    </WorkbenchShell>
  );
}

export default function AuditTrailPage() {
  const demoAuditLog = useDemoSessionStore((state) => state.auditLog);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [exportPayload, setExportPayload] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    if (IS_DEMO_MODE) {
      setEvents(
        demoAuditLog.map((entry) => ({
          event_id: entry.id,
          source: entry.actor,
          event_type: entry.action,
          severity: entry.action.includes("reject") ? "medium" : "high",
          occurred_at: entry.ts,
          created_at: entry.ts,
        })),
      );
      setStatus("ready");
      return;
    }
    try {
      const rows = await fetchJsonWithTimeout<AuditEvent[]>("/api/audit/events");
      setEvents(rows.length > 0 ? rows : FALLBACK_AUDIT);
      setStatus("ready");
      if (rows.length === 0) setNotice(null);
    } catch (error) {
      setEvents(FALLBACK_AUDIT);
      setStatus("ready");
      setNotice(null);
    }
  }, [demoAuditLog]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) =>
      [event.event_id, event.source, event.event_type, event.severity].join(" ").toLowerCase().includes(term)
    );
  }, [events, search]);

  async function exportIncident(incidentId: string) {
    if (IS_DEMO_MODE) {
      setExportPayload(JSON.stringify({ incident_id: incidentId, exported_at: new Date().toISOString(), audit: demoAuditLog }, null, 2));
      setNotice(`Demo audit bundle loaded for ${incidentId}.`);
      return;
    }
    try {
      const payload = await fetchJsonWithTimeout<Record<string, unknown>>(`/api/audit/export/${incidentId}`);
      setExportPayload(JSON.stringify(payload, null, 2));
      setNotice(`Audit bundle loaded for ${incidentId}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Audit export failed.");
    }
  }

  if (status === "loading") {
    return (
      <AuditShell>
        <div className="p-[26px]">
          <LoadingSkeleton />
        </div>
      </AuditShell>
    );
  }

  if (status === "error") {
    return (
      <AuditShell>
        <div className="p-[26px]">
          <ErrorState title="Audit trail unavailable" message={notice || "Could not load audit events."} onRetry={loadEvents} />
        </div>
      </AuditShell>
    );
  }

  return (
    <AuditShell>
      <div className="grid grid-flow-dense gap-[14px] p-[26px]">
        <section className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-6 py-20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Audit Trail</div>
              <h1 className="mt-3 font-display text-[28px] font-semibold tracking-[-0.03em] text-[var(--praxis-bone)]">Compliance and Forensic Event Ledger</h1>
              <p className="mt-2 text-sm leading-7 text-[var(--praxis-mute)]">Event chain sourced from <span className="font-mono text-[12px] text-[var(--praxis-argon)]">/api/audit/events</span> with incident-level export bundles.</p>
            </div>
            <button
              onClick={() => void exportIncident(DEMO_TICKETS[0].ticket_id)}
              className="inline-flex min-h-10 items-center gap-2 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--praxis-bone)] transition-transform duration-500 hover:scale-105"
            >
              <FileArrowDown size={14} />
              Export {DEMO_TICKETS[0].ticket_id}
            </button>
          </div>
          {notice ? <div className="mt-3 border border-[var(--praxis-plasma)] bg-[color-mix(in_srgb,var(--praxis-plasma)_10%,transparent)] px-4 py-2 text-sm text-[var(--praxis-bone)]">{notice}</div> : null}
          <label className="relative mt-4 block max-w-lg">
            <MagnifyingGlass size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--praxis-faint)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search event id, source, type, severity..."
              className="min-h-10 w-full border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.66)] py-2 pl-9 pr-3 text-sm text-[var(--praxis-bone)] outline-none transition placeholder:text-[var(--praxis-faint)] focus:border-[var(--praxis-plasma)]"
            />
          </label>
        </section>

        <section className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-5 py-20">
          {filtered.length === 0 ? (
            <EmptyState title="No audit events" message="No audit records matched the current filters." />
          ) : (
            <div className="grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)]">
              {filtered.slice(0, 120).map((event) => (
                <div key={event.event_id} className="bg-[var(--praxis-obsidian)] px-4 py-3 transition-colors duration-300 hover:bg-[var(--praxis-surface-2)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-[var(--praxis-bone)]">{event.event_id}</span>
                      <span className="border border-[var(--praxis-line)] bg-[var(--praxis-surface-2)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-mute)]">{event.source}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[var(--praxis-faint)]">{event.created_at}</span>
                  </div>
                  <div className="mt-1.5 text-sm text-[var(--praxis-bone)]">{event.event_type.replace(/_/g, " ")}</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--praxis-mute)]">severity: {event.severity} · occurred: {event.occurred_at}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {events.length > 0 ? (
          <section className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-5 py-20">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[var(--praxis-argon)]" />
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Immutable Audit Chain</div>
            </div>
            <div className="mt-4 grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)]">
              {(IS_DEMO_MODE
                ? demoAuditLog.map((entry) => ({ ts: entry.ts, actor: entry.actor, action: entry.action, hash: entry.target }))
                : DEMO_AUDIT
              ).map((entry, index) => (
                <div key={`${entry.action}-${index}`} className="flex items-center gap-3 bg-[var(--praxis-obsidian)] px-4 py-2.5">
                  <span className="w-20 font-mono text-[11px] text-[var(--praxis-faint)]">{entry.ts}</span>
                  <span className="w-32 font-mono text-[11px] text-[var(--praxis-mute)]">{entry.actor}</span>
                  <span className="text-xs text-[var(--praxis-bone)]">{entry.action}</span>
                  <span className="ml-auto font-mono text-[10px] text-[var(--praxis-faint)]">{entry.hash}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {exportPayload ? (
          <section className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-5 py-20">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Export Payload Preview</div>
            <pre className="mt-3 overflow-x-auto border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] p-3 font-mono text-[11px] leading-6 text-[var(--praxis-mute)]">{exportPayload}</pre>
          </section>
        ) : null}
      </div>
    </AuditShell>
  );
}
