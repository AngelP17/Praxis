"use client";

import { Brain, CheckCircle, ShieldWarning, Info } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export function DecisionExplanationPanel({
  decision,
}: {
  decision?: {
    priority_score?: number;
    confidence_score?: number;
    root_cause_hypothesis?: string;
    sla_risk_score?: number;
    actionability_score?: number;
    recurrence_score?: number;
  } | null;
}) {
  if (!decision) {
    return (
      <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6">
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Decision Intelligence</div>
        <div className="mt-8 text-center text-sm text-zinc-500">No decision record available for this case.</div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Priority",
      value: decision.priority_score ?? 0,
      max: 100,
      icon: ShieldWarning,
      color: "#f59e0b",
    },
    {
      label: "Confidence",
      value: decision.confidence_score ?? 0,
      max: 100,
      icon: CheckCircle,
      color: "#22c55e",
    },
    {
      label: "SLA Risk",
      value: decision.sla_risk_score ?? 0,
      max: 100,
      icon: Info,
      color: "#f43f5e",
    },
    {
      label: "Actionability",
      value: decision.actionability_score ?? 0,
      max: 100,
      icon: Brain,
      color: "#06b6d4",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 28, delay: 0.05 }}
      className="legacy-card rounded-[1.5rem] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 border-b border-zinc-800/70 pb-4">
        <Brain className="h-4 w-4 text-amber-300" />
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Decision Intelligence</div>
      </div>

      <div className="mt-5 space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const pct = Math.min(100, Math.max(0, (metric.value / metric.max) * 100));
          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: metric.color }} />
                  <span className="text-zinc-300">{metric.label}</span>
                </div>
                <span className="mono-data text-zinc-400">{metric.value.toFixed(1)}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {decision.root_cause_hypothesis && (
        <div className="mt-5 rounded-xl border border-amber-500/10 bg-amber-500/[0.04] p-4">
          <div className="text-[10px] uppercase tracking-wider text-amber-400/80">Root Cause</div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{decision.root_cause_hypothesis}</p>
        </div>
      )}
    </motion.div>
  );
}
