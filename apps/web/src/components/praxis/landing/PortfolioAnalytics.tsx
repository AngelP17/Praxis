"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChartBar } from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import generatedProofs from "@/lib/generated/proofs.generated.json";
import { DEMO_PACKS } from "@/lib/praxis-demo-data";
import { formatCurrency, formatPercent } from "@/lib/praxis-client";

type GeneratedProof = {
  proof_hash: string;
  action: {
    run_id: string;
  };
  decision: {
    priority_score: number;
    confidence: number;
    signals: Record<string, number>;
  };
  evidence: {
    evidence_trust: number;
    freshness_score: number;
    corroboration_score: number;
    source_coverage: number;
    raw_events: number;
  };
  value_case: {
    estimated_annual_value: number;
    confidence: number;
  };
};

const SIGNAL_LABELS: Record<string, string> = {
  severity_score: "Severity",
  sla_exposure: "SLA exposure",
  actionability: "Actionability",
  recurrence_risk: "Recurrence risk",
  sla_breach_risk: "SLA breach risk",
  business_process_criticality: "Process criticality",
  customer_visible_impact: "Customer impact",
};

function packDisplayName(packId: string) {
  return DEMO_PACKS.find((pack) => pack.id === packId)?.name ?? packId;
}

function shortPackName(packId: string) {
  const name = packDisplayName(packId);
  return name.split(" ").slice(0, 2).join(" ");
}

export function PortfolioAnalytics({ initialPackId }: { initialPackId: string }) {
  const proofs = generatedProofs as Record<string, GeneratedProof>;
  const packIds = useMemo(
    () =>
      Object.keys(proofs).sort(
        (a, b) => proofs[b].value_case.estimated_annual_value - proofs[a].value_case.estimated_annual_value,
      ),
    [proofs],
  );
  const [activePackId, setActivePackId] = useState(
    packIds.includes(initialPackId) ? initialPackId : packIds[0],
  );
  const active = proofs[activePackId];

  const valueChart = packIds.map((packId) => ({
    packId,
    name: shortPackName(packId),
    value: proofs[packId].value_case.estimated_annual_value,
  }));

  const portfolioValue = packIds.reduce(
    (sum, packId) => sum + proofs[packId].value_case.estimated_annual_value,
    0,
  );

  const signals = Object.entries(active.decision.signals)
    .map(([key, score]) => ({ key, label: SIGNAL_LABELS[key] ?? key.replaceAll("_", " "), score }))
    .sort((a, b) => b.score - a.score);

  const evidenceTiles: Array<[string, string]> = [
    ["Evidence trust", formatPercent(active.evidence.evidence_trust)],
    ["Freshness", formatPercent(active.evidence.freshness_score)],
    ["Corroboration", formatPercent(active.evidence.corroboration_score)],
    ["Source coverage", formatPercent(active.evidence.source_coverage)],
  ];

  return (
    <section className="border-b border-[var(--praxis-line)] bg-[var(--praxis-bg)] py-24">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="grid grid-flow-dense gap-10 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 border border-[var(--praxis-line)] bg-[var(--praxis-surface)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
                <ChartBar className="h-4 w-4 text-[var(--praxis-plasma)]" />
                Portfolio analytics
              </div>
              <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.3rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[var(--praxis-bone)]">
                Numbers with a replay hash behind them.
              </h2>
              <p className="mt-6 max-w-xl text-[17px] leading-8 text-[var(--praxis-mute)]">
                Every figure on this surface is read from the deterministic proof artifacts of the four verified
                scenario packs. Regenerate them yourself and the charts regenerate with them.
              </p>
            </div>
            <div className="grid grid-flow-dense gap-3">
              {packIds.map((packId) => {
                const selected = packId === activePackId;
                return (
                  <button
                    key={packId}
                    type="button"
                    onClick={() => setActivePackId(packId)}
                    className="grid min-h-16 grid-flow-dense grid-cols-[1fr_auto] items-center gap-4 border border-[var(--praxis-line)] px-5 text-left transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: selected ? "var(--praxis-surface-2)" : "var(--praxis-surface)",
                      color: selected ? "var(--praxis-bone)" : "var(--praxis-mute)",
                    }}
                  >
                    <span className="font-display text-xl font-semibold tracking-[-0.03em]">{packDisplayName(packId)}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-argon)]">
                      {formatCurrency(proofs[packId].value_case.estimated_annual_value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] md:grid-cols-[1.05fr_0.95fr]">
            <div className="min-h-[420px] bg-[var(--praxis-surface)] p-7 md:col-span-2">
              <div className="flex items-center justify-between border-b border-[var(--praxis-line)] pb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">
                  Verified annual value by scenario pack
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-argon)]">
                  {formatCurrency(portfolioValue)} portfolio
                </span>
              </div>
              <div className="mt-8 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={valueChart} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <CartesianGrid stroke="var(--praxis-line)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--praxis-mute)"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
                    />
                    <YAxis hide domain={[0, "dataMax"]} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                      formatter={(tooltipValue) => [formatCurrency(Number(tooltipValue)), "Annual value"]}
                      contentStyle={{
                        background: "var(--praxis-surface)",
                        border: "1px solid var(--praxis-line)",
                        borderRadius: 0,
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: 11,
                        color: "var(--praxis-bone)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[3, 3, 0, 0]}
                      onClick={(entry) => {
                        const clicked = (entry as { packId?: string }).packId;
                        if (clicked) setActivePackId(clicked);
                      }}
                    >
                      {valueChart.map((row) => (
                        <Cell
                          key={row.packId}
                          cursor="pointer"
                          fill={row.packId === activePackId ? "var(--praxis-argon)" : "var(--praxis-violet)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[var(--praxis-obsidian)] p-7">
              <div className="flex items-center justify-between border-b border-[var(--praxis-line)] pb-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">
                  Decision signal decomposition
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-argon)]">
                  priority {formatPercent(active.decision.priority_score)}
                </span>
              </div>
              <div className="mt-7 grid grid-flow-dense gap-5">
                {signals.map((signal) => (
                  <div key={signal.key}>
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
                      <span>{signal.label}</span>
                      <span className="text-[var(--praxis-bone)]">{formatPercent(signal.score)}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-[var(--praxis-surface-2)]">
                      <div
                        className="h-full bg-[var(--praxis-plasma)] transition-[width] duration-500 ease-out"
                        style={{ width: `${Math.round(signal.score * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-flow-dense content-start gap-px bg-[var(--praxis-line)]">
              <div className="grid grid-flow-dense grid-cols-2 gap-px bg-[var(--praxis-line)]">
                {evidenceTiles.map(([label, tileValue]) => (
                  <div key={label} className="bg-[var(--praxis-obsidian)] p-6">
                    <div className="font-display text-[34px] font-semibold leading-none tracking-[-0.05em] text-[var(--praxis-bone)]">
                      {tileValue}
                    </div>
                    <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[var(--praxis-obsidian)] p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Provenance</div>
                <p className="mt-4 text-sm leading-7 text-[var(--praxis-bone)]">
                  {active.evidence.raw_events} raw events scored deterministically. Artifact synced from the Python
                  registry with <span className="font-mono text-[12px] text-[var(--praxis-argon)]">make praxis-sync-frontend-proofs</span>.
                </p>
                <Link
                  href={`/proof/${active.action.run_id}?pack=${activePackId}`}
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:translate-x-1"
                >
                  Inspect this proof
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--praxis-argon)]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
