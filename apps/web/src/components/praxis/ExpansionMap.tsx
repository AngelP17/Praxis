"use client";

import { MapTrifold, GitBranch, ArrowRight } from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { formatCurrency } from "@/lib/praxis-client";

interface ExpansionMapProps {
  packId?: string;
}

export function ExpansionMap({ packId = "manufacturing-printer-gpo" }: ExpansionMapProps) {
  const { proof } = useProof(packId);
  const { packs } = useSolutionPacks();
  const pack = packs.find((p) => p.id === packId);

  if (!proof) return null;

  const adjacentCases = (proof.expansion ?? []).map((item, index) => ({
    name: item.name,
    score: item.expansion_score,
    rationale: index % 2 === 0 ? "Shared data model and stakeholder overlap" : "Reusable implementation path",
  }));

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      <article className="lg:col-span-5 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <MapTrifold className="h-10 w-10 text-[var(--praxis-violet)]" weight="duotone" />
        <h4 className="mt-10 font-display text-5xl font-medium leading-none">{pack?.name ?? packId}</h4>
        <p className="mt-5 text-sm leading-6 text-[var(--praxis-muted)]">
          Initial proof path for {(pack?.buyer_persona ?? "operator").toLowerCase()} operations and executive value narrative.
        </p>
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Current value</span>
            <span className="font-display text-2xl text-[var(--praxis-mint)]">{formatCurrency(proof.value_case.estimated_annual_value)}/yr</span>
          </div>
          <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Expansion potential</span>
            <span className="font-display text-2xl text-[var(--praxis-violet)]">{adjacentCases.length} cases</span>
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
            <div key={item.name} className="group grid grid-flow-dense grid-cols-[1fr_auto] gap-4 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 transition-colors hover:border-[var(--praxis-violet)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-[var(--praxis-violet)]">#{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm">{item.name}</span>
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
