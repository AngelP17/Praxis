"use client";

import { useSearchParams } from "next/navigation";
import { FileText, TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { formatCurrency } from "@/lib/praxis-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { WorkbenchShell, TopbarTitle, Pill } from "./workbench/WorkbenchShell";

type Impact = "high" | "medium" | "low";

function ImpactIcon({ impact }: { impact: Impact }) {
  if (impact === "high") return <TrendUp className="h-3 w-3 text-[var(--praxis-crit)]" />;
  if (impact === "medium") return <Minus className="h-3 w-3 text-[var(--praxis-muted)]" />;
  return <TrendDown className="h-3 w-3 text-[var(--praxis-argon)]" />;
}

export function ValueCasePanel({ packId: propPackId }: { packId?: string }) {
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack") ?? propPackId ?? "manufacturing-printer-gpo";
  const { proof, loading } = useProof(packId);
  const { packs } = useSolutionPacks();
  const activePack = packs.find((p) => p.id === packId);

  if (loading) {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Value Case" subtitle="Loading…" />}>
        <div className="p-8"><LoadingSkeleton /></div>
      </WorkbenchShell>
    );
  }

  if (!proof) {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Value Case" subtitle="No proof data" />}>
        <div className="p-8 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
          No proof available for {packId}. Run FieldLab first.
        </div>
      </WorkbenchShell>
    );
  }

  const annualValue = proof.value_case.estimated_annual_value;
  const confidence = proof.value_case.confidence;
  const primaryDriver = proof.value_case.primary_value_driver;
  const evidenceTrust = proof.evidence.evidence_trust;
  const rawEvents = proof.evidence.raw_events;
  const ontologyObjects = proof.ontology.objects_created;

  const assumptions: { label: string; value: string; impact: Impact }[] = [
    { label: "Evidence trust", value: evidenceTrust.toFixed(2), impact: "high" },
    { label: "Raw events", value: String(rawEvents), impact: "high" },
    { label: "Ontology objects", value: String(ontologyObjects), impact: "medium" },
    { label: "Sources", value: String(proof.evidence.sources.length), impact: "medium" },
    { label: "Mapping confidence", value: proof.ontology.mapping_confidence.toFixed(2), impact: "low" },
    { label: "Actions available", value: String(proof.ontology.actions_available), impact: "low" },
  ];

  const topbarRight = (
    <>
      <Pill tone="argon">{formatCurrency(annualValue)}/yr</Pill>
      <Pill>conf {confidence.toFixed(2)}</Pill>
    </>
  );

  return (
    <WorkbenchShell
      packName={activePack?.name ?? packId}
      topbar={<TopbarTitle title="Value Case" subtitle={primaryDriver} right={topbarRight} />}
    >
      <div className="grid grid-flow-dense gap-4 p-6 lg:grid-cols-12">
        <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6">
          <FileText className="h-10 w-10" style={{ color: "var(--praxis-argon)" }} weight="duotone" />
          <div className="mt-10 font-display text-7xl" style={{ color: "var(--praxis-argon)" }}>{formatCurrency(annualValue)}</div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">estimated annual value</div>
          <div className="mt-4 flex items-center gap-2">
            <div className="font-mono text-[10px] uppercase text-[var(--praxis-mute)]">Confidence</div>
            <div className="font-display text-xl" style={{ color: "var(--praxis-plasma)" }}>{confidence.toFixed(2)}</div>
          </div>
          <p className="mt-7 text-sm leading-6 text-[var(--praxis-mute)]">
            Based on {rawEvents} events across {proof.evidence.sources.length} sources.
          </p>
          <div className="mt-4 border-t border-[var(--praxis-line)] pt-4">
            <div className="font-mono text-[10px] uppercase text-[var(--praxis-mute)]">Primary driver</div>
            <div className="mt-1 text-sm">{primaryDriver}</div>
          </div>
        </article>
        <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Proof evidence summary</div>
          <div className="mt-6 grid grid-flow-dense gap-3 md:grid-cols-2">
            {assumptions.map((a) => (
              <div key={a.label} className="flex items-end justify-between border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] p-4">
                <div>
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-mute)]">
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
    </WorkbenchShell>
  );
}
