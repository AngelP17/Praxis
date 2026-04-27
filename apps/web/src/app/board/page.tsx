"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  SquaresFour,
  Plus,
  Scan,
  Shield,
  Ticket,
  Lightning,
} from "@phosphor-icons/react";

import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { MotionPriorityStack } from "@/components/motion-priority-stack";
import type { Ticket as TicketType } from "@/types";

type BoardColumn = {
  key: string;
  label: string;
  description: string;
  accent: string;
  tone: string;
};

const columns: BoardColumn[] = [
  {
    key: "TO DO",
    label: "To Do",
    description: "Fresh work requiring routing, triage, or intake detail.",
    accent: "#71717a",
    tone: "border-zinc-700/60 bg-zinc-900/45 text-zinc-300",
  },
  {
    key: "IN PROGRESS",
    label: "In Progress",
    description: "Assigned cases with active operator work underway.",
    accent: "#f59e0b",
    tone: "border-amber-500/20 bg-amber-500/8 text-amber-200",
  },
  {
    key: "IN REVIEW",
    label: "In Review",
    description: "Awaiting customer confirmation or final validation.",
    accent: "#64748b",
    tone: "border-slate-500/20 bg-slate-500/8 text-slate-200",
  },
  {
    key: "DONE",
    label: "Done",
    description: "Resolved and closed work retained for historical context.",
    accent: "#22c55e",
    tone: "border-emerald-500/20 bg-emerald-500/8 text-emerald-200",
  },
];

function statusToColumn(status: string) {
  switch (status) {
    case "In Progress":
      return "IN PROGRESS";
    case "Waiting for Info":
    case "Waiting Info":
      return "IN REVIEW";
    case "Resolved":
    case "Closed":
      return "DONE";
    default:
      return "TO DO";
  }
}

function priorityTone(priority: string) {
  switch (priority.toLowerCase()) {
    case "critical":
      return "border-rose-500/20 bg-rose-500/10 text-rose-200";
    case "high":
      return "border-orange-500/20 bg-orange-500/10 text-orange-200";
    case "medium":
      return "border-amber-500/20 bg-amber-500/10 text-amber-200";
    default:
      return "border-zinc-700/60 bg-zinc-800/70 text-zinc-200";
  }
}

export default function BoardPage() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setStatus("loading");
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${base}/api/tickets?limit=200`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = (await response.json()) as TicketType[];
      setTickets(data);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load board");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  if (status === "loading") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Board" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  if (status === "error") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Board" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Board unavailable" message={errorMessage || "The live board could not load."} onRetry={loadTickets} />
        </div>
      </CommandShell>
    );
  }

  const grouped = columns.reduce<Record<string, TicketType[]>>((acc, column) => {
    acc[column.key] = [];
    return acc;
  }, {});

  tickets.forEach((ticket) => {
    grouped[statusToColumn(ticket.status)].push(ticket);
  });

  const openCount = tickets.filter((t) => !["Resolved", "Closed"].includes(t.status)).length;
  const activeCount = grouped["IN PROGRESS"].length;
  const reviewCount = grouped["IN REVIEW"].length;
  const throughputCount = grouped["DONE"].length;

  const stats = [
    { label: "Open Queue", value: openCount, note: "Cases requiring active handling", icon: Ticket, color: "#f59e0b" },
    { label: "In Progress", value: activeCount, note: "Cases in execution now", icon: SquaresFour, color: "#f59e0b" },
    { label: "Awaiting Review", value: reviewCount, note: "Waiting on detail or validation", icon: Scan, color: "#f59e0b" },
    { label: "Throughput", value: throughputCount, note: "Resolved or closed work", icon: ArrowRight, color: "#22c55e" },
  ];

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Board" />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="ops-glass rounded-[2rem] overflow-hidden">
            {/* Header */}
            <div className="border-b border-zinc-800/70 bg-black/20 px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="max-w-4xl">
                  <div className="mono-data text-[11px] uppercase tracking-[0.32em] text-amber-300">
                    Workflow Tracking
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Operational board view
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Signal ingestion, decision evaluation, and workflow state across the operational pipeline.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/tickets/new" className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400">
                    <Plus size={16} />
                    New Ticket
                  </Link>
                  <Link href="/command-center" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-amber-500/30 hover:bg-amber-500/10">
                    <Scan size={16} />
                    Command Center
                  </Link>
                  <Link href="/reports" className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-400">
                    <Lightning size={16} />
                    Reports
                  </Link>
                  <Link href="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/70 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-amber-500/30 hover:bg-amber-500/10">
                    <Shield size={16} />
                    Admin
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 border-b border-zinc-800/70 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-8">
              <MotionPriorityStack items={stats} />
            </div>

            {/* Board */}
            <div className="px-5 py-5 sm:px-8">
              {tickets.length === 0 ? (
                <EmptyState title="Empty queue" message="The API returned no tickets. The board is clear." />
              ) : (
                <div className="grid gap-5 xl:grid-cols-4">
                  {columns.map((column) => (
                    <section key={column.key} className="ops-card rounded-[1.5rem] p-4 sm:p-5">
                      <div className="border-b border-zinc-800/70 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.accent }} />
                              <h2 className="text-lg font-semibold text-white">{column.label}</h2>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-zinc-500">{column.description}</p>
                          </div>
                          <div className={`mono-data rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${column.tone}`}>
                            {grouped[column.key].length}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {grouped[column.key].length === 0 ? (
                          <div className="rounded-[1.15rem] border border-dashed border-zinc-800 bg-zinc-950/45 px-4 py-10 text-center text-sm text-zinc-600">
                            No tickets in this lane.
                          </div>
                        ) : (
                          grouped[column.key].map((ticket) => (
                            <Link
                              key={ticket.ticket_id}
                              href={`/tickets/${ticket.ticket_id}`}
                              className="block rounded-[1.15rem] border border-zinc-800 bg-zinc-950/60 p-4 transition hover:border-amber-500/20 hover:bg-zinc-900/80"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="mono-data text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                                  {ticket.ticket_id}
                                </div>
                                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${priorityTone(ticket.priority_raw)}`}>
                                  {ticket.priority_raw}
                                </span>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-zinc-100">{ticket.title}</p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-1 text-[11px] text-zinc-400">
                                  {ticket.assignee || "Unassigned"}
                                </span>
                                <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-1 text-[11px] text-zinc-400">
                                  {ticket.status}
                                </span>
                                <span className="mono-data rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-1 text-[11px] text-zinc-500">
                                  {ticket.days_open}d open
                                </span>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CommandShell>
  );
}
