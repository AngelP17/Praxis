"use client";

import { FileText, TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { getPackById } from "@/lib/praxis-api";
import { getWorkflowRun } from "@/lib/praxis-workflow";

interface ValueCasePanelProps {
  packId?: string;
}

interface Assumption {
  label: string;
  value: string;
  impact: "high" | "medium" | "low";
}

function ImpactIcon({ impact }: { impact: Assumption["impact"] }) {
  if (impact === "high") return <TrendUp className="h-3 w-3 text-[var(--praxis-crit)]" />;
  if (impact === "medium") return <Minus className="h-3 w-3 text-[var(--praxis-muted)]" />;
  return <TrendDown className="h-3 w-3 text-[var(--praxis-mint)]" />;
}

export function ValueCasePanel({ packId = "manufacturing-printer-gpo" }: ValueCasePanelProps) {
  const pack = getPackById(packId);
  const run = getWorkflowRun(packId);
  const assumptions: Assumption[] = run.assumptions.map((item, index) => ({
    ...item,
    impact: index === 0 || index === 1 || index === 3 ? "high" : "medium",
  }));

  if (!pack) return null;

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <FileText className="h-10 w-10 text-[var(--praxis-mint)]" weight="duotone" />
        <div className="mt-10 font-display text-7xl text-[var(--praxis-mint)]">{pack.annualValue}</div>
        <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          estimated annual value
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Confidence</div>
          <div className="font-display text-xl text-[var(--praxis-violet)]">{pack.valueConfidence.toFixed(2)}</div>
        </div>
        <p className="mt-7 text-sm leading-6 text-[var(--praxis-muted)]">
          Based on {assumptions[0].value} monthly incidents, triage reduction, labor cost, and operational delay avoidance.
        </p>
        <div className="mt-4 border-t border-[var(--praxis-line)] pt-4">
          <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Primary driver</div>
          <div className="mt-1 text-sm">{pack.primaryValueDriver}</div>
        </div>
      </article>
      <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Assumptions</div>
        <div className="mt-6 grid grid-flow-dense gap-3 md:grid-cols-2">
          {assumptions.map((a) => (
            <div key={a.label} className="flex items-end justify-between border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                  <ImpactIcon impact={a.impact} />
                  {a.label}
                </div>
                <div className="mt-2 font-display text-3xl">{a.value}</div>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
