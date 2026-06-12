"use client";

import { useState } from "react";
import { Clock, ArrowCounterClockwise, CheckCircle, XCircle, UserCircle } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

export type ReplayEvent = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  status: "success" | "failure" | "pending" | "override";
  details?: string;
};

export function ReplayTimeline({ events }: { events: ReplayEvent[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  function statusIcon(status: ReplayEvent["status"]) {
    switch (status) {
      case "success": return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />;
      case "failure": return <XCircle className="h-3.5 w-3.5 text-rose-400" />;
      case "override": return <UserCircle className="h-3.5 w-3.5 text-violet-400" />;
      default: return <Clock className="h-3.5 w-3.5 text-slate-400" />;
    }
  }

  function statusDot(status: ReplayEvent["status"]) {
    switch (status) {
      case "success": return "bg-emerald-500";
      case "failure": return "bg-rose-500";
      case "override": return "bg-violet-500";
      default: return "bg-slate-500";
    }
  }

  return (
    <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
      <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
        <ArrowCounterClockwise className="h-4 w-4 text-violet-300" />
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Replay Timeline</div>
        <div className="mono-data ml-auto text-[11px] text-zinc-600">{sorted.length} events</div>
      </div>

      <div className="mt-5 relative">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-800" />
        <div className="space-y-4">
          <AnimatePresence>
            {sorted.map((event, index) => {
              const isExpanded = expandedId === event.id;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30, delay: index * 0.03 }}
                  className="relative pl-8"
                >
                  <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 border-zinc-900 ${statusDot(event.status)}`} />
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    className="w-full text-left hover:scale-105 transition-transform duration-500"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-200">{event.action}</span>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(event.status)}
                        <span className="mono-data text-[10px] text-zinc-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                      <span>{event.actor}</span>
                    </div>
                    <AnimatePresence>
                      {isExpanded && event.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 border border-zinc-800 bg-zinc-950/50 p-3 text-xs text-zinc-400 leading-relaxed">
                            {event.details}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
