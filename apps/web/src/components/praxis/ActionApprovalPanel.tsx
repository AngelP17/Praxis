"use client";

import { Check, GitPullRequest, ShieldCheck, User, Warning, X } from "@phosphor-icons/react";
import type { PraxisProof } from "@/lib/praxis-client";

interface ActionApprovalPanelProps {
  proof?: PraxisProof | null;
  disabled?: boolean;
  onAction?: (status: "approved" | "rejected" | "request_evidence" | "escalated") => void;
}

export function ActionApprovalPanel({ proof, disabled = false, onAction }: ActionApprovalPanelProps) {
  const action = proof?.action;

  return (
    <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
        <ShieldCheck className="h-4 w-4 text-[var(--praxis-violet)]" />
        Action approval gate
      </div>

      <div className="mt-6 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-5">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-violet)]">
          <GitPullRequest className="h-3 w-3" />
          Recommended action
        </div>
        <p className="mt-3 text-lg font-medium">
          {(action?.recommended_action ?? "Run FieldLab to compute an action").replace(/_/g, " ")}
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <User className="h-3 w-3" />
            Actor: {action?.actor ?? "operator"}
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <Warning className="h-3 w-3" />
            Mode: {action?.mode ?? "pending"}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-flow-dense gap-3 sm:grid-cols-2">
        {([
          ["approved", "Approve", Check],
          ["rejected", "Reject", X],
          ["request_evidence", "Request evidence", Warning],
          ["escalated", "Escalate", GitPullRequest],
        ] as const).map(([status, label, Icon]) => (
          <button
            key={status as string}
            type="button"
            disabled={disabled || !proof}
            onClick={() => onAction?.(status as "approved" | "rejected" | "request_evidence" | "escalated")}
            className="flex min-h-11 items-center justify-center gap-2 border border-[var(--praxis-line)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)] transition hover:scale-105 hover:border-[var(--praxis-violet)] hover:text-[var(--praxis-bone)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {action?.action_log_hash ? (
        <div className="mt-4 border border-[var(--praxis-line)] p-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">
          Action hash <span className="text-[var(--praxis-bone)]">{action.action_log_hash}</span>
        </div>
      ) : null}
    </article>
  );
}
