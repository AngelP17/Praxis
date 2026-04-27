"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CaretRight, Clock } from "@phosphor-icons/react";
import type { QueueTicket } from "@/lib/hooks/use-command-feed";

const priorityPalette: Record<string, string> = {
  Critical: "#f43f5e",
  High: "#f97316",
  Medium: "#f59e0b",
  Low: "#71717a",
};

const statusPalette: Record<string, string> = {
  Closed: "#22c55e",
  Resolved: "#22c55e",
  "In Progress": "#f59e0b",
  "Waiting for Info": "#f59e0b",
  Open: "#f97316",
};

export function SignalQueue({
  tickets,
  selectedId,
  onSelect,
  searchTerm,
}: {
  tickets: QueueTicket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchTerm: string;
}) {
  return (
    <div className="ops-card rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-zinc-800/50 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Signal Queue</div>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-50">Ranked events</h2>
          <p className="mt-1 text-sm text-zinc-400">Source, asset, and decision score for each live signal.</p>
        </div>
        <span className="mono-data text-[11px] uppercase tracking-[0.22em] text-amber-300">{tickets.length} visible</span>
      </div>

      <div className="mt-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {tickets.map((ticket, index) => (
            <motion.button
              key={ticket.ticketId}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30, delay: index * 0.02 }}
              type="button"
              onClick={() => onSelect(ticket.ticketId)}
              className={`block w-full rounded-[1.1rem] border px-4 py-4 text-left transition ${
                selectedId === ticket.ticketId
                  ? "border-amber-400/30 bg-amber-500/[0.06]"
                  : "border-zinc-800/60 bg-black/20 hover:border-amber-400/20 hover:bg-amber-500/[0.03]"
              }`}
            >
              <div className="grid gap-4 xl:grid-cols-[48px,minmax(0,1fr),124px] xl:items-center">
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
