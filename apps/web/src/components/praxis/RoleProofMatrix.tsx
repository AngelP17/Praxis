"use client";

import { useState } from "react";
import { useProof } from "@/lib/hooks/useProof";
import { formatCurrency, formatPercent } from "@/lib/praxis-client";

const roles = [
  ["Solutions Engineer", "solution pack, proof object, executive value"],
  ["Customer Engineer", "customer context, ontology, missing-field questions"],
  ["Deployment Engineer", "FieldLab runtime, validation gates, replay hash"],
  ["Field Systems Engineer", "industrial sources, asset/process mapping"],
  ["Infrastructure Solutions Engineer", "S3/SQS/DynamoDB/EventBridge run path"],
  ["Industrial AI Engineer", "evidence trust, VOI, human approval"],
  ["Technical Solutions Consultant", "value case, expansion, executive readout"],
  ["Hiring Manager", "candidate verification, proof authenticity, compliance check"],
] as const;

export function RoleProofMatrix({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const [active, setActive] = useState<string>(roles[0][0]);
  const { proof } = useProof(packId);

  return (
    <section className="grid grid-flow-dense gap-5 py-20 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-2">
        {roles.map(([role]) => (
          <button
            key={role}
            type="button"
            onClick={() => setActive(role)}
            className={`w-full border px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] transition-transform hover:scale-105 ${
              active === role
                ? "border-[var(--praxis-violet)] bg-[var(--praxis-violet)] text-[var(--praxis-bg)]"
                : "border-[var(--praxis-line)] bg-[var(--praxis-panel)] text-[var(--praxis-muted)]"
            }`}
          >
            {role}
          </button>
        ))}
      </div>
      <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{active}</div>
        <h2 className="mt-4 text-3xl font-medium">What Praxis proves</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--praxis-muted)]">
          {roles.find(([role]) => role === active)?.[1]}.
        </p>
        <div className="mt-6 grid grid-flow-dense gap-3 md:grid-cols-3">
          <Metric label="Priority" value={formatPercent(proof?.decision.priority_score ?? 0)} />
          <Metric label="Evidence" value={formatPercent(proof?.evidence.evidence_trust ?? 0)} />
          <Metric label="Value" value={formatCurrency(proof?.value_case.estimated_annual_value ?? 0)} />
        </div>
        <div className="mt-5 break-all border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 font-mono text-xs text-[var(--praxis-muted)]">
          Artifact: {proof?.proof_hash ?? "loading"}
        </div>
      </article>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{label}</div>
      <div className="mt-2 text-xl font-medium">{value}</div>
    </div>
  );
}
