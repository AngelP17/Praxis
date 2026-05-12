"use client";

import { motion } from "framer-motion";
import { Hash, Clock, User, Lightning, ArrowUpRight, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import type { QueueTicket } from "@/lib/hooks/use-command-feed";

export function IncidentDetailPanel({
  ticket,
  linkedIncident,
  mode = "live",
  panelState = "ready",
  message,
}: {
  ticket?: QueueTicket;
  linkedIncident?: { id: string; title: string; rootCause: string; ticketCount: number; confidence: number };
  mode?: "live" | "demo" | "stale";
  panelState?: "loading" | "ready" | "error";
  message?: string;
}) {
  if (panelState === "loading") {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-800/80" />
        <div className="mt-5 grid grid-flow-dense gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
          ))}
        </div>
      </div>
    );
  }

  if (panelState === "error") {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-rose-300">Incident Detail</div>
        <p className="mt-3 text-sm text-rose-100">{message || "Incident detail panel failed to load."}</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Case Inspector</div>
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <WarningCircle className="h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-500">No ticket selected. Choose a case from the signal queue.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={ticket.ticketId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="legacy-card rounded-[1.5rem] p-5 sm:p-6"
    >
      {(mode === "demo" || mode === "stale") && (
        <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {mode === "demo" ? "Operations snapshot active" : "Using stale live detail"}
        </div>
      )}
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-4">
        <div>
          <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-amber-300">Case Inspector</div>
          <h2 className="mt-2 text-lg font-semibold text-white">{ticket.title}</h2>
        </div>
        <Link
          href={`/tickets/${ticket.ticketId}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-amber-400/30 hover:scale-105 transition-transform duration-500"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Open
        </Link>
      </div>

      <div className="mt-5 grid grid-flow-dense gap-3 sm:grid-cols-2">
        <MetricTile icon={Hash} label="Ticket ID" value={ticket.ticketId} />
        <MetricTile icon={User} label="Assignee" value={ticket.assignee} />
        <MetricTile icon={Clock} label="Days Open" value={`${ticket.daysOpen}d`} />
        <MetricTile icon={Lightning} label="Decision Score" value={ticket.score.toFixed(0)} />
      </div>

      {linkedIncident && (
        <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/[0.04] p-4">
          <div className="text-[10px] uppercase tracking-wider text-amber-400/80">Linked Incident</div>
          <p className="mt-1 text-sm font-medium text-zinc-200">{linkedIncident.title}</p>
          <div className="mt-2 flex gap-4 text-[11px] text-zinc-500">
            <span className="mono-data">{linkedIncident.id}</span>
            <span>{linkedIncident.ticketCount} tickets</span>
            <span>{(linkedIncident.confidence * 100).toFixed(0)}% confidence</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge text={ticket.status} />
        <Badge text={ticket.priority} />
        <Badge text={ticket.category} />
      </div>
    </motion.div>
  );
}

function MetricTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
      <Icon className="h-4 w-4 text-zinc-600" />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-zinc-600">{label}</div>
        <div className="mono-data text-sm text-zinc-200">{value}</div>
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-400">{text}</span>
  );
}
