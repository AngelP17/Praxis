"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { formatCurrency, formatPercent, type PraxisProof } from "@/lib/praxis-client";

function bucket(priority: number) {
  if (priority >= 0.8) return { label: "Pilot now", color: "var(--praxis-crit)" };
  if (priority >= 0.65) return { label: "Demo & scope", color: "var(--praxis-plasma)" };
  return { label: "Discovery required", color: "var(--praxis-argon)" };
}

interface Act {
  tag: string;
  headline: string;
  context: string;
  accent: string;
}

function buildActs(proof: PraxisProof, packName: string): Act[] {
  const prio = proof.decision.priority_score;
  const bkt = bucket(prio);
  return [
    {
      tag: "Setup",
      headline: `${proof.evidence.raw_events} signals · ${proof.evidence.sources.length} systems`,
      context: `${packName} — messy field data ingested and archived`,
      accent: "var(--praxis-argon)",
    },
    {
      tag: "Conflict",
      headline: proof.decision.root_cause_hypothesis.replace(/_/g, " "),
      context: `Priority ${prio.toFixed(2)} · evidence trust ${formatPercent(proof.evidence.evidence_trust)}`,
      accent: "var(--praxis-plasma)",
    },
    {
      tag: "Resolution",
      headline: `${formatCurrency(proof.value_case.estimated_annual_value)}/yr — ${bkt.label}`,
      context: proof.decision.requires_human_review
        ? "Human approval required before production mutation"
        : "Auto-approved · audit artifact written",
      accent: bkt.color,
    },
  ];
}

export function ProofNarrativeStrip({
  proof,
  packName,
}: {
  proof: PraxisProof;
  packName: string;
}) {
  const acts = buildActs(proof, packName);

  return (
    <div className="relative overflow-hidden border-b border-[var(--praxis-line)] bg-[linear-gradient(90deg,rgba(19,18,31,.98),rgba(10,10,20,.96))]">
      {/* ambient sweep */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_120%_at_0%_50%,rgba(139,92,255,0.07),transparent)]" />

      <div className="relative grid grid-flow-dense grid-cols-1 divide-y divide-[var(--praxis-line)] md:grid-cols-[1fr_auto_1fr_auto_1fr] md:divide-x md:divide-y-0">
        {acts.map((act, i) => (
          <>
            <motion.div
              key={act.tag}
              className="flex flex-col gap-1.5 px-6 py-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="font-mono text-[8.5px] uppercase tracking-[0.22em]"
                style={{ color: act.accent }}
              >
                {String(i + 1).padStart(2, "0")} · {act.tag}
              </div>
              <div className="font-display text-[15px] font-semibold leading-tight tracking-tight text-[var(--praxis-bone)]">
                {act.headline}
              </div>
              <div className="font-mono text-[9.5px] leading-4 text-[var(--praxis-mute)]">
                {act.context}
              </div>
            </motion.div>

            {i < acts.length - 1 && (
              <div
                key={`sep-${i}`}
                className="hidden items-center justify-center px-3 md:flex"
                aria-hidden
              >
                <ArrowRight className="h-3.5 w-3.5 text-[var(--praxis-mute)]" />
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
}
