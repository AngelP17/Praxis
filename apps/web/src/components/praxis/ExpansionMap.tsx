"use client";

import { MapTrifold, GitBranch, ArrowRight } from "@phosphor-icons/react";
import { getPackById } from "@/lib/praxis-api";
import { getWorkflowRun } from "@/lib/praxis-workflow";

interface ExpansionMapProps {
  packId?: string;
}

interface AdjacentCase {
  label: string;
  score: number;
  rationale: string;
}

export function ExpansionMap({ packId = "manufacturing-printer-gpo" }: ExpansionMapProps) {
  const pack = getPackById(packId);
  const run = getWorkflowRun(packId);
  const adjacentCases: AdjacentCase[] = run.expansion.map((item, index) => ({
    label: item.label,
    score: Number(item.score),
    rationale: index < 3 ? "Shared data and stakeholder overlap" : "Reusable implementation path",
  }));

  if (!pack) return null;

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      <article className="lg:col-span-5 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <MapTrifold className="h-10 w-10 text-[var(--praxis-violet)]" weight="duotone" />
        <h4 className="mt-10 font-display text-5xl font-medium leading-none">{pack.name}</h4>
        <p className="mt-5 text-sm leading-6 text-[var(--praxis-muted)]">
          Initial proof path for {pack.buyer.toLowerCase()} operations, {pack.technicalPersona.toLowerCase()} management, and executive value narrative.
        </p>
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Current value</span>
            <span className="font-display text-2xl text-[var(--praxis-mint)]">{pack.annualValue}</span>
          </div>
          <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Expansion potential</span>
            <span className="font-display text-2xl text-[var(--praxis-violet)]">
              {adjacentCases.length} cases
            </span>
          </div>
        </div>
      </article>
      <article className="lg:col-span-7 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <GitBranch className="h-4 w-4" />
          Adjacent use cases
        </div>
        <div className="mt-6 space-y-3">
          {adjacentCases.map((item, index) => (
            <div
              key={item.label}
              className="group grid grid-flow-dense grid-cols-[1fr_auto] gap-4 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 transition-colors hover:border-[var(--praxis-violet)]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-[var(--praxis-violet)]">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="mt-1 text-xs text-[var(--praxis-muted)]">{item.rationale}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl text-[var(--praxis-mint)]">{item.score.toFixed(2)}</span>
                <ArrowRight className="h-4 w-4 text-[var(--praxis-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
