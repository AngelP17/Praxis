"use client";

import { motion } from "motion/react";
import { Brain, CheckCircle, ShieldWarning, Info } from "@phosphor-icons/react";

export function DecisionExplanationPanel({
  decision,
  mode = "live",
  panelState = "ready",
  message,
}: {
  decision?: {
    priority_score?: number;
    confidence_score?: number;
    root_cause_hypothesis?: string;
    sla_risk_score?: number;
    actionability_score?: number;
  } | null;
  mode?: "live" | "demo" | "stale";
  panelState?: "loading" | "ready" | "error";
  message?: string;
}) {
  if (panelState === "loading") {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="h-4 w-36 animate-pulse rounded bg-zinc-800/80" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/50" />
          ))}
        </div>
      </div>
    );
  }

  if (panelState === "error") {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-rose-300">Praxis Decision</div>
        <p className="mt-3 text-sm text-rose-100">{message || "Decision explanation failed to load."}</p>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Praxis Decision</div>
        <p className="mt-4 text-sm text-zinc-500">No decision record available for this case.</p>
      </div>
    );
  }

  const metrics = [
    { label: "Priority", value: decision.priority_score ?? 0, icon: ShieldWarning, color: "#715BFF" },
    { label: "Confidence", value: decision.confidence_score ?? 0, icon: CheckCircle, color: "#22c55e" },
    { label: "SLA Risk", value: decision.sla_risk_score ?? 0, icon: Info, color: "#f43f5e" },
    { label: "Actionability", value: decision.actionability_score ?? 0, icon: Brain, color: "#715BFF" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.05 }}
      className="legacy-card rounded-[1.5rem] p-5 sm:p-6"
    >
      {(mode === "demo" || mode === "stale") && (
        <div className="mb-4 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
          {mode === "demo" ? "Operations snapshot active" : "Using stale decision context"}
        </div>
      )}
      <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
        <Brain className="h-4 w-4 text-violet-300" />
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Praxis Decision</div>
      </div>

      <div className="mt-5 space-y-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          const pct = Math.min(100, Math.max(0, m.value));
          return (
            <div key={m.label}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                  <span className="text-zinc-300">{m.label}</span>
                </div>
                <span className="mono-data text-zinc-400">{m.value.toFixed(1)}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: m.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {decision.root_cause_hypothesis && (
        <div className="mt-5 rounded-xl border border-violet-500/10 bg-violet-500/[0.04] p-4">
          <div className="text-[10px] uppercase tracking-wider text-violet-400/80">Root Cause</div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{decision.root_cause_hypothesis}</p>
        </div>
      )}
    </motion.div>
  );
}
