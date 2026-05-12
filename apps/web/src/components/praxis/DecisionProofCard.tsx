"use client";

import { ShieldCheck, Warning, GitCommit } from "@phosphor-icons/react";
import { getPackById, formatPercent } from "@/lib/praxis-api";

interface DecisionProofCardProps {
  packId?: string;
}

export function DecisionProofCard({ packId = "manufacturing-printer-gpo" }: DecisionProofCardProps) {
  const pack = getPackById(packId);
  if (!pack) return null;

  const weights = [
    { label: "operational severity", value: 82, weight: 16 },
    { label: "business criticality", value: 91, weight: 14 },
    { label: "customer impact", value: 74, weight: 13 },
    { label: "recurrence risk", value: 68, weight: 12 },
    { label: "evidence trust", value: Math.round(pack.evidenceTrust * 100), weight: 5 },
  ];

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <ShieldCheck className="h-4 w-4 text-[var(--praxis-violet)]" />
          Praxis priority
        </div>
        <div className="mt-5 font-display text-8xl font-medium text-[var(--praxis-violet)]">
          {pack.priorityScore.toFixed(2)}
        </div>
        <p className="mt-5 max-w-md text-sm leading-6 text-[var(--praxis-muted)]">
          {pack.rootCause.replace(/_/g, " ")} is delaying operations and needs assisted human-approved routing.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="border border-[var(--praxis-line)] p-4">
            <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Evidence trust</div>
            <div className="mt-2 font-display text-4xl text-[var(--praxis-mint)]">{pack.evidenceTrust.toFixed(2)}</div>
          </div>
          <div className="border border-[var(--praxis-line)] p-4">
            <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Mode</div>
            <div className="mt-2 font-display text-4xl">Human</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-crit)]">
          <Warning className="h-3 w-3" />
          Review required
        </div>
      </article>
      <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Rationale weights</div>
        <div className="mt-6 space-y-4">
          {weights.map((w) => (
            <div key={w.label}>
              <div className="mb-2 grid grid-cols-[1fr_auto_auto] gap-4 font-mono text-[10px] uppercase tracking-[0.08em]">
                <span className="text-[var(--praxis-muted)]">{w.label}</span>
                <span>{w.value}</span>
                <span className="text-[var(--praxis-muted)]">w {w.weight}</span>
              </div>
              <div className="h-2 bg-[var(--praxis-line)]">
                <div className="h-full bg-[var(--praxis-violet)]" style={{ width: `${w.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
            <GitCommit className="h-3 w-3" />
            Root cause
          </div>
          <p className="mt-3 text-sm text-[var(--praxis-bone)]">{pack.rootCause.replace(/_/g, " ")}</p>
        </div>
      </article>
    </div>
  );
}
