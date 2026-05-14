"use client";

import { ArrowRight } from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";

export function ProofArtifactChain({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const { proof } = useProof(packId);
  const artifacts = [
    ["raw-events.jsonl", `${proof?.evidence.raw_events ?? 0} events`],
    ["operational ontology", `${proof?.ontology.links_created ?? 0} links`],
    ["decision record", proof?.decision.root_cause_hypothesis ?? "pending"],
    ["action log", proof?.action.action_log_hash?.slice(0, 18) ?? "pending"],
    ["replay hash", proof?.replay.replay_hash?.slice(0, 18) ?? "pending"],
    ["praxis_proof.json", proof?.proof_hash?.slice(0, 18) ?? "pending"],
  ];

  return (
    <div className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Proof artifact chain</div>
      <div className="mt-5 grid grid-flow-dense gap-3 md:grid-cols-3">
        {artifacts.map(([name, value], index) => (
          <article key={name} className="border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bone)]">{name}</span>
              {index < artifacts.length - 1 ? <ArrowRight className="h-3 w-3 text-[var(--praxis-violet)]" /> : null}
            </div>
            <div className="mt-3 truncate text-xs text-[var(--praxis-muted)]">{value}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
