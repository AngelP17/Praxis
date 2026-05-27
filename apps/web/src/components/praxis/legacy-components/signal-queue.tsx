"use client";

import { motion, AnimatePresence } from "motion/react";
import { CaretRight, Clock } from "@phosphor-icons/react";
import type { QueueTicket } from "@/lib/hooks/use-command-feed";

const priorityPalette: Record<string, string> = {
  Critical: "#f43f5e",
  High: "#715BFF",
  Medium: "#715BFF",
  Low: "#71717a",
};

const statusPalette: Record<string, string> = {
  Closed: "#22c55e",
  Resolved: "#22c55e",
  "In Progress": "#715BFF",
  "Waiting for Info": "#715BFF",
  Open: "#715BFF",
};

export function SignalQueue({
  tickets,
  selectedId,
  onSelect,
  searchTerm,
  mode = "live",
  panelState = "ready",
  message,
}: {
  tickets: QueueTicket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchTerm: string;
  mode?: "live" | "demo" | "stale";
  panelState?: "loading" | "ready" | "error";
  message?: string;
}) {
  if (panelState === "loading") {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="h-4 w-28 animate-pulse rounded bg-zinc-800/80" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
          ))}
        </div>
      </div>
    );
  }

  if (panelState === "error") {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-rose-300">Signal Queue</div>
        <p className="mt-3 text-sm text-rose-100">{message || "Signal queue failed to load."}</p>
      </div>
    );
  }

  return (
    <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
      <div className="flex flex-col gap-3 border-b border-zinc-800/50 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Signal Queue</div>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-50">Ranked events</h2>
          <p className="mt-1 text-sm text-zinc-400">Source, asset, and decision score for each live signal.</p>
        </div>
        <span className="mono-data text-[11px] uppercase tracking-[0.22em] text-violet-300">{tickets.length} visible</span>
      </div>

      {(mode === "demo" || mode === "stale") && (
        <div className="mt-3 rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
          {mode === "demo" ? "Operations snapshot active" : "Live feed is partially stale"}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {tickets.map((ticket, index) => (
            <motion.button
              key={ticket.ticketId}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.02 }}
              type="button"
              onClick={() => onSelect(ticket.ticketId)}
              className={`block w-full rounded-[1.1rem] border px-4 py-4 text-left transition ${
                selectedId === ticket.ticketId
                  ? "border-violet-400/30 bg-violet-500/[0.06]"
                  : "border-zinc-800/60 bg-black/20 hover:border-violet-400/20 hover:bg-violet-500/[0.03]"
              }`}
            >
              <div className="grid grid-flow-dense gap-4 xl:grid-cols-[48px,minmax(0,1fr),124px] xl:items-center">
                <div className="mono-data flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-sm text-zinc-300">
                  #{index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono-data text-[11px] uppercase tracking-[0.22em] text-zinc-500">{ticket.ticketId}</span>
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-100">{ticket.title}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
                    <span>{ticket.category}</span>
                    <span>{ticket.assignee}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ticket.daysOpen}d</span>
                  </div>
                </div>
                <div className="text-left xl:text-right">
                  <div className="mono-data text-3xl font-bold tracking-tight text-zinc-50">{ticket.score.toFixed(0)}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
                    Score <CaretRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {tickets.length === 0 && (
          <EmptyState
            title="No signals match"
            message={searchTerm ? "No tickets matched your search." : "The signal queue is clear right now."}
          />
        )}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = priorityPalette[priority] ?? "#71717a";
  return (
    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ color, backgroundColor: `${color}18` }}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = statusPalette[status] ?? "#52525b";
  return (
    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ color, backgroundColor: `${color}18` }}>
      {status}
    </span>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-zinc-800 bg-zinc-950/30 px-4 py-10 text-center">
      <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">{title}</div>
      <p className="mt-2 text-sm text-zinc-400">{message}</p>
    </div>
  );
}
