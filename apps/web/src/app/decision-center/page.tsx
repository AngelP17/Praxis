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
};

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
      setNotice(error instanceof Error ? `Demo scenario active: ${error.message}` : "Demo scenario active.");
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
        setDecision(null);
        setNotice(error instanceof Error ? error.message : "Decision API unavailable.");
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
      setNotice(error instanceof Error ? error.message : "Decision action failed.");
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
      setNotice(error instanceof Error ? error.message : "Recommendation action failed.");
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
          <section className="sentinel-v2-panel-strong p-6 sm:p-8 py-20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="sentinel-v2-eyebrow">Decision Center</div>
                <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight text-zinc-50 sm:text-[2rem]">Astraea Decisioning and Human Overrides</h1>
                <p className="mt-3 text-sm text-zinc-400">Evaluate, approve, reject, and route recommendations directly against live decision records.</p>
              </div>
              <button onClick={() => void loadTickets()} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/60 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-500 hover:bg-zinc-700/60 hover:scale-105 transition-transform duration-500">
                <ArrowClockwise size={14} />
                Refresh
              </button>
            </div>
            {notice ? <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100">{notice}</div> : null}
          </section>

          <section className="grid grid-cols-12 gap-4 grid-flow-dense py-20">
            <div className="col-span-12 xl:col-span-4">
              <div className="sentinel-v2-panel h-full p-5">
                <div className="sentinel-v2-eyebrow">Signal Queue</div>
                <div className="mt-4 space-y-2.5">
                  {tickets.slice(0, 8).map((ticket) =>
                    selectedTicket === ticket.ticket_id ? (
                      <button
                        key={ticket.ticket_id}
                        onClick={() => setSelectedTicket(ticket.ticket_id)}
                        className="w-full rounded-lg border px-3.5 py-3 text-left transition border-amber-500/40 bg-amber-500/12 shadow-sm shadow-amber-500/5 hover:scale-105 transition-transform duration-500"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="mono-data text-xs font-medium text-zinc-100">{ticket.ticket_id}</span>
                          <span className="mono-data text-xs text-amber-200">{ticket.priority_score ?? 0}</span>
                        </div>
                        <div className="mt-1.5 text-sm text-zinc-300">{ticket.title}</div>
                      </button>
                    ) : (
                      <button
                        key={ticket.ticket_id}
                        onClick={() => setSelectedTicket(ticket.ticket_id)}
                        className="w-full rounded-lg border px-3.5 py-3 text-left transition border-zinc-700/50 bg-zinc-800/40 hover:border-zinc-600/60 hover:bg-zinc-800/60 hover:scale-105 transition-transform duration-500"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="mono-data text-xs font-medium text-zinc-100">{ticket.ticket_id}</span>
                          <span className="mono-data text-xs text-amber-200">{ticket.priority_score ?? 0}</span>
                        </div>
                        <div className="mt-1.5 text-sm text-zinc-300">{ticket.title}</div>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-8">
              <div className="sentinel-v2-panel-strong h-full p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="sentinel-v2-eyebrow">Selected Decision</div>
                    <h2 className="mt-2 text-xl font-semibold text-zinc-100">{selectedTicketRecord?.title || "No ticket selected"}</h2>
                    <p className="mt-1.5 text-xs text-zinc-500">{selectedTicketRecord?.ticket_id} · {selectedTicketRecord?.requester || "machine telemetry + operator ticket"}</p>
                  </div>
                  <div className="inline-flex gap-2">
                    <button onClick={() => void actionDecision("approve")} disabled={!decision} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/18 disabled:opacity-50 hover:scale-105 transition-transform duration-500">
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button onClick={() => void actionDecision("reject")} disabled={!decision} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-rose-500/35 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-500/18 disabled:opacity-50 hover:scale-105 transition-transform duration-500">
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>

                {!decision ? (
                  <div className="mt-5 rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-4 py-3.5 text-sm text-zinc-400">No decision record returned yet for this ticket.</div>
                ) : (
                  <>
                    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 grid-flow-dense">
                      <Stat label="Decision ID" value={String(decision.id)} />
                      <Stat label="Priority" value={decision.priority_score.toFixed(1)} />
                      <Stat label="Confidence" value={decision.confidence_score.toFixed(2)} />
                      <Stat label="Root cause" value={decision.root_cause_hypothesis.replace(/[_-]+/g, " ")} />
                    </div>

                    <div className="mt-5 rounded-xl border border-zinc-700/50 bg-zinc-800/40 p-4">
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300">
                        <Brain size={14} className="text-amber-200" />
                        Recommendations
                      </div>
                      <div className="mt-4 space-y-3">
                        {decision.recommendations.map((recommendation) => (
                          <div key={recommendation.id} className="rounded-lg border border-zinc-700/50 bg-zinc-900/60 px-3.5 py-3 transition hover:border-zinc-600/60">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-medium text-zinc-100">{recommendation.action_label}</div>
                              <span className="mono-data text-[11px] text-zinc-500">#{recommendation.id}</span>
                            </div>
                            <div className="mt-1.5 text-xs leading-relaxed text-zinc-400">{recommendation.rationale}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button onClick={() => void actionRecommendation(recommendation.id, "accept")} className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-500/18 hover:scale-105 transition-transform duration-500">
                                Accept
                              </button>
                              <button onClick={() => void actionRecommendation(recommendation.id, "reject")} className="rounded-full border border-rose-500/35 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-500/18 hover:scale-105 transition-transform duration-500">
                                Reject
                              </button>
                              <span className="mono-data rounded-full border border-zinc-600/50 bg-zinc-800/60 px-3 py-1 text-[10px] text-zinc-400">
                                {recommendation.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/40 px-3.5 py-3 transition hover:border-zinc-600/60 hover:bg-zinc-800/60">
      <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</div>
      <div className="mono-data mt-1.5 text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
}
