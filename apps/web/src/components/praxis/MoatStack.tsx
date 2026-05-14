"use client";

import { CheckCircle } from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import { formatCurrency, formatPercent } from "@/lib/praxis-client";

export function MoatStack({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const { proof } = useProof(packId);
  const layers = [
    ["Solution Pack", `${proof?.evidence.raw_events ?? 0} events`],
    ["FieldLab", proof?.run_id ?? "pending"],
    ["Ontology", `${proof?.ontology.objects_created ?? 0} objects`],
    ["Decision", formatPercent(proof?.decision.priority_score ?? 0)],
    ["Human Approval", proof?.action.mode ?? "pending"],
    ["Proof Object", proof?.proof_hash.slice(0, 18) ?? "pending"],
    ["Executive Value", formatCurrency(proof?.value_case.estimated_annual_value ?? 0)],
  ];

  return (
    <section className="grid grid-flow-dense gap-3 py-20 md:grid-cols-7">
      {layers.map(([label, value]) => (
        <article key={label} className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-4">
          <CheckCircle className="h-4 w-4 text-[var(--praxis-mint)]" />
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{label}</div>
          <div className="mt-2 truncate text-sm text-[var(--praxis-bone)]">{value}</div>
        </article>
      ))}
    </section>
  );
}
