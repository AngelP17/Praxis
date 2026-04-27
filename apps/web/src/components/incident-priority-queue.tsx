"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretRight, Warning, Clock } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import type { Ticket } from "@/types";

function priorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "critical": return "#f43f5e";
    case "high": return "#f97316";
    case "medium": return "#f59e0b";
    default: return "#71717a";
  }
}

function priorityBorder(priority: string) {
  switch (priority.toLowerCase()) {
    case "critical": return "border-rose-500/20 hover:border-rose-500/40";
    case "high": return "border-orange-500/20 hover:border-orange-500/40";
    case "medium": return "border-amber-500/20 hover:border-amber-500/40";
    default: return "border-zinc-800 hover:border-zinc-700";
  }
}

export function IncidentPriorityQueue({
  tickets,
  selectedId,
  onSelect,
}: {
  tickets: Ticket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "critical" | "active">("all");

  const filtered = tickets.filter((t) => {
    if (filter === "critical") return t.priority_raw.toLowerCase() === "critical";
    if (filter === "active") return t.status !== "Closed" && t.status !== "Resolved";
    return true;
  });

  const sorted = [...filtered].sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));

  return (
    <div className="ops-card rounded-[1.5rem] p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
        <div>
          <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Priority Queue</div>
          <div className="mt-1 text-lg font-semibold text-white">{sorted.length} cases ranked</div>
        </div>
        <div className="flex gap-1">
          {(["all", "critical", "active"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                filter === f
                  ? "bg-amber-500/15 text-amber-200 border border-amber-500/20"
                  : "text-zinc-500 hover:text-zinc-300 border border-transparent"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2 max-h-[480px] overflow-auto pr-1">
        <AnimatePresence mode="popLayout">
          {sorted.map((ticket) => {
            const isSelected = selectedId === ticket.ticket_id;
            const pColor = priorityColor(ticket.priority_raw);
            return (
              <motion.div
                key={ticket.ticket_id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(ticket.ticket_id)}
                  className={`w-full text-left rounded-[1.1rem] border bg-zinc-950/50 p-3.5 transition ${
                    isSelected ? "border-amber-500/30 bg-amber-500/[0.06]" : priorityBorder(ticket.priority_raw)
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pColor }} />
                      <span className="mono-data text-[11px] text-zinc-500">{ticket.ticket_id}</span>
                    </div>
                    <span
                      className="mono-data text-[11px] font-medium"
                      style={{ color: pColor }}
                    >
                      {ticket.priority_raw}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-zinc-200 truncate">{ticket.title}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-500">
                    <span>{ticket.assignee || "Unassigned"}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ticket.days_open}d
                    </span>
                    <span className="mono-data">{ticket.status}</span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sorted.length === 0 && (
          <div className="py-8 text-center text-sm text-zinc-500">No tickets match the current filter.</div>
        )}
      </div>

      <div className="mt-4 border-t border-zinc-800/50 pt-4">
        <Link
          href="/tickets/new"
          className="flex items-center justify-between rounded-[1.1rem] border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-300 transition hover:border-amber-500/20 hover:bg-zinc-900/60"
        >
          <span>Create new ticket</span>
          <CaretRight className="h-4 w-4 text-zinc-500" />
        </Link>
      </div>
    </div>
  );
}
