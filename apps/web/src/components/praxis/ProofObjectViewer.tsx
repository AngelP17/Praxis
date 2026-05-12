"use client";

import { BracketsCurly, Copy, Check } from "@phosphor-icons/react";
import { useState } from "react";
import { getPackById } from "@/lib/praxis-api";

interface ProofObjectViewerProps {
  packId?: string;
}

export function ProofObjectViewer({ packId = "manufacturing-printer-gpo" }: ProofObjectViewerProps) {
  const pack = getPackById(packId);
  const [copied, setCopied] = useState(false);

  if (!pack) return null;

  const proofObject = {
    proof_id: `proof_praxis_${pack.id.replace(/-/g, "_")}_001`,
    run_id: `fieldlab_run_${pack.id}`,
    solution_pack: pack.id,
    customer_context_hash: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
    evidence: {
      raw_events: pack.eventCount,
      sources: pack.sources,
      source_coverage: Math.round((pack.sources.length / 7) * 100) / 100,
      corroboration_score: 0.74,
      freshness_score: 0.91,
      evidence_trust: pack.evidenceTrust,
    },
    ontology: {
      objects_created: pack.objectsCreated,
      links_created: pack.linksCreated,
      actions_available: 5,
      mapping_confidence: pack.mappingConfidence,
    },
    decision: {
      root_cause_hypothesis: pack.rootCause,
      priority_score: pack.priorityScore,
      confidence: 0.76,
      requires_human_review: true,
      next_best_questions: pack.nextBestQuestions,
    },
    action: {
      recommended_action: pack.recommendedAction,
      mode: "human_approval",
      actor: "operator",
      status: "approved",
      action_log_hash: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
    },
    value_case: {
      estimated_annual_value: parseInt(pack.annualValue.replace(/[^0-9]/g, "")) * (pack.annualValue.includes("K") ? 1000 : 1),
      confidence: pack.valueConfidence,
      primary_value_driver: pack.primaryValueDriver,
    },
    replay: {
      replay_hash: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
      deterministic: true,
      verified_at: "2026-05-12T00:00:00Z",
    },
    proof_hash: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
    generated_at: "2026-05-12T00:00:00Z",
  };

  const jsonString = JSON.stringify(proofObject, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <BracketsCurly className="h-4 w-4 text-[var(--praxis-violet)]" />
          Proof object
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 border border-[var(--praxis-line)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)] transition-colors hover:text-[var(--praxis-bone)]"
        >
          {copied ? <Check className="h-3 w-3 text-[var(--praxis-mint)]" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy JSON"}
        </button>
      </div>
      <pre className="mt-5 overflow-auto rounded border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--praxis-muted)]">
        {jsonString}
      </pre>
      <div className="mt-4 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--praxis-mint)]" />
          Deterministic
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--praxis-violet)]" />
          {pack.eventCount} events
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--praxis-bone)]" />
          {pack.sources.length} sources
        </span>
      </div>
    </article>
  );
}
