"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileArrowDown, MagnifyingGlass, ShieldCheck } from "@phosphor-icons/react";

import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { DEMO_AUDIT } from "@/lib/demo-scenario";
import { fetchJsonWithTimeout } from "@/lib/client-api";

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

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [exportPayload, setExportPayload] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const rows = await fetchJsonWithTimeout<AuditEvent[]>("/api/audit/events");
      setEvents(rows.length > 0 ? rows : FALLBACK_AUDIT);
      setStatus("ready");
      if (rows.length === 0) setNotice("No live audit rows returned. Showing seeded trail.");
    } catch (error) {
      setEvents(FALLBACK_AUDIT);
      setStatus("ready");
      setNotice(error instanceof Error ? `Seeded audit trail active: ${error.message}` : "Seeded audit trail active.");
    }
  }, []);

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
      <CommandShell>
        <SystemStatusRail activeLabel="Audit" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  if (status === "error") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Audit" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Audit trail unavailable" message={notice || "Could not load audit events."} onRetry={loadEvents} />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Audit" />
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-4">
          <section className="sentinel-v2-panel-strong p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="sentinel-v2-eyebrow">Audit Trail</div>
                <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Compliance and Forensic Event Ledger</h1>
                <p className="mt-2 text-sm text-zinc-400">Event chain sourced from <span className="mono-data">/api/audit/events</span> with incident-level export bundles.</p>
              </div>
              <button
                onClick={() => void exportIncident("INC-4821")}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500"
              >
                <FileArrowDown size={14} />
                Export INC-4821
              </button>
            </div>
            {notice ? <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">{notice}</div> : null}
            <label className="relative mt-4 block max-w-lg">
              <MagnifyingGlass size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search event id, source, type, severity..."
                className="min-h-10 w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 py-2 pl-9 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-amber-400/45"
              />
            </label>
          </section>

          <section className="sentinel-v2-panel p-4 sm:p-5">
            {filtered.length === 0 ? (
              <EmptyState title="No audit events" message="No audit records matched the current filters." />
            ) : (
              <div className="space-y-2">
                {filtered.slice(0, 120).map((event) => (
                  <div key={event.event_id} className="rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3.5 py-3 transition hover:border-zinc-600/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2">
                        <span className="mono-data text-xs font-medium text-zinc-100">{event.event_id}</span>
                        <span className="rounded-full border border-zinc-600/50 bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-400">{event.source}</span>
                      </div>
                      <span className="mono-data text-[11px] text-zinc-500">{event.created_at}</span>
                    </div>
                    <div className="mt-1.5 text-sm text-zinc-300">{event.event_type.replace(/_/g, " ")}</div>
                    <div className="mt-1 text-xs text-zinc-500">severity: {event.severity} · occurred: {event.occurred_at}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {notice && notice.includes("Seeded") ? (
            <section className="sentinel-v2-panel p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-300" />
                <div className="sentinel-v2-eyebrow">Immutable Audit Chain</div>
              </div>
              <div className="mt-3 space-y-2">
                {DEMO_AUDIT.map((entry, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3.5 py-2.5">
                    <span className="mono-data w-20 text-[11px] text-zinc-500">{entry.ts}</span>
                    <span className="mono-data w-32 text-[11px] text-zinc-400">{entry.actor}</span>
                    <span className="text-xs text-zinc-300">{entry.action}</span>
                    <span className="mono-data ml-auto text-[10px] text-zinc-600">{entry.hash}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {exportPayload ? (
            <section className="sentinel-v2-panel p-4 sm:p-5">
              <div className="sentinel-v2-eyebrow">Export Payload Preview</div>
              <pre className="mono-data mt-3 overflow-x-auto rounded-lg border border-zinc-800/80 bg-zinc-950/80 p-3 text-[11px] text-zinc-300">{exportPayload}</pre>
            </section>
          ) : null}
        </div>
      </div>
    </CommandShell>
  );
}
