"use client";

import { ShieldCheck, TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { getPackById } from "@/lib/praxis-api";

interface EvidenceTrustPanelProps {
  packId?: string;
}

interface Dimension {
  label: string;
  score: number;
  trend: "up" | "down" | "stable";
  description: string;
}

function getDimensions(packId: string): Dimension[] {
  const packs: Record<string, Dimension[]> = {
    "manufacturing-printer-gpo": [
      { label: "source reliability", score: 0.84, trend: "up", description: "7 corroborating sources" },
      { label: "freshness", score: 0.91, trend: "stable", description: "Events within 4 hours" },
      { label: "corroboration", score: 0.74, trend: "up", description: "Cross-system alignment" },
      { label: "completeness", score: 0.80, trend: "up", description: "Business impact captured" },
      { label: "consistency", score: 0.78, trend: "stable", description: "No contradictions found" },
      { label: "auditability", score: 0.88, trend: "up", description: "Full chain of custody" },
    ],
    "erp-access-disruption": [
      { label: "source reliability", score: 0.78, trend: "stable", description: "5 corroborating sources" },
      { label: "freshness", score: 0.89, trend: "up", description: "Events within 2 hours" },
      { label: "corroboration", score: 0.71, trend: "up", description: "IdP and WMS align" },
      { label: "completeness", score: 0.76, trend: "down", description: "Missing fallback logs" },
      { label: "consistency", score: 0.82, trend: "stable", description: "Clear causality chain" },
      { label: "auditability", score: 0.85, trend: "stable", description: "Ticket trail complete" },
    ],
    "k8s-ingress-degradation": [
      { label: "source reliability", score: 0.86, trend: "up", description: "6 corroborating sources" },
      { label: "freshness", score: 0.93, trend: "up", description: "Real-time telemetry" },
      { label: "corroboration", score: 0.77, trend: "up", description: "Metrics and logs align" },
      { label: "completeness", score: 0.79, trend: "stable", description: "Deployment context captured" },
      { label: "consistency", score: 0.81, trend: "stable", description: "No conflicting signals" },
      { label: "auditability", score: 0.90, trend: "up", description: "GitOps trace present" },
    ],
  };
  return packs[packId] || packs["manufacturing-printer-gpo"];
}

function TrendIcon({ trend }: { trend: Dimension["trend"] }) {
  if (trend === "up") return <TrendUp className="h-3 w-3 text-[var(--praxis-mint)]" />;
  if (trend === "down") return <TrendDown className="h-3 w-3 text-[var(--praxis-crit)]" />;
  return <Minus className="h-3 w-3 text-[var(--praxis-muted)]" />;
}

export function EvidenceTrustPanel({ packId = "manufacturing-printer-gpo" }: EvidenceTrustPanelProps) {
  const pack = getPackById(packId);
  const dimensions = getDimensions(packId);

  return (
    <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <ShieldCheck className="h-4 w-4 text-[var(--praxis-violet)]" />
          Evidence trust breakdown
        </div>
        <div className="font-display text-3xl text-[var(--praxis-mint)]">
          {pack?.evidenceTrust.toFixed(3) ?? "0.820"}
        </div>
      </div>
      <div className="mt-6 grid grid-flow-dense gap-3 md:grid-cols-2">
        {dimensions.map((dim) => (
          <div key={dim.label} className="border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">
                {dim.label}
              </span>
              <TrendIcon trend={dim.trend} />
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="font-display text-3xl">{dim.score.toFixed(2)}</div>
              <span className="text-xs text-[var(--praxis-muted)]">{dim.description}</span>
            </div>
            <div className="mt-3 h-1.5 bg-[var(--praxis-line)]">
              <div
                className="h-full bg-[var(--praxis-violet)]"
                style={{ width: `${dim.score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--praxis-muted)]">
        <span className="h-2 w-2 rounded-full bg-[var(--praxis-mint)]" />
        {pack?.sources.length ?? 7} sources · {pack?.eventCount ?? 12} events · {dimensions.length} dimensions scored
      </div>
    </article>
  );
}
