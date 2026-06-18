"use client";

import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { getPackById } from "@/lib/api";
import { PraxisMark } from "./PraxisMark";

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
    "network-edge-failover": [
      { label: "source reliability", score: 0.88, trend: "up", description: "4 corroborating sources" },
      { label: "freshness", score: 0.91, trend: "stable", description: "Recent edge alert" },
      { label: "corroboration", score: 0.85, trend: "up", description: "MSP ticket and operator note" },
      { label: "completeness", score: 0.88, trend: "up", description: "Downtime impact verified" },
      { label: "consistency", score: 0.88, trend: "stable", description: "Consistent route loss" },
      { label: "auditability", score: 0.88, trend: "up", description: "Replay proof generated" },
    ],
    "identity-onboarding-drift": [
      { label: "source reliability", score: 0.85, trend: "stable", description: "4 corroborating sources" },
      { label: "freshness", score: 0.88, trend: "up", description: "Sync logs within 3 hours" },
      { label: "corroboration", score: 0.82, trend: "up", description: "AD and ERP logs align" },
      { label: "completeness", score: 0.85, trend: "stable", description: "GPO drift scope verified" },
      { label: "consistency", score: 0.85, trend: "stable", description: "No conflicting records" },
      { label: "auditability", score: 0.85, trend: "up", description: "Audit trail fully intact" },
    ],
    "database-failover-lag": [
      { label: "source reliability", score: 0.92, trend: "up", description: "5 corroborating sources" },
      { label: "freshness", score: 0.95, trend: "up", description: "Sub-second metrics streams" },
      { label: "corroboration", score: 0.90, trend: "up", description: "Replica and PGPool align" },
      { label: "completeness", score: 0.92, trend: "stable", description: "All pooling options loaded" },
      { label: "consistency", score: 0.92, trend: "stable", description: "Confirmed lock contention" },
      { label: "auditability", score: 0.92, trend: "up", description: "Proof hash and replay retained" },
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
          <PraxisMark size={16} />
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
