"use client";

import { Clock, CheckCircle, Warning, Circle, ArrowRight } from "@phosphor-icons/react";

interface TimelineStep {
  label: string;
  status: "completed" | "active" | "pending" | "warning";
  timestamp: string;
  detail: string;
}

const steps: TimelineStep[] = [
  { label: "Select", status: "completed", timestamp: "08:00:00", detail: "manufacturing-printer-gpo" },
  { label: "Context", status: "completed", timestamp: "08:00:02", detail: "12 events loaded" },
  { label: "Compile", status: "completed", timestamp: "08:00:05", detail: "9 objects, 14 links" },
  { label: "FieldLab", status: "active", timestamp: "08:00:08", detail: "streaming to localhost:4566" },
  { label: "Stream", status: "pending", timestamp: "—", detail: "SQS + S3 + DynamoDB" },
  { label: "Decide", status: "pending", timestamp: "—", detail: "priority score pending" },
  { label: "Action", status: "pending", timestamp: "—", detail: "human approval gate" },
  { label: "Readout", status: "pending", timestamp: "—", detail: "executive value case" },
];

function StepIcon({ status }: { status: TimelineStep["status"] }) {
  if (status === "completed") return <CheckCircle className="h-5 w-5 text-[var(--praxis-mint)]" weight="fill" />;
  if (status === "active") return <Clock className="h-5 w-5 text-[var(--praxis-violet)] animate-pulse" weight="fill" />;
  if (status === "warning") return <Warning className="h-5 w-5 text-[var(--praxis-crit)]" weight="fill" />;
  return <Circle className="h-5 w-5 text-[var(--praxis-muted)]" />;
}

export function FieldLabTimeline() {
  return (
    <div className="grid grid-flow-dense gap-3 md:grid-cols-4 lg:grid-cols-8">
      {steps.map((step, index) => (
        <div
          key={step.label}
          className={`group relative border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-4 transition-transform duration-500 hover:scale-[1.02] ${
            step.status === "active" ? "ring-1 ring-[var(--praxis-violet)]" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
              step {String(index + 1).padStart(2, "0")}
            </span>
            <StepIcon status={step.status} />
          </div>
          <div className="mt-4 font-display text-2xl font-medium">{step.label}</div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">
            {step.timestamp}
          </div>
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
