"use client";

import { Clock, CheckCircle, Warning, Circle, ArrowRight } from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import type { PraxisProof } from "@/lib/praxis-client";

type StepStatus = "completed" | "active" | "pending" | "warning";

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "completed") return <CheckCircle className="h-5 w-5 text-[var(--praxis-mint)]" weight="fill" />;
  if (status === "active") return <Clock className="h-5 w-5 text-[var(--praxis-violet)] animate-pulse" weight="fill" />;
  if (status === "warning") return <Warning className="h-5 w-5 text-[var(--praxis-crit)]" weight="fill" />;
  return <Circle className="h-5 w-5 text-[var(--praxis-muted)]" />;
}

function proofToSteps(proof: PraxisProof) {
  return [
    { label: "Events ingested", status: "completed" as StepStatus, detail: `${proof.evidence.raw_events} raw field events`, timestamp: proof.generated_at },
    { label: "Ontology compiled", status: "completed" as StepStatus, detail: `${proof.ontology.objects_created} objects, ${proof.ontology.links_created} links`, timestamp: proof.generated_at },
    { label: "Decision generated", status: "completed" as StepStatus, detail: `priority ${proof.decision.priority_score.toFixed(2)}`, timestamp: proof.generated_at },
    { label: "Action captured", status: "completed" as StepStatus, detail: proof.action.mode, timestamp: proof.generated_at },
    { label: "Value case", status: "completed" as StepStatus, detail: `$${(proof.value_case.estimated_annual_value / 1000).toFixed(1)}K/yr`, timestamp: proof.generated_at },
    { label: "Replay verified", status: "completed" as StepStatus, detail: proof.replay.deterministic ? "deterministic" : "verified", timestamp: proof.replay.verified_at },
    { label: "Proof hash", status: "completed" as StepStatus, detail: proof.proof_hash.slice(7, 19) + "…", timestamp: proof.generated_at },
    { label: "Schema validated", status: "completed" as StepStatus, detail: "L0 proof verified", timestamp: proof.generated_at },
  ];
}

export function FieldLabTimeline({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const { proof } = useProof(packId);
  const steps = proof ? proofToSteps(proof) : [];

  if (!steps.length) {
    return (
      <div className="grid grid-flow-dense gap-3 md:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[120px] animate-pulse border border-[var(--praxis-line)] bg-[var(--praxis-panel)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-flow-dense gap-3 md:grid-cols-4 lg:grid-cols-8">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={`group relative border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-4 transition-transform duration-500 hover:scale-[1.02] ${step.status === "active" ? "ring-1 ring-[var(--praxis-violet)]" : ""}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">step {String(index + 1).padStart(2, "0")}</span>
            <StepIcon status={step.status} />
          </div>
          <div className="mt-4 font-display text-2xl font-medium">{step.label}</div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">{new Date(step.timestamp).toLocaleTimeString()}</div>
          <div className="mt-1 text-xs text-[var(--praxis-muted)]">{step.detail}</div>
          {index < steps.length - 1 && (
            <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 lg:block">
              <ArrowRight className="h-3 w-3 text-[var(--praxis-muted)]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
