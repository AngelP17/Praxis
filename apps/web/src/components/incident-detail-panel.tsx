"use client";

import { Warning, Clock, User, Hash, Lightning } from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { Ticket } from "@/types";

export function IncidentDetailPanel({ ticket }: { ticket: Ticket | null }) {
  if (!ticket) {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Incident Detail</div>
        <div className="mt-8 text-center text-sm text-zinc-500">Select a ticket to inspect details.</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="legacy-card rounded-[1.5rem] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-4">
        <div>
          <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Incident Detail</div>
          <h2 className="mt-2 text-lg font-semibold text-white">{ticket.title}</h2>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
            ticket.priority_raw.toLowerCase() === "critical"
              ? "border-rose-500/20 bg-rose-500/10 text-rose-200"
              : ticket.priority_raw.toLowerCase() === "high"
              ? "border-violet-500/20 bg-violet-500/10 text-violet-200"
              : "border-violet-500/20 bg-violet-500/10 text-violet-200"
          }`}
        >
          {ticket.priority_raw}
        </span>
      </div>

      <div className="mt-5 grid grid-flow-dense gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
          <Hash className="h-4 w-4 text-zinc-600" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600">Ticket ID</div>
            <div className="mono-data text-sm text-zinc-200">{ticket.ticket_id}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
          <User className="h-4 w-4 text-zinc-600" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600">Assignee</div>
            <div className="text-sm text-zinc-200">{ticket.assignee || "Unassigned"}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
          <Clock className="h-4 w-4 text-zinc-600" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600">Days Open</div>
            <div className="mono-data text-sm text-zinc-200">{ticket.days_open}d</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
          <Lightning className="h-4 w-4 text-zinc-600" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600">Priority Score</div>
            <div className="mono-data text-sm text-zinc-200">{ticket.priority_score ?? "--"}</div>
          </div>
        </div>
      </div>

      {ticket.root_cause_hypothesis && (
        <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-600">
            <Warning className="h-3.5 w-3.5" />
            Root Cause Hypothesis
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{ticket.root_cause_hypothesis}</p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-400">
          {ticket.status}
        </span>
        <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-400">
          {ticket.category || "Unknown category"}
        </span>
        {ticket.site && (
          <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-400">
            {ticket.site}
          </span>
        )}
      </div>
    </motion.div>
  );
}
