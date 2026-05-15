"use client";

import { motion } from "framer-motion";
import {
  Broadcast,
  Graph,
  GitBranch,
  Scales,
  CurrencyDollar,
  CheckSquare,
} from "@phosphor-icons/react";
import { formatCurrency, formatPercent, type PraxisProof } from "@/lib/praxis-client";

type Step = {
  icon: typeof Broadcast;
  label: string;
  value: string;
  sublabel: string;
  accent: string;
};

function buildSteps(proof: PraxisProof): Step[] {
  const priority = proof.decision.priority_score;
  const bucketLabel =
    priority >= 0.8
      ? "pilot now"
      : priority >= 0.65
      ? "demo & scope"
      : "discovery";

  return [
    {
      icon: Broadcast,
      label: "Signals captured",
      value: String(proof.evidence.raw_events),
      sublabel: `${proof.evidence.sources.length} systems`,
      accent: "var(--praxis-argon)",
    },
    {
      icon: Graph,
      label: "Evidence scored",
      value: formatPercent(proof.evidence.evidence_trust),
      sublabel: "evidence trust",
      accent: "var(--praxis-plasma)",
    },
    {
      icon: GitBranch,
      label: "Ontology compiled",
      value: `${proof.ontology.objects_created} obj`,
      sublabel: `${proof.ontology.links_created} links`,
      accent: "rgba(192,132,252,1)",
    },
    {
      icon: Scales,
      label: "Decision generated",
      value: priority.toFixed(2),
      sublabel: bucketLabel,
      accent: priority >= 0.65 ? "var(--praxis-plasma)" : "var(--praxis-argon)",
    },
    {
      icon: CurrencyDollar,
      label: "Value calculated",
      value: formatCurrency(proof.value_case.estimated_annual_value),
      sublabel: `conf ${proof.value_case.confidence.toFixed(2)}`,
      accent: "var(--praxis-argon)",
    },
    {
      icon: CheckSquare,
      label: "Action gated",
      value: proof.decision.requires_human_review ? "Review" : "Approved",
      sublabel: proof.action.mode,
      accent: proof.decision.requires_human_review
        ? "var(--praxis-crit)"
        : "var(--praxis-argon)",
    },
  ];
}

export function ProofJourneyTimeline({ proof }: { proof: PraxisProof }) {
  const steps = buildSteps(proof);

  return (
    <div className="relative overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,.98),rgba(10,10,20,.96))] p-5">
      <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--praxis-mute)]">
        Proof generation · field-to-decision narrative
      </div>

      {/* connector line */}
      <div className="pointer-events-none absolute left-5 right-5 top-[72px] hidden h-[1px] bg-[var(--praxis-line)] md:block" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.label}
              className="relative flex flex-col items-center gap-2 text-center md:px-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* step node */}
              <div
                className="relative z-10 flex h-9 w-9 items-center justify-center border bg-[rgba(10,10,20,.92)]"
                style={{ borderColor: step.accent }}
              >
                <Icon className="h-4 w-4" style={{ color: step.accent }} />
                {/* glow */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: `0 0 12px ${step.accent}30` }}
                />
              </div>

              {/* step index */}
              <div
                className="font-mono text-[7.5px] uppercase tracking-[0.18em]"
                style={{ color: step.accent }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* label */}
              <div className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-[var(--praxis-mute)] leading-tight">
                {step.label}
              </div>

              {/* value */}
              <div className="font-display text-[18px] font-semibold leading-none" style={{ color: step.accent }}>
                {step.value}
              </div>

              {/* sublabel */}
              <div className="font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--praxis-mute)]">
                {step.sublabel}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
