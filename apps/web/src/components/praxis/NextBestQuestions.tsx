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
    "network-edge-failover": [
      { field: "failover_starlink_active", question: "Is Starlink routing configured for automatic failover?", gain: 0.22, rationale: "Validates route capability" },
      { field: "isp_primary_outage_cause", question: "What is the physical cause of the primary ISP link failure?", gain: 0.15, rationale: "Estimates MTTR" },
      { field: "backup_cabling_verified", question: "When was the backup LTE gateway cabling last physically inspected?", gain: 0.09, rationale: "Checks redundancy integrity" },
    ],
    "identity-onboarding-drift": [
      { field: "onboarding_flow_owner", question: "Which system is the source of truth for onboarding role definitions?", gain: 0.24, rationale: "Targets origin of fragmentation" },
      { field: "new_hire_gpo_sync_hours", question: "What is the Active Directory sync interval for GPO propagation?", gain: 0.16, rationale: "Determines delay window" },
      { field: "manual_onboarding_tickets", question: "How many manual onboarding tickets were filed this quarter?", gain: 0.11, rationale: "Estimates chronic volume" },
    ],
    "database-failover-lag": [
      { field: "pg_replication_lag_seconds", question: "What is the replica lag in seconds vs transactional rate?", gain: 0.25, rationale: "Quantifies data loss risk" },
      { field: "patroni_failover_safety", question: "Is Patroni configured for safe auto-failover or manual promotion?", gain: 0.18, rationale: "Assesses risk of split-brain" },
      { field: "max_connection_pool_size", question: "What is the max pool size of the checkout microservice?", gain: 0.12, rationale: "Validates scaling limits" },
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
