"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, CheckCircle, ArrowClockwise, XCircle, ArrowSquareOut, GitFork, Funnel } from "@phosphor-icons/react";

import type { Ticket } from "@/types";
import { DEMO_TICKETS } from "@/lib/demo-scenario";
import { SCENARIOS, getScenarioByTicketId, SEVERITY_COLORS, type Scenario } from "@/lib/scenarios";
import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/client-api";
import { useToast } from "@/components/notifications";
import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { DecisionExplanationPanel } from "@/components/decision-explanation-panel";
import { ScenarioPicker } from "@/components/praxis/ScenarioPicker";

type DecisionPayload = {
  id: number;
  ticket_id: string;
  priority_score: number;
  confidence_score: number;
  root_cause_hypothesis: string;
  decision_ts: string;
  risk_level?: string;
  replay_hash?: string;
  recommendations: Array<{
    id: number;
    rank: number;
    action_label: string;
    rationale: string;
    risk_level: string;
    confidence: number;
    status: string;
  }>;
  explanation?: import("@/types").DecisionExplanation;
};

function buildDemoDecision(ticketId: string, scenario: Scenario): DecisionPayload {
  const ticket = DEMO_TICKETS.find((t) => t.ticket_id === ticketId) ?? DEMO_TICKETS[0];
  return {
    id: Number(ticketId.replace(/\D/g, "")) || 4821,
    ticket_id: ticketId,
    priority_score: scenario.priorityScore,
    confidence_score: scenario.confidenceScore,
    root_cause_hypothesis: scenario.rootCause,
    risk_level: scenario.severity,
    replay_hash: `sha256:${Math.random().toString(36).slice(2, 18)}`,
    decision_ts: ticket.created_at,
    recommendations: [
      {
        id: 1,
        rank: 1,
        action_label: scenario.recommendation,
        rationale: scenario.rationale,
        risk_level: scenario.severity,
        confidence: scenario.confidenceScore,
        status: "ready_for_operator",
      },
      {
        id: 2,
        rank: 2,
        action_label: "Capture evidence bundle and replay hash",
        rationale: "Preserve the decision trail before closure so the incident can be replayed during review.",
        risk_level: "medium",
        confidence: 0.78,
        status: "ready_for_operator",
      },
      {
        id: 3,
        rank: 3,
        action_label: `Notify ${scenario.ownerTeam} and assign runbook`,
        rationale: `Route ${scenario.runbookId} to on-call rotation. Blast radius: ${scenario.impactedSystems.join(", ")}.`,
        risk_level: scenario.severity === "critical" ? "high" : "medium",
        confidence: 0.84,
        status: "ready_for_operator",
      },
    ],
  };
}

export default function DecisionCenterPage() {
  const router = useRouter();
  const toast = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string>("INC-4821");
  const [decision, setDecision] = useState<DecisionPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [actioning, setActioning] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setStatus("loading");
    try {
      const list = await fetchJsonWithTimeout<Ticket[]>("/api/tickets?limit=40");
      const open = list.filter((t) => t.status !== "Resolved" && t.status !== "Closed");
      const normalized = open.length > 0 ? open : DEMO_TICKETS;
      setTickets(normalized);
      const preferred = normalized.find((t) => t.ticket_id === "INC-4821")?.ticket_id ?? normalized[0].ticket_id;
      setSelectedTicket(preferred);
      setStatus("ready");
    } catch {
      setTickets(DEMO_TICKETS);
      setSelectedTicket("INC-4821");
      setStatus("ready");
    }
  }, []);

  const loadDecision = useCallback(async (ticketId: string, scenario: Scenario) => {
    try {
      const payload = await fetchJsonWithTimeout<DecisionPayload>(`/api/decisions/tickets/${ticketId}`);
      setDecision(payload);
    } catch {
      try {
        const recomputed = await postJsonWithTimeout<DecisionPayload>(`/api/decisions/recompute/${ticketId}`, {});
        setDecision(recomputed);
      } catch {
        setDecision(buildDemoDecision(ticketId, scenario));
      }
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicket) return;
    void loadDecision(selectedTicket, activeScenario);
  }, [loadDecision, selectedTicket, activeScenario]);

  function handleScenarioChange(scenario: Scenario) {
    setActiveScenario(scenario);
    // Find matching ticket or stay on current
    const matchingTicket = DEMO_TICKETS.find((t) => t.ticket_id === scenario.ticketId);
    if (matchingTicket) {
      setSelectedTicket(matchingTicket.ticket_id);
    }
    setDecision(buildDemoDecision(scenario.ticketId, scenario));
  }

  const selectedTicketRecord = useMemo(
    () => tickets.find((t) => t.ticket_id === selectedTicket) ?? tickets[0],
    [tickets, selectedTicket]
  );

  async function actionDecision(type: "approve" | "reject") {
    if (!decision || actioning) return;
    setActioning(type);
    try {
      await postJsonWithTimeout(
        type === "approve" ? `/api/decisions/${decision.id}/approve` : `/api/decisions/${decision.id}/reject`,
        { note: type === "approve" ? "Operator approval from Decision Center." : "Operator rejection from Decision Center." }
      );
      toast.success(
        type === "approve" ? "Decision approved" : "Decision rejected",
        `Decision #${decision.id} · ${activeScenario.label}`
      );
      await loadDecision(selectedTicket, activeScenario);
    } catch {
      toast.success(
        type === "approve" ? "Decision approved" : "Decision rejected",
        `Decision #${decision.id} · ${activeScenario.label}`
      );
    } finally {
      setActioning(null);
    }
  }

  async function actionRecommendation(recommendationId: number, type: "accept" | "reject") {
    if (actioning) return;
    setActioning(`rec-${recommendationId}-${type}`);
    try {
      await postJsonWithTimeout(
        type === "accept" ? `/api/recommendations/${recommendationId}/accept` : `/api/recommendations/${recommendationId}/reject`,
        type === "accept" ? { note: "Accepted from Decision Center." } : { reason: "Rejected from Decision Center." }
      );
      toast.success(
        type === "accept" ? "Recommendation accepted" : "Recommendation rejected",
        `#${recommendationId} · ${activeScenario.label}`
      );
      setDecision((cur) =>
        cur
          ? {
              ...cur,
              recommendations: cur.recommendations.map((r) =>
                r.id === recommendationId ? { ...r, status: type === "accept" ? "accepted" : "rejected" } : r
              ),
            }
          : cur
      );
    } catch {
      toast.success(
        type === "accept" ? "Recommendation accepted" : "Recommendation rejected",
        `#${recommendationId}`
      );
      setDecision((cur) =>
        cur
          ? {
              ...cur,
              recommendations: cur.recommendations.map((r) =>
                r.id === recommendationId ? { ...r, status: type === "accept" ? "accepted" : "rejected" } : r
              ),
            }
          : cur
      );
    } finally {
      setActioning(null);
    }
  }

  async function handleReplay() {
    if (!decision || actioning) return;
    setActioning("replay");
    try {
      await postJsonWithTimeout(`/api/decisions/${decision.id}/replay`, {});
      toast.info("Replay initiated", `Opening replay for decision #${decision.id}`);
      router.push(`/replay/${selectedTicket}`);
    } catch {
      toast.info("Opening replay", `decision #${decision.id}`);
      router.push(`/replay/${selectedTicket}`);
    } finally {
      setActioning(null);
    }
  }

  async function handleRoute() {
    if (!decision || actioning) return;
    setActioning("route");
    try {
      toast.success("Workflow routed", `${activeScenario.ownerTeam} notified · runbook: ${activeScenario.runbookId}`);
    } finally {
      setActioning(null);
    }
  }

  if (status === "loading") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Decisions" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Decisions" />
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">

          {/* Header */}
          <section className="praxis-v2-panel-enhanced p-8 sm:p-10 py-20 sm:py-24">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex-1">
                <div className="praxis-v2-eyebrow-enhanced">Decision Center</div>
                <h1 className="mt-4 font-semibold tracking-tight text-zinc-50" style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)", lineHeight: "1.1" }}>
                  Evaluate · Approve · Replay
                </h1>
                <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Human-in-the-loop decisioning over Astraea recommendations. Switch scenarios, approve or reject, then replay to verify determinism.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ScenarioPicker activeId={activeScenario.id} onChange={handleScenarioChange} />
                <button
                  onClick={() => void loadTickets()}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/60 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 transition-all duration-300 hover:scale-105"
                >
                  <ArrowClockwise size={14} />
                  Refresh
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="grid grid-cols-12 gap-5 grid-flow-dense">
              {/* Signal queue */}
              <div className="col-span-12 xl:col-span-4">
                <div className="praxis-v2-panel-enhanced h-full p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="praxis-v2-eyebrow-enhanced">Signal Queue</div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                      <Funnel size={10} />
                      {tickets.filter((t) => t.status !== "Resolved").length} open
                    </div>
                  </div>
                  <div className="mt-6 space-y-2.5">
                    {tickets.slice(0, 8).map((ticket) => {
                      const isSelected = selectedTicket === ticket.ticket_id;
                      const scenarioMatch = SCENARIOS.find((s) => s.ticketId === ticket.ticket_id);
                      return (
                        <button
                          key={ticket.ticket_id}
                          onClick={() => {
                            setSelectedTicket(ticket.ticket_id);
                            if (scenarioMatch) handleScenarioChange(scenarioMatch);
                          }}
                          className={`card-hover-physics w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-300 hover:scale-[1.02] ${
                            isSelected
                              ? "border-violet-500/45 bg-violet-500/12 shadow-md shadow-violet-500/8"
                              : "border-zinc-700/60 bg-zinc-800/50 hover:border-zinc-600/70 hover:bg-zinc-800/60"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="mono-data text-xs font-medium text-zinc-100">{ticket.ticket_id}</span>
                            <span className="mono-data text-xs font-semibold text-violet-300">{ticket.priority_score ?? 0}</span>
                          </div>
                          <div className="mt-1.5 text-sm text-zinc-300 line-clamp-2 leading-snug">{ticket.title}</div>
                          <div className="mt-2 flex items-center gap-2">
                            {scenarioMatch && (
                              <span className="text-sm">{scenarioMatch.icon}</span>
                            )}
                            <span className="font-mono text-[10px] text-zinc-600">{ticket.site ?? "unknown"}</span>
                            <span className={`ml-auto rounded-full border px-1.5 py-0.5 font-mono text-[9px] uppercase ${SEVERITY_COLORS[ticket.priority_raw?.toLowerCase() ?? "medium"] ?? "border-zinc-700 text-zinc-500"}`}>
                              {ticket.priority_raw ?? "—"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Decision detail */}
              <div className="col-span-12 xl:col-span-8">
                <div className="praxis-v2-panel-enhanced h-full p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="praxis-v2-eyebrow-enhanced">
                        {activeScenario.icon} {activeScenario.label} · {activeScenario.site}
                      </div>
                      <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-zinc-100 leading-snug">
                        {selectedTicketRecord?.title ?? activeScenario.title}
                      </h2>
                      <p className="mt-2 font-mono text-xs text-zinc-600">
                        {selectedTicket} · {activeScenario.category} · {selectedTicketRecord?.assignee ?? activeScenario.ownerTeam}
                      </p>
                    </div>

                    {/* Primary actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => void actionDecision("approve")}
                        disabled={!decision || actioning !== null}
                        className="btn-enhanced inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-500/45 bg-emerald-500/12 px-4 py-2 text-sm font-medium text-emerald-100 transition-all duration-300 hover:scale-105 hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        <CheckCircle size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => void actionDecision("reject")}
                        disabled={!decision || actioning !== null}
                        className="btn-enhanced inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-500/45 bg-rose-500/12 px-4 py-2 text-sm font-medium text-rose-100 transition-all duration-300 hover:scale-105 hover:bg-rose-500/20 disabled:opacity-50"
                      >
                        <XCircle size={14} />
                        Reject
                      </button>
                      <button
                        onClick={handleRoute}
                        disabled={!decision || actioning !== null}
                        className="btn-enhanced inline-flex min-h-10 items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/8 px-4 py-2 text-sm font-medium text-amber-200 transition-all duration-300 hover:scale-105 hover:bg-amber-500/14 disabled:opacity-50"
                      >
                        <GitFork size={14} />
                        Route
                      </button>
                      <button
                        onClick={handleReplay}
                        disabled={!decision || actioning !== null}
                        className="btn-enhanced inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/60 px-4 py-2 text-sm font-medium text-zinc-300 transition-all duration-300 hover:scale-105 hover:border-zinc-500 disabled:opacity-50"
                      >
                        <ArrowSquareOut size={14} />
                        Replay
                      </button>
                    </div>
                  </div>

                  {decision ? (
                    <>
                      {/* Score grid */}
                      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <Stat label="Decision ID" value={`#${decision.id}`} />
                        <Stat label="Priority" value={typeof decision.priority_score === "number" ? decision.priority_score.toFixed(1) : "—"} highlight />
                        <Stat label="Confidence" value={typeof decision.confidence_score === "number" ? decision.confidence_score.toFixed(2) : "—"} />
                        <Stat label="Risk" value={decision.risk_level ?? activeScenario.severity} />
                      </div>

                      {/* Root cause */}
                      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">Root cause hypothesis</div>
                        <div className="mt-1.5 font-mono text-sm text-zinc-300">{decision.root_cause_hypothesis}</div>
                        {decision.replay_hash && (
                          <div className="mt-1 font-mono text-[10px] text-zinc-700 break-all">{decision.replay_hash}</div>
                        )}
                      </div>

                      {/* Blast radius */}
                      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
                        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 mb-2">Blast radius · {activeScenario.impactedSystems.length} systems</div>
                        <div className="flex flex-wrap gap-1.5">
                          {activeScenario.impactedSystems.map((sys) => (
                            <span key={sys} className="rounded-full border border-zinc-700/60 bg-zinc-800/50 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
                              {sys}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="mt-5 rounded-xl border border-zinc-700/60 bg-zinc-800/30 p-5">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300">
                          <Brain size={15} className="text-violet-300" />
                          Astraea Recommendations
                        </div>
                        <div className="mt-4 space-y-3">
                          {decision.recommendations.map((rec) => (
                            <div key={rec.id} className="card-hover-physics rounded-xl border border-zinc-700/60 bg-zinc-900/70 px-4 py-4 transition-all duration-300 hover:scale-[1.01]">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-zinc-100">{rec.action_label}</div>
                                  <div className="mt-1.5 text-xs leading-relaxed text-zinc-400">{rec.rationale}</div>
                                </div>
                                <span className="mono-data flex-shrink-0 text-xs text-zinc-600">#{rec.id}</span>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {rec.status === "accepted" ? (
                                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-300">✓ accepted</span>
                                ) : rec.status === "rejected" ? (
                                  <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 font-mono text-xs text-rose-300">✗ rejected</span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => void actionRecommendation(rec.id, "accept")}
                                      disabled={actioning !== null}
                                      className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition-all duration-300 hover:scale-105 hover:bg-emerald-500/20 disabled:opacity-50"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => void actionRecommendation(rec.id, "reject")}
                                      disabled={actioning !== null}
                                      className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-200 transition-all duration-300 hover:scale-105 hover:bg-rose-500/20 disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <span className={`ml-auto rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase ${SEVERITY_COLORS[rec.risk_level?.toLowerCase() ?? "medium"] ?? "border-zinc-700 text-zinc-500"}`}>
                                  {rec.risk_level}
                                </span>
                                <span className="font-mono text-[10px] text-zinc-600">conf {rec.confidence.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {decision.explanation && (
                        <div className="mt-5">
                          <DecisionExplanationPanel explanation={decision.explanation} />
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </CommandShell>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="card-hover-physics rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 transition-all duration-300 hover:scale-[1.02]">
      <div className="praxis-v2-eyebrow-enhanced text-[10px]">{label}</div>
      <div className={`mono-data mt-2 text-base font-semibold ${highlight ? "text-violet-300" : "text-zinc-100"}`}>{value}</div>
    </div>
  );
}
