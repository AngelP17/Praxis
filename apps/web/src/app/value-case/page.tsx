"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CurrencyDollar, TrendDown, ChartBar, Export } from "@phosphor-icons/react";

import { ScenarioPicker } from "@/components/praxis/ScenarioPicker";
import { useToast } from "@/components/notifications";
import { useScenarios } from "@/lib/hooks/useScenarios";
import { type Scenario } from "@/lib/scenarios";
import { Pill, TopbarTitle, WorkbenchShell } from "@/components/praxis/workbench/WorkbenchShell";
import { getActiveCase, hrefWithActiveCase } from "@/lib/active-case";
import { authFetch } from "@/lib/api";

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

const CATEGORY_BREAKDOWN = (s: Scenario) => [
  {
    label: "Prevented downtime cost",
    value: Math.round(s.estimatedValueUsd * 0.52),
    pct: 52,
    color: "var(--praxis-plasma)",
  },
  {
    label: "SLA penalty avoidance",
    value: Math.round(s.estimatedValueUsd * 0.24),
    pct: 24,
    color: "var(--praxis-argon)",
  },
  {
    label: "Labour efficiency gain",
    value: Math.round(s.estimatedValueUsd * 0.14),
    pct: 14,
    color: "var(--praxis-bone)",
  },
  {
    label: "Recurrence reduction",
    value: Math.round(s.estimatedValueUsd * 0.10),
    pct: 10,
    color: "var(--praxis-mute)",
  },
];

const ASSUMPTIONS = (s: Scenario) => [
  { label: "Incident cost per hour", value: fmtUsd(Math.round(s.estimatedValueUsd / 3)) },
  { label: "MTTR reduction", value: `−${s.mttrReductionPct}%` },
  { label: "Recurrence reduction", value: `−${s.recurrenceReductionPct}%` },
  { label: "Annual occurrence", value: "12 incidents/yr (p50)" },
  { label: "Confidence", value: s.confidenceScore.toFixed(2) },
  { label: "Runbook", value: s.runbookId },
];

export default function ValueCasePage() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { scenarios } = useScenarios();
  const initialCase = getActiveCase(searchParams.get("pack"), searchParams.get("scenario"), searchParams.get("ticket"));
  const [activeScenario, setActiveScenario] = useState<Scenario>(initialCase.scenario);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const nextCase = getActiveCase(searchParams.get("pack"), searchParams.get("scenario"), searchParams.get("ticket"));
    const updated = scenarios.find((scenario) => scenario.id === nextCase.scenarioId);
    if (updated) {
      setActiveScenario(updated);
    }
  }, [scenarios, searchParams]);

  const breakdown = CATEGORY_BREAKDOWN(activeScenario);
  const assumptions = ASSUMPTIONS(activeScenario);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await authFetch("/api/reports/excel", { method: "GET", cache: "no-store" });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `praxis_value_case_${activeScenario.id}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Value case exported", `${activeScenario.label} · ${fmtUsd(activeScenario.estimatedValueUsd)}/yr`);
      } else {
        throw new Error("Export endpoint unavailable");
      }
    } catch {
      toast.error("Export failed", "The report endpoint did not return a downloadable file.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <WorkbenchShell
      packName={activeScenario.label}
      topbar={
        <TopbarTitle
          title="Value Case"
          subtitle={`Operational value model · ${activeScenario.site} · ${activeScenario.category}`}
          right={
            <>
              <Pill tone="argon">{activeScenario.category}</Pill>
              <Pill>{activeScenario.site}</Pill>
            </>
          }
        />
      }
    >
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">
          <div className="grid grid-cols-1 grid-flow-dense gap-[14px] md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Annual value"
              value={fmtUsd(activeScenario.estimatedValueUsd)}
              detail={activeScenario.label}
              tone="var(--praxis-argon)"
            />
            <MetricCard
              label="MTTR reduction"
              value={`−${activeScenario.mttrReductionPct}%`}
              detail="time to restore"
              tone="var(--praxis-argon)"
            />
            <MetricCard
              label="Recurrence reduction"
              value={`−${activeScenario.recurrenceReductionPct}%`}
              detail="repeat incident suppression"
              tone="var(--praxis-plasma)"
            />
            <MetricCard
              label="Confidence"
              value={activeScenario.confidenceScore.toFixed(2)}
              detail={activeScenario.site}
              tone="var(--praxis-plasma)"
            />
          </div>

          <div className="grid grid-cols-12 gap-5 grid-flow-dense">
            <section className="col-span-12 border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] px-6 py-20 sm:px-8 xl:col-span-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Selected case</div>
                  <h2 className="mt-3 font-display text-[28px] font-semibold tracking-[-0.02em] text-[var(--praxis-bone)]">
                    Estimated Operational Value
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--praxis-mute)]">
                    Scenario-backed ROI from deterministic demo data, MTTR reduction, recurrence suppression, and impacted system context.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <ScenarioPicker
                    activeId={activeScenario.id}
                    onChange={(scenario) => {
                      setActiveScenario(scenario);
                      router.replace(hrefWithActiveCase("/value-case", getActiveCase(null, scenario.id)));
                    }}
                  />
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex min-h-10 items-center gap-2 border border-[var(--praxis-line)] bg-[var(--praxis-surface)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.01] hover:border-[var(--praxis-plasma)] disabled:opacity-60"
                  >
                    <Export size={14} />
                    {exporting ? "Exporting…" : "Export XLSX"}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 grid-flow-dense gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] text-[var(--praxis-argon)]">
                      <CurrencyDollar size={20} />
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Primary value driver</div>
                  </div>
                  <div className="mt-5 text-5xl font-semibold tracking-tight text-[var(--praxis-bone)]" style={{ lineHeight: 1 }}>
                    {fmtUsd(activeScenario.estimatedValueUsd)}
                  </div>
                  <div className="mt-2 font-mono text-sm text-[var(--praxis-mute)]">estimated annual value · {activeScenario.site}</div>

                  <div className="mt-6 space-y-3">
                    <Metric icon={<TrendDown size={15} />} label="MTTR reduction" value={`−${activeScenario.mttrReductionPct}%`} tone="var(--praxis-argon)" />
                    <Metric icon={<ChartBar size={15} />} label="Recurrence reduction" value={`−${activeScenario.recurrenceReductionPct}%`} tone="var(--praxis-plasma)" />
                    <Metric icon={<CurrencyDollar size={15} />} label="Confidence" value={activeScenario.confidenceScore.toFixed(2)} tone="var(--praxis-bone)" />
                  </div>
                </div>

                <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
                  <div className="mb-5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Value breakdown</div>
                  <div className="space-y-5">
                    {breakdown.map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm text-[var(--praxis-bone)]">{item.label}</span>
                          <span className="font-mono text-sm font-semibold text-[var(--praxis-bone)]">{fmtUsd(item.value)}</span>
                        </div>
                        <div className="h-2 overflow-hidden bg-[var(--praxis-surface-2)]">
                          <div
                            className="h-full opacity-80 transition-all duration-700"
                            style={{ width: `${item.pct}%`, background: item.color }}
                          />
                        </div>
                        <div className="mt-1 font-mono text-[10px] text-[var(--praxis-mute)]">{item.pct}% of total</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <aside className="col-span-12 border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 xl:col-span-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Impacted systems</div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {activeScenario.impactedSystems.map((sys) => (
                  <span key={sys} className="border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-2 py-1 font-mono text-[10px] text-[var(--praxis-mute)]">
                    {sys}
                  </span>
                ))}
              </div>

              <div className="mt-6 border-t border-[var(--praxis-line)] pt-5">
                <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Model assumptions</div>
                <div className="grid grid-cols-1 grid-flow-dense gap-2">
                  {assumptions.map((a) => (
                    <div key={a.label} className="border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-3 py-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{a.label}</div>
                      <div className="mt-1.5 font-mono text-sm font-medium text-[var(--praxis-bone)]">{a.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* All scenarios comparison */}
          <section className="border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] px-6 py-20 sm:px-8">
            <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">All scenarios · comparative value</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--praxis-line)]">
                    {["Scenario", "Site", "Category", "Annual Value", "MTTR −%", "Recurrence −%", "Confidence"].map((h) => (
                      <th key={h} className="pb-3 pr-4 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => {
                        setActiveScenario(s);
                        router.replace(hrefWithActiveCase("/value-case", getActiveCase(null, s.id)));
                      }}
                      className="cursor-pointer border-b border-[var(--praxis-line)] transition-transform duration-200 hover:scale-[1.005] hover:bg-[var(--praxis-surface)]"
                      style={{ background: s.id === activeScenario.id ? "var(--praxis-surface)" : undefined }}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--praxis-bone)]">{s.label}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-[var(--praxis-mute)]">{s.site}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-[var(--praxis-mute)]">{s.category}</td>
                      <td className="py-3 pr-4 font-mono text-sm font-semibold text-[var(--praxis-bone)]">{fmtUsd(s.estimatedValueUsd)}</td>
                      <td className="py-3 pr-4 font-mono text-sm text-[var(--praxis-argon)]">−{s.mttrReductionPct}%</td>
                      <td className="py-3 pr-4 font-mono text-sm text-[var(--praxis-plasma)]">−{s.recurrenceReductionPct}%</td>
                      <td className="py-3 pr-4 font-mono text-sm text-[var(--praxis-mute)]">{s.confidenceScore.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="font-mono text-xs text-[var(--praxis-mute)]">click a row to set active scenario</div>
              <div className="font-mono text-sm font-semibold text-[var(--praxis-bone)]">
                Total portfolio · {fmtUsd(scenarios.reduce((acc, s) => acc + s.estimatedValueUsd, 0))}/yr
              </div>
            </div>
          </section>
        </div>
      </div>
    </WorkbenchShell>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-4 py-3">
      <div className="flex items-center gap-2.5">
        <span style={{ color: tone }}>{icon}</span>
        <span className="text-sm text-[var(--praxis-mute)]">{label}</span>
      </div>
      <span className="font-mono text-sm font-semibold" style={{ color: tone }}>{value}</span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-[18px] transition-transform duration-700 ease-out hover:scale-[1.02]">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
      <div className="mt-3 font-display text-[38px] font-medium leading-none tracking-[-0.025em] text-[var(--praxis-bone)]">{value}</div>
      <div className="mt-3 font-mono text-[10px]" style={{ color: tone }}>{detail}</div>
    </article>
  );
}
