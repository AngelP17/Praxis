"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Sparkle, ArrowClockwise } from "@phosphor-icons/react";

import { postJsonWithTimeout } from "@/lib/client-api";
import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { ScenarioPicker } from "@/components/praxis/ScenarioPicker";
import { useToast } from "@/components/notifications";
import { SCENARIOS, SEVERITY_COLORS, type Scenario } from "@/lib/scenarios";

type RecommendationRow = {
  id: number;
  ticket_id: string;
  ticket_title: string;
  action_label: string;
  rationale: string;
  confidence: number;
  risk_level: string;
  status: "ready_for_operator" | "accepted" | "rejected";
  scenarioId: string;
};

function buildRows(scenario: Scenario): RecommendationRow[] {
  return [
    {
      id: 9000 + SCENARIOS.findIndex((s) => s.id === scenario.id) * 3,
      ticket_id: scenario.ticketId,
      ticket_title: scenario.title,
      action_label: scenario.recommendation,
      rationale: scenario.rationale,
      confidence: scenario.confidenceScore,
      risk_level: scenario.severity,
      status: "ready_for_operator",
      scenarioId: scenario.id,
    },
    {
      id: 9001 + SCENARIOS.findIndex((s) => s.id === scenario.id) * 3,
      ticket_id: scenario.ticketId,
      ticket_title: scenario.title,
      action_label: `Route ${scenario.ownerTeam} with evidence bundle · runbook ${scenario.runbookId}`,
      rationale: `Escalate to ${scenario.ownerTeam} with correlated signals from ${scenario.impactedSystems.slice(0, 2).join(", ")}. Priority score ${scenario.priorityScore.toFixed(2)}.`,
      confidence: Math.max(0.6, scenario.confidenceScore - 0.06),
      risk_level: scenario.severity === "critical" ? "high" : "medium",
      status: "ready_for_operator",
      scenarioId: scenario.id,
    },
    {
      id: 9002 + SCENARIOS.findIndex((s) => s.id === scenario.id) * 3,
      ticket_id: scenario.ticketId,
      ticket_title: scenario.title,
      action_label: "Attach replay packet before closure",
      rationale: "Preserve telemetry, decision score, operator note, and runbook link for post-incident review.",
      confidence: Math.max(0.55, scenario.confidenceScore - 0.12),
      risk_level: "low",
      status: "ready_for_operator",
      scenarioId: scenario.id,
    },
  ];
}

const STATUS_LABEL: Record<string, string> = {
  ready_for_operator: "pending",
  accepted: "accepted",
  rejected: "rejected",
};

const STATUS_BADGE: Record<string, string> = {
  ready_for_operator: "border-zinc-700/70 bg-zinc-900/70 text-zinc-400",
  accepted: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export default function RecommendationsPage() {
  const toast = useToast();
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [rows, setRows] = useState<RecommendationRow[]>(() => buildRows(SCENARIOS[0]));
  const [actioning, setActioning] = useState<Set<number>>(new Set());

  function handleScenarioChange(scenario: Scenario) {
    setActiveScenario(scenario);
    setRows(buildRows(scenario));
    setActioning(new Set());
  }

  const pending = rows.filter((r) => r.status === "ready_for_operator").length;
  const accepted = rows.filter((r) => r.status === "accepted").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;

  async function handleAction(row: RecommendationRow, mode: "accept" | "reject") {
    if (actioning.has(row.id)) return;
    setActioning((prev) => new Set(prev).add(row.id));

    const optimisticStatus = mode === "accept" ? "accepted" : "rejected";
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: optimisticStatus } : r)));

    try {
      await postJsonWithTimeout(
        mode === "accept" ? `/api/recommendations/${row.id}/accept` : `/api/recommendations/${row.id}/reject`,
        mode === "accept"
          ? { note: `Accepted via Recommendations · ${row.ticket_id}` }
          : { reason: `Rejected via Recommendations · ${row.ticket_id}` }
      );
    } catch {
      // keep optimistic update — API unavailable in demo
    }

    if (mode === "accept") {
      toast.success(
        "Recommendation accepted",
        `${row.action_label.slice(0, 60)}${row.action_label.length > 60 ? "…" : ""} · ${row.ticket_id}`
      );
    } else {
      toast.info(
        "Recommendation rejected",
        `${row.ticket_id} · logged for audit trail`
      );
    }

    setActioning((prev) => {
      const next = new Set(prev);
      next.delete(row.id);
      return next;
    });
  }

  function handleReset() {
    setRows(buildRows(activeScenario));
    setActioning(new Set());
    toast.info("Queue reset", `${activeScenario.label} · ${buildRows(activeScenario).length} recommendations loaded`);
  }

  const sevClasses = SEVERITY_COLORS[activeScenario.severity] ?? SEVERITY_COLORS.medium;

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Recommendations" />
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">

          {/* Header */}
          <section className="praxis-v2-panel-enhanced p-8 sm:p-10 py-20 sm:py-24">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex-1">
                <div className="praxis-v2-eyebrow-enhanced">Intelligent Automation Queue</div>
                <h1 className="mt-4 font-semibold tracking-tight text-zinc-50" style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)", lineHeight: "1.1" }}>
                  Recommendations
                </h1>
                <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Astraea-scored action items derived from live signals. Accept to queue for execution, reject to log and suppress.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ScenarioPicker activeId={activeScenario.id} onChange={handleScenarioChange} />
                <button
                  onClick={handleReset}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/60 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 transition-all duration-300 hover:scale-105"
                >
                  <ArrowClockwise size={14} />
                  Reset
                </button>
              </div>
            </div>
          </section>

          {/* Stats bar */}
          <div className="grid grid-flow-dense grid-cols-3 gap-4">
            {[
              { label: "Pending", value: pending, color: "text-zinc-100" },
              { label: "Accepted", value: accepted, color: "text-emerald-400" },
              { label: "Rejected", value: rejected, color: "text-rose-400" },
            ].map((stat) => (
              <div key={stat.label} className="praxis-v2-panel-enhanced p-4 sm:p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">{stat.label}</div>
                <div className={`mono-data mt-1 text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Recommendation rows */}
          <div className="praxis-v2-panel-enhanced p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div className="praxis-v2-eyebrow-enhanced">
                {activeScenario.icon} {activeScenario.label} · {activeScenario.ticketId}
              </div>
              <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] ${sevClasses}`}>
                {activeScenario.severity}
              </span>
            </div>

            <div className="space-y-3">
              {rows.map((row) => {
                const isDone = row.status !== "ready_for_operator";
                const isActioning = actioning.has(row.id);
                return (
                  <div
                    key={row.id}
                    className={`rounded-xl border bg-zinc-900/60 px-4 py-4 transition-all duration-500 ${
                      isDone ? "border-zinc-800/40 opacity-55" : "border-zinc-800"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">#{row.id}</span>
                        <span className="font-mono text-[10px] text-zinc-600">·</span>
                        <span className="font-mono text-[10px] text-violet-400">{row.ticket_id}</span>
                      </div>
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] ${STATUS_BADGE[row.status]}`}>
                        {STATUS_LABEL[row.status]}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-zinc-100 mb-1">{row.action_label}</div>
                    <div className="text-xs text-zinc-400 leading-relaxed">{row.rationale}</div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-zinc-700/60 bg-zinc-800/50 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                        conf {row.confidence.toFixed(2)}
                      </span>
                      <span className="rounded-full border border-zinc-700/60 bg-zinc-800/50 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                        risk {row.risk_level}
                      </span>

                      {!isDone && (
                        <>
                          <button
                            onClick={() => void handleAction(row, "accept")}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckCircle size={12} />
                            {isActioning ? "…" : "Accept"}
                          </button>
                          <button
                            onClick={() => void handleAction(row, "reject")}
                            disabled={isActioning}
                            className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={12} />
                            {isActioning ? "…" : "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All scenarios quick list */}
          <div className="praxis-v2-panel-enhanced p-6 sm:p-8">
            <div className="praxis-v2-eyebrow-enhanced mb-5">All scenarios · select to load recommendations</div>
            <div className="grid grid-flow-dense grid-cols-2 gap-2 sm:grid-cols-4">
              {SCENARIOS.map((s, i) => {
                const sc = SEVERITY_COLORS[s.severity] ?? SEVERITY_COLORS.medium;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleScenarioChange(s)}
                    className={`rounded-xl border px-3 py-3 text-left transition-all duration-200 hover:scale-[1.02] ${
                      s.id === activeScenario.id
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-zinc-700/60 bg-zinc-800/40 hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{s.icon}</span>
                      <span className="font-mono text-[10px] text-zinc-600">{i + 1}</span>
                    </div>
                    <div className="text-xs font-medium text-zinc-100 leading-snug">{s.label}</div>
                    <div className={`mt-1 font-mono text-[10px] ${sc}`}>{s.severity}</div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </CommandShell>
  );
}
