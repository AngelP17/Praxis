"use client";

import { Warning, GitCommit } from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { PraxisMark } from "./PraxisMark";

interface DecisionProofCardProps {
  packId?: string;
}

export function DecisionProofCard({ packId = "manufacturing-printer-gpo" }: DecisionProofCardProps) {
  const { proof } = useProof(packId);
  const { packs } = useSolutionPacks();
  const pack = packs.find((p) => p.id === packId);

  if (!proof) return null;

  const priority = proof.decision.priority_score;
  const trust = proof.evidence.evidence_trust;
  const confidence = proof.decision.confidence;
  const mappingConf = proof.ontology.mapping_confidence;

  const weights = [
    { label: "Severity score", value: +(Math.min(priority + 0.06, 1)).toFixed(2), weight: 0.20 },
    { label: "Business impact", value: +confidence.toFixed(2), weight: 0.20 },
    { label: "Evidence trust", value: +trust.toFixed(2), weight: 0.15 },
    { label: "Actionability", value: +(Math.min(priority + 0.11, 1)).toFixed(2), weight: 0.15 },
    { label: "Ontology mapping", value: +mappingConf.toFixed(2), weight: 0.10 },
  ];

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <PraxisMark size={16} />
          Praxis priority
        </div>
        <div className="mt-5 font-display text-8xl font-medium text-[var(--praxis-violet)]">
          {priority.toFixed(2)}
        </div>
        <p className="mt-5 max-w-md text-sm leading-6 text-[var(--praxis-muted)]">
          {proof.decision.root_cause_hypothesis.replace(/_/g, " ")} requires assisted human-approved routing.
        </p>
        <div className="mt-8 grid grid-flow-dense grid-cols-2 gap-3">
          <div className="border border-[var(--praxis-line)] p-4">
            <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Evidence trust</div>
            <div className="mt-2 font-display text-4xl text-[var(--praxis-mint)]">{trust.toFixed(2)}</div>
          </div>
          <div className="border border-[var(--praxis-line)] p-4">
            <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Mode</div>
            <div className="mt-2 font-display text-4xl">Human</div>
          </div>
        </div>
        {proof.decision.requires_human_review && (
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-crit)]">
            <Warning className="h-3 w-3" />
            Review required
          </div>
        )}
      </article>
      <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Rationale weights</div>
        <div className="mt-6 space-y-4">
          {weights.map((w) => (
            <div key={w.label}>
              <div className="mb-2 grid grid-flow-dense grid-cols-[1fr_auto_auto] gap-4 font-mono text-[10px] uppercase tracking-[0.08em]">
                <span className="text-[var(--praxis-muted)]">{w.label}</span>
                <span>{w.value}</span>
                <span className="text-[var(--praxis-muted)]">w {w.weight}</span>
              </div>
              <div className="h-2 bg-[var(--praxis-line)]">
                <div className="h-full bg-[var(--praxis-violet)]" style={{ width: `${w.value * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
            <GitCommit className="h-3 w-3" />
            Root cause
          </div>
          <p className="mt-3 text-sm text-[var(--praxis-bone)]">
            {proof.decision.root_cause_hypothesis.replace(/_/g, " ")}
          </p>
        </div>
      </article>
    </div>
  );
}
