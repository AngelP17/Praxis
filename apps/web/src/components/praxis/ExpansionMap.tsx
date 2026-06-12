"use client";

import { useSearchParams } from "next/navigation";
import { MapTrifold, GitBranch, ArrowRight } from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { formatCurrency } from "@/lib/praxis-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { WorkbenchShell, TopbarTitle, Pill } from "./workbench/WorkbenchShell";

export function ExpansionMap({ packId: propPackId }: { packId?: string }) {
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack") ?? propPackId ?? "manufacturing-printer-gpo";
  const { proof, loading } = useProof(packId);
  const { packs } = useSolutionPacks();
  const pack = packs.find((p) => p.id === packId);

  if (loading) {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Expansion" subtitle="Loading…" />}>
        <div className="p-8"><LoadingSkeleton /></div>
      </WorkbenchShell>
    );
  }

  if (!proof) {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Expansion" subtitle="No proof data" />}>
        <div className="p-8 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
          No proof available for {packId}. Run FieldLab first.
        </div>
      </WorkbenchShell>
    );
  }

  const adjacentCases = (proof.expansion ?? []).map((item, index) => ({
    name: item.name,
    score: item.expansion_score,
    rationale: index % 2 === 0 ? "Shared data model and stakeholder overlap" : "Reusable implementation path",
  }));

  const topbarRight = (
    <>
      <Pill>{adjacentCases.length} adjacent cases</Pill>
      <Pill tone="argon">{formatCurrency(proof.value_case.estimated_annual_value)}/yr</Pill>
    </>
  );

  return (
    <WorkbenchShell
      packName={pack?.name ?? packId}
      topbar={<TopbarTitle title="Expansion" subtitle={pack?.name ?? packId} right={topbarRight} />}
    >
      <div className="grid grid-flow-dense gap-4 p-6 lg:grid-cols-12">
        <article className="lg:col-span-5 border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6">
          <MapTrifold className="h-10 w-10" style={{ color: "var(--praxis-plasma)" }} weight="duotone" />
          <h4 className="mt-10 font-display text-5xl font-medium leading-none">{pack?.name ?? packId}</h4>
          <p className="mt-5 text-sm leading-6 text-[var(--praxis-mute)]">
            Initial proof path for {(pack?.buyer_persona ?? "operator").toLowerCase()} operations and executive value narrative.
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--praxis-mute)]">
            Adjacent use cases and expansion potential are calculated from the current proof graph.
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] p-4">
              <span className="font-mono text-[10px] uppercase text-[var(--praxis-mute)]">Current value</span>
              <span className="font-display text-2xl" style={{ color: "var(--praxis-argon)" }}>{formatCurrency(proof.value_case.estimated_annual_value)}/yr</span>
            </div>
            <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] p-4">
              <span className="font-mono text-[10px] uppercase text-[var(--praxis-mute)]">Expansion potential</span>
              <span className="font-display text-2xl" style={{ color: "var(--praxis-plasma)" }}>{adjacentCases.length} cases</span>
            </div>
          </div>
        </article>
        <article className="lg:col-span-7 border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
            <GitBranch className="h-4 w-4" />
            Adjacent use cases
          </div>
          <div className="mt-6 space-y-3">
            {adjacentCases.map((item, index) => (
              <div key={item.name} className="group grid grid-flow-dense grid-cols-[1fr_auto] gap-4 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] p-4 transition-colors hover:border-[var(--praxis-plasma)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase" style={{ color: "var(--praxis-plasma)" }}>#{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--praxis-mute)]">{item.rationale}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-3xl" style={{ color: "var(--praxis-argon)" }}>{item.score.toFixed(2)}</span>
                  <ArrowRight className="h-4 w-4 text-[var(--praxis-mute)] opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 lg:col-span-12">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
            Expansion readiness
          </div>
          <div className="mt-5 grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] md:grid-cols-4">
            {[
              ["Evidence graph", `${proof.evidence.sources.length} sources`],
              ["Reusable ontology", `${proof.ontology.objects_created} objects`],
              ["Replay base", proof.proof_hash.slice(7, 19)],
              ["Buyer path", pack?.buyer_persona ?? "operator"],
            ].map(([label, value]) => (
              <div key={label} className="bg-[var(--praxis-obsidian)] p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
                <div className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--praxis-bone)]">{value}</div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </WorkbenchShell>
  );
}
