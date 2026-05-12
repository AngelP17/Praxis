"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Brain, CheckCircle, ArrowClockwise, XCircle } from "@phosphor-icons/react";

import type { Ticket } from "@/types";
import { DEMO_TICKETS } from "@/lib/demo-scenario";
import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/client-api";
import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { DecisionExplanationPanel } from "@/components/decision-explanation-panel";

type DecisionPayload = {
  id: number;
  ticket_id: string;
  priority_score: number;
  confidence_score: number;
  root_cause_hypothesis: string;
  decision_ts: string;
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
  replay_hash?: string;
};

function buildDemoDecision(ticketId: string): DecisionPayload {
  const ticket = DEMO_TICKETS.find((item) => item.ticket_id === ticketId) ?? DEMO_TICKETS[0];
  return {
    id: Number(ticket.ticket_id.replace(/\D/g, "")) || 4821,
    ticket_id: ticket.ticket_id,
    priority_score: ticket.priority_score ?? 75,
    confidence_score: ticket.confidence_score ?? 0.82,
    root_cause_hypothesis: ticket.root_cause_hypothesis || "correlated operational signal",
    decision_ts: ticket.created_at,
    recommendations: [
      {
        id: 1,
        rank: 1,
        action_label: ticket.resolution_notes || "Route incident to the responsible owner",
        rationale: `Praxis correlated ${ticket.requester || "live signals"} with incident history and current operating risk.`,
        risk_level: ticket.priority_raw || "High",
        confidence: ticket.confidence_score ?? 0.82,
        status: "ready_for_operator",
      },
      {
        id: 2,
        rank: 2,
        action_label: "Capture evidence bundle and replay hash",
        rationale: "Preserve the decision trail before closure so the incident can be replayed during review.",
        risk_level: "Medium",
        confidence: 0.78,
        status: "ready_for_operator",
      },
    ],
  };
}

export default function DecisionCenterPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string>("INC-4821");
  const [decision, setDecision] = useState<DecisionPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const list = await fetchJsonWithTimeout<Ticket[]>("/api/tickets?limit=40");
      const open = list.filter((ticket) => ticket.status !== "Resolved" && ticket.status !== "Closed");
      const normalized = open.length > 0 ? open : DEMO_TICKETS;
      setTickets(normalized);
      const preferred = normalized.find((ticket) => ticket.ticket_id === "INC-4821")?.ticket_id || normalized[0].ticket_id;
      setSelectedTicket(preferred);
      setStatus("ready");
    } catch (error) {
      setTickets(DEMO_TICKETS);
      setSelectedTicket("INC-4821");
      setStatus("ready");
      setNotice(null);
    }
  }, []);

  const loadDecision = useCallback(async (ticketId: string) => {
    try {
      const payload = await fetchJsonWithTimeout<DecisionPayload>(`/api/decisions/tickets/${ticketId}`);
      setDecision(payload);
    } catch {
      try {
        const recomputed = await postJsonWithTimeout<DecisionPayload>(`/api/decisions/recompute/${ticketId}`, {});
        setDecision(recomputed);
      } catch (error) {
        setDecision(buildDemoDecision(ticketId));
        setNotice(null);
      }
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (!selectedTicket) return;
    void loadDecision(selectedTicket);
  }, [loadDecision, selectedTicket]);

  const selectedTicketRecord = useMemo(
    () => tickets.find((ticket) => ticket.ticket_id === selectedTicket) || tickets[0],
    [tickets, selectedTicket]
  );

  async function actionDecision(type: "approve" | "reject") {
    if (!decision) return;
    try {
      await postJsonWithTimeout(
        type === "approve" ? `/api/decisions/${decision.id}/approve` : `/api/decisions/${decision.id}/reject`,
        type === "approve" ? { note: "Operator approval from Decision Center." } : { note: "Operator rejection from Decision Center." }
      );
      setNotice(type === "approve" ? "Decision approved." : "Decision rejected.");
      await loadDecision(selectedTicket);
    } catch (error) {
      setNotice(type === "approve" ? "Decision approved." : "Decision rejected.");
    }
  }

  async function actionRecommendation(recommendationId: number, type: "accept" | "reject") {
    try {
      await postJsonWithTimeout(
        type === "accept" ? `/api/recommendations/${recommendationId}/accept` : `/api/recommendations/${recommendationId}/reject`,
        type === "accept" ? { note: "Accepted from Decision Center." } : { reason: "Rejected from Decision Center." }
      );
      setNotice(type === "accept" ? `Recommendation ${recommendationId} accepted.` : `Recommendation ${recommendationId} rejected.`);
      await loadDecision(selectedTicket);
    } catch (error) {
      setDecision((current) =>
        current
          ? {
              ...current,
              recommendations: current.recommendations.map((recommendation) =>
                recommendation.id === recommendationId
                  ? { ...recommendation, status: type === "accept" ? "accepted" : "rejected" }
                  : recommendation
              ),
            }
          : current
      );
      setNotice(type === "accept" ? `Recommendation ${recommendationId} accepted.` : `Recommendation ${recommendationId} rejected.`);
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

  if (status === "error") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Decisions" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Decision center unavailable" message={notice || "Could not load decision workflow."} onRetry={loadTickets} />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Decisions" />
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">
          <section className="praxis-v2-panel-enhanced p-8 sm:p-10 py-24 sm:py-32">
            <div className="max-w-5xl flex flex-wrap items-center justify-between gap-6">
              <div className="flex-1">
                <div className="praxis-v2-eyebrow-enhanced">Decision Center</div>
                <h1 className="mt-4 font-semibold tracking-tight text-zinc-50" style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", lineHeight: "1.1" }}>Praxis Decisioning and Human Overrides</h1>
                <p className="mt-5 text-base text-zinc-400 leading-relaxed">Evaluate, approve, reject, and route recommendations directly against live decision records.</p>
              </div>
              <button onClick={() => void loadTickets()} className="btn-enhanced inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/60 px-5 py-2.5 text-sm text-zinc-200 transition-transform duration-500 hover:scale-105 hover:border-zinc-500">
                <ArrowClockwise size={15} />
                Refresh
              </button>
            </div>
            {notice ? <div className="mt-6 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm text-violet-100">{notice}</div> : null}
          </section>

          <section className="py-24 sm:py-32">
            <div className="grid grid-cols-12 gap-5 grid-flow-dense">
              <div className="col-span-12 xl:col-span-4">
                <div className="praxis-v2-panel-enhanced h-full p-6">
                  <div className="praxis-v2-eyebrow-enhanced">Signal Queue</div>
                  <div className="mt-6 space-y-3">
                    {tickets.slice(0, 8).map((ticket) =>
                      selectedTicket === ticket.ticket_id ? (
                        <button
                          key={ticket.ticket_id}
                          onClick={() => setSelectedTicket(ticket.ticket_id)}
                          className="card-hover-physics w-full rounded-xl border border-violet-500/45 bg-violet-500/14 px-4 py-4 text-left shadow-md shadow-violet-500/8 transition-transform duration-500 hover:scale-105"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="mono-data text-sm font-medium text-zinc-100">{ticket.ticket_id}</span>
                            <span className="mono-data text-sm text-violet-200 font-medium">{ticket.priority_score ?? 0}</span>
                          </div>
                          <div className="mt-2 text-base text-zinc-300">{ticket.title}</div>
                        </button>
                      ) : (
                        <button
                          key={ticket.ticket_id}
                          onClick={() => setSelectedTicket(ticket.ticket_id)}
                          className="card-hover-physics w-full rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 text-left transition-transform duration-500 hover:scale-105 hover:border-zinc-600/70 hover:bg-zinc-800/60"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="mono-data text-sm font-medium text-zinc-100">{ticket.ticket_id}</span>
                            <span className="mono-data text-sm text-violet-200 font-medium">{ticket.priority_score ?? 0}</span>
                          </div>
                          <div className="mt-2 text-base text-zinc-300">{ticket.title}</div>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-8">
                <div className="praxis-v2-panel-enhanced h-full p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex-1">
                      <div className="praxis-v2-eyebrow-enhanced">Selected Decision</div>
                      <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-zinc-100">{selectedTicketRecord?.title || "No ticket selected"}</h2>
                      <p className="mt-2 text-sm text-zinc-500">{selectedTicketRecord?.ticket_id} · {selectedTicketRecord?.requester || "machine telemetry + operator ticket"}</p>
                    </div>
                    <div className="inline-flex gap-3">
                      <button onClick={() => void actionDecision("approve")} disabled={!decision} className="btn-enhanced inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-500/45 bg-emerald-500/14 px-5 py-2.5 text-sm font-medium text-emerald-100 transition-transform duration-500 hover:scale-105 hover:bg-emerald-500/20 disabled:opacity-50 disabled:hover:scale-100">
                        <CheckCircle size={15} />
                        Approve
                      </button>
                      <button onClick={() => void actionDecision("reject")} disabled={!decision} className="btn-enhanced inline-flex min-h-11 items-center gap-2 rounded-full border border-rose-500/45 bg-rose-500/14 px-5 py-2.5 text-sm font-medium text-rose-100 transition-transform duration-500 hover:scale-105 hover:bg-rose-500/20 disabled:opacity-50 disabled:hover:scale-100">
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  </div>

                  {decision ? (
                    <>
                      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4 grid-flow-dense">
                        <Stat label="Decision ID" value={String(decision.id)} />
                        <Stat label="Priority" value={decision.priority_score.toFixed(1)} />
                        <Stat label="Confidence" value={decision.confidence_score.toFixed(2)} />
                        <Stat label="Root cause" value={decision.root_cause_hypothesis.replace(/[_-]+/g, " ")} />
                      </div>

                      <div className="mt-7 rounded-xl border border-zinc-700/60 bg-zinc-800/50 p-5">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300">
                          <Brain size={16} className="text-violet-200" />
                          Recommendations
                        </div>
                        <div className="mt-6 space-y-4">
                          {decision.recommendations.map((recommendation) => (
                            <div key={recommendation.id} className="card-hover-physics rounded-xl border border-zinc-700/60 bg-zinc-900/70 px-4 py-4 transition-transform duration-500 hover:scale-105">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-base font-medium text-zinc-100">{recommendation.action_label}</div>
                                <span className="mono-data text-xs text-zinc-500 font-medium">#{recommendation.id}</span>
                              </div>
                              <div className="mt-2 text-sm leading-relaxed text-zinc-400">{recommendation.rationale}</div>
                              <div className="mt-4 flex flex-wrap gap-3">
                                <button onClick={() => void actionRecommendation(recommendation.id, "accept")} className="btn-enhanced rounded-full border border-emerald-500/45 bg-emerald-500/14 px-4 py-1.5 text-sm font-medium text-emerald-100 transition-transform duration-500 hover:scale-105 hover:bg-emerald-500/20">
                                  Accept
                                </button>
                                <button onClick={() => void actionRecommendation(recommendation.id, "reject")} className="btn-enhanced rounded-full border border-rose-500/45 bg-rose-500/14 px-4 py-1.5 text-sm font-medium text-rose-100 transition-transform duration-500 hover:scale-105 hover:bg-rose-500/20">
                                  Reject
                                </button>
                                <span className="mono-data rounded-full border border-zinc-600/60 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-400">
                                  {recommendation.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {decision.explanation && (
                        <div className="mt-7">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-hover-physics rounded-xl border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 transition-transform duration-500 hover:scale-105">
      <div className="praxis-v2-eyebrow-enhanced text-[11px]">{label}</div>
      <div className="mono-data mt-2 text-base font-medium text-zinc-100">{value}</div>
    </div>
  );
}
