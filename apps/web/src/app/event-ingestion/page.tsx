"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Pulse, UploadSimple } from "@phosphor-icons/react";

import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/client-api";
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

export default function EventIngestionPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [source, setSource] = useState("machine_telemetry");
  const [eventType, setEventType] = useState("vibration_alert");
  const [severity, setSeverity] = useState("high");
  const [site, setSite] = useState("Plant-A");

  const loadEvents = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const rows = await fetchJsonWithTimeout<EventRow[]>("/api/events");
      const validRows = Array.isArray(rows) ? rows : [];
      setEvents(validRows.length > 0 ? validRows : DEMO_EVENT_STREAM);
      setStatus("ready");
      if (!Array.isArray(rows)) {
        setNotice(null);
      }
    } catch (error) {
      setEvents(DEMO_EVENT_STREAM);
      setStatus("ready");
      setNotice(null);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  async function ingest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const payload = {
        source,
        event_type: eventType,
        severity,
        site,
        asset: { asset_id: "press-line-3", site, line: "line-03" },
        payload: {
          sensor: "accelerometer",
          vibration_rms: 12.4,
          operator_ticket_id: "INC-4821",
          message: "vibration threshold crossed",
        },
      };
      const result = await postJsonWithTimeout<{ event_id?: string }>("/api/events/ingest", payload);
      setNotice(`Event ingested: ${result.event_id || "ok"}`);
      await loadEvents();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ingestion failed.");
    }
  }

  if (status === "loading") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Ingestion" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Ingestion" />
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-4">
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-[0.95fr,1.05fr] grid-flow-dense py-20">
            <form onSubmit={ingest} className="praxis-v2-panel-strong p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="praxis-v2-eyebrow">Event Ingestion</div>
                  <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Real-time Signal Intake</h1>
                </div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/70 bg-zinc-900/70 text-amber-200">
                  <UploadSimple size={16} />
                </div>
              </div>
              <p className="mt-2 text-sm text-zinc-400">Submit synthetic operations events directly into <span className="mono-data">/api/events/ingest</span>.</p>
              {notice ? <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">{notice}</div> : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 grid-flow-dense">
                <Field label="Source" value={source} onChange={setSource} />
                <Field label="Event Type" value={eventType} onChange={setEventType} />
                <Field label="Severity" value={severity} onChange={setSeverity} />
                <Field label="Site" value={site} onChange={setSite} />
              </div>
              <button type="submit" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400 hover:scale-105 transition-transform duration-500">
                <Pulse size={14} />
                Ingest Event
              </button>
            </form>

            <section className="praxis-v2-panel p-5 sm:p-6 py-20">
              <div className="praxis-v2-eyebrow">Live Event Feed</div>
              <div className="mt-3 space-y-2">
                {events.length === 0 ? (
                  <EmptyState title="No events yet" message="Ingest events to populate the live stream." />
                ) : (
                  events.slice(0, 15).map((row) => (
                    <div key={row.event_id} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="mono-data text-xs text-zinc-100">{row.event_id}</span>
                        <span className="mono-data text-[11px] text-zinc-500">{row.occurred_at}</span>
                      </div>
                      <div className="mt-1 text-sm text-zinc-200">{row.event_type}</div>
                      <div className="mt-1 text-xs text-zinc-500">{row.source} · {row.severity} · {row.site || "unknown-site"}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </section>
        </div>
      </div>
    </CommandShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      <div className="mb-1 text-xs text-zinc-400">{label}</div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 px-3 text-sm text-zinc-100 outline-none transition focus:border-amber-400/45"
      />
    </label>
  );
}
