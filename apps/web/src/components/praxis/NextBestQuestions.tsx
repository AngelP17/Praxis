"use client";

import { Compass, ArrowRight, Target } from "@phosphor-icons/react";
import { getPackById } from "@/lib/praxis-api";

interface NextBestQuestionsProps {
  packId?: string;
}

interface Question {
  field: string;
  question: string;
  gain: number;
  rationale: string;
}

function getQuestions(packId: string): Question[] {
  const packs: Record<string, Question[]> = {
    "manufacturing-printer-gpo": [
      { field: "downtime_minutes", question: "How many production minutes were lost or delayed?", gain: 0.18, rationale: "Directly impacts value case" },
      { field: "asset_owner", question: "Who owns the affected asset or system?", gain: 0.11, rationale: "Determines action routing" },
      { field: "vendor_sla", question: "What SLA applies to the current vendor?", gain: 0.09, rationale: "Affects escalation policy" },
      { field: "affected_department", question: "Which department absorbs the operational delay?", gain: 0.07, rationale: "Business impact scope" },
    ],
    "erp-access-disruption": [
      { field: "blocked_modules", question: "Which ERP modules are blocked per user group?", gain: 0.21, rationale: "Directly impacts remediation" },
      { field: "fallback_process", question: "What is the fallback access process during SSO outages?", gain: 0.14, rationale: "Business continuity risk" },
      { field: "provisioning_audit", question: "When was the last successful role provisioning audit?", gain: 0.10, rationale: "Recurrence prevention" },
      { field: "fulfillment_window", question: "What is the critical fulfillment window?", gain: 0.08, rationale: "Time sensitivity" },
    ],
    "k8s-ingress-degradation": [
      { field: "ingress_changes", question: "Which ingress rules changed in the last deployment window?", gain: 0.19, rationale: "Root cause confirmation" },
      { field: "p95_baseline", question: "What is the current p95 latency vs baseline?", gain: 0.13, rationale: "Severity assessment" },
      { field: "rollback_policy", question: "What is the ingress rollback policy?", gain: 0.11, rationale: "Action feasibility" },
      { field: "customer_impact", question: "Which customer segments are affected?", gain: 0.09, rationale: "Business priority" },
    ],
  };
  return packs[packId] || packs["manufacturing-printer-gpo"];
}

export function NextBestQuestions({ packId = "manufacturing-printer-gpo" }: NextBestQuestionsProps) {
  const questions = getQuestions(packId);

  return (
    <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
        <Compass className="h-4 w-4 text-[var(--praxis-violet)]" />
        Next best questions
      </div>
      <div className="mt-6 space-y-3">
        {questions.map((q, index) => (
          <div
            key={q.field}
            className="grid grid-flow-dense gap-4 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 md:grid-cols-[1fr_auto]"
          >
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-[var(--praxis-violet)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-violet)]">
                  {q.field}
                </span>
              </div>
              <div className="mt-2 text-sm">{q.question}</div>
              <div className="mt-1 text-xs text-[var(--praxis-muted)]">{q.rationale}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-display text-3xl text-[var(--praxis-mint)]">{q.gain.toFixed(2)}</div>
                <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">info gain</div>
              </div>
              {index === 0 && (
                <ArrowRight className="h-4 w-4 text-[var(--praxis-mint)]" />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">
        Ranked by expected confidence increase · {questions.length} questions
      </div>
    </article>
  );
}
