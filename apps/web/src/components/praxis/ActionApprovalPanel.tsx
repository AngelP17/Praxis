"use client";

import { useState } from "react";
import { ShieldCheck, X, Check, User, GitPullRequest, Clock } from "@phosphor-icons/react";
import { getPackById } from "@/lib/praxis-api";

interface ActionApprovalPanelProps {
  packId?: string;
}

export function ActionApprovalPanel({ packId = "manufacturing-printer-gpo" }: ActionApprovalPanelProps) {
  const pack = getPackById(packId);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");

  if (!pack) return null;

  const actionModes = [
    { mode: "READ_ONLY", label: "Read only", desc: "Observe without mutation", active: false },
    { mode: "HUMAN_APPROVAL", label: "Human approval", desc: "Operator review required", active: true },
    { mode: "ASSISTED_ACTION", label: "Assisted", desc: "AI-guided with checkpoints", active: false },
    { mode: "WRITEBACK", label: "Writeback", desc: "Simulated in FieldLab only", active: false },
  ];

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
        <p className="mt-3 text-lg font-medium">{pack.recommendedAction.replace(/_/g, " ")}</p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <User className="h-3 w-3" />
            Actor: operator
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <Clock className="h-3 w-3" />
            Mode: human_approval
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {actionModes.map((m) => (
          <div
            key={m.mode}
            className={`flex items-center justify-between border p-3 ${
              m.active
                ? "border-[var(--praxis-violet)] bg-[rgba(113,91,255,0.08)]"
                : "border-[var(--praxis-line)] bg-[var(--praxis-bg)]"
            }`}
          >
            <div>
              <div className="text-sm">{m.label}</div>
              <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">{m.desc}</div>
            </div>
            {m.active && <span className="font-mono text-[10px] uppercase text-[var(--praxis-violet)]">Active</span>}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => setStatus("approved")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-transform duration-700 hover:scale-105 ${
            status === "approved"
              ? "bg-[var(--praxis-mint)] text-[var(--praxis-bg)]"
              : "border border-[var(--praxis-mint)] text-[var(--praxis-mint)]"
          }`}
        >
          <Check className="h-3 w-3" /> Approve
        </button>
        <button
          onClick={() => setStatus("rejected")}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-transform duration-700 hover:scale-105 ${
            status === "rejected"
              ? "bg-[var(--praxis-crit)] text-[var(--praxis-bg)]"
              : "border border-[var(--praxis-crit)] text-[var(--praxis-crit)]"
          }`}
        >
          <X className="h-3 w-3" /> Reject
        </button>
      </div>

      {status !== "pending" && (
        <div className={`mt-4 border p-3 ${status === "approved" ? "border-[var(--praxis-mint)]" : "border-[var(--praxis-crit)]"}`}>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em]">
            Status: <span className={status === "approved" ? "text-[var(--praxis-mint)]" : "text-[var(--praxis-crit)]"}>{status}</span>
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            Action logged · Hash: sha256:9f3...e2a
          </div>
        </div>
      )}
    </article>
  );
}
