"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, XCircle, Sparkle } from "@phosphor-icons/react";

import type { Ticket } from "@/types";
import { DEMO_TICKETS } from "@/lib/demo-scenario";
import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/client-api";
import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { EmptyState } from "@/components/empty-state";

type RecommendationRow = {
  id: number;
  ticket_id: string;
  ticket_title: string;
  action_label: string;
  rationale: string;
  confidence: number;
  risk_level: string;
  status: string;
};

type DecisionPayload = {
  id: number;
  ticket_id: string;
  recommendations: Array<{
    id: number;
    action_label: string;
    rationale: string;
    confidence: number;
    risk_level: string;
    status: string;
  }>;
};

export default function RecommendationsPage() {
  const [rows, setRows] = useState<RecommendationRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);

  const loadRecommendations = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const tickets = await fetchJsonWithTimeout<Ticket[]>("/api/tickets?limit=20");
      const openTickets = tickets.filter((ticket) => ticket.status !== "Resolved" && ticket.status !== "Closed").slice(0, 8);
      const source = openTickets.length > 0 ? openTickets : DEMO_TICKETS.slice(0, 5);

      const recommendationRows: RecommendationRow[] = [];
      for (const ticket of source) {
        try {
          const decision = await fetchJsonWithTimeout<DecisionPayload>(`/api/decisions/tickets/${ticket.ticket_id}`);
          for (const recommendation of decision.recommendations) {
            recommendationRows.push({
              id: recommendation.id,
              ticket_id: ticket.ticket_id,
              ticket_title: ticket.title,
              action_label: recommendation.action_label,
              rationale: recommendation.rationale,
              confidence: recommendation.confidence,
              risk_level: recommendation.risk_level,
              status: recommendation.status,
            });
          }
        } catch {
          continue;
        }
      }

      setRows(recommendationRows);
      setStatus("ready");
      if (recommendationRows.length === 0) {
        setNotice("No live recommendation rows found. Recompute decisions from Decision Center to populate this feed.");
      }
    } catch (error) {
      setRows([]);
      setStatus("ready");
      setNotice(error instanceof Error ? `Recommendation feed unavailable: ${error.message}` : "Recommendation feed unavailable.");
    }
  }, []);

  useEffect(() => {
    void loadRecommendations();
  }, [loadRecommendations]);

  async function updateRecommendation(id: number, mode: "accept" | "reject") {
    try {
      await postJsonWithTimeout(
        mode === "accept" ? `/api/recommendations/${id}/accept` : `/api/recommendations/${id}/reject`,
        mode === "accept" ? { note: "Accepted from Recommendations page." } : { reason: "Rejected from Recommendations page." }
      );
      setNotice(mode === "accept" ? `Recommendation ${id} accepted.` : `Recommendation ${id} rejected.`);
      await loadRecommendations();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Recommendation update failed.");
    }
  }

  if (status === "loading") {
    return (
      <CommandShell>
        <SystemStatusRail activeLabel="Recommendations" />
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </CommandShell>
    );
  }

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Recommendations" />
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-4">
          <section className="sentinel-v2-panel-strong p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="sentinel-v2-eyebrow">Recommendations</div>
                <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Intelligent Automation Queue</h1>
                <p className="mt-2 text-sm text-zinc-400">Accept or reject recommendation records directly through <span className="mono-data">/api/recommendations/{`{id}`}/accept|reject</span>.</p>
              </div>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/70 bg-zinc-900/70 text-amber-200">
                <Sparkle size={16} />
              </div>
            </div>
            {notice ? <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">{notice}</div> : null}
          </section>

          <section className="sentinel-v2-panel p-4 sm:p-5">
            {rows.length === 0 ? (
              <EmptyState title="No recommendations yet" message="Run the Decision Center against open tickets to generate recommendation records." />
            ) : (
              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row.id} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2">
                        <span className="mono-data text-xs text-zinc-100">#{row.id}</span>
                        <span className="mono-data text-xs text-zinc-500">{row.ticket_id}</span>
                      </div>
                      <span className="mono-data rounded-full border border-zinc-700/70 bg-zinc-900/70 px-2 py-0.5 text-[10px] text-zinc-400">{row.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-zinc-100">{row.action_label}</div>
                    <div className="mt-1 text-xs text-zinc-400">{row.rationale}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="mono-data rounded-full border border-zinc-700/70 bg-zinc-900/70 px-2 py-0.5 text-[10px] text-zinc-400">confidence {row.confidence.toFixed(2)}</span>
                      <span className="mono-data rounded-full border border-zinc-700/70 bg-zinc-900/70 px-2 py-0.5 text-[10px] text-zinc-400">risk {row.risk_level}</span>
                      <button onClick={() => void updateRecommendation(row.id, "accept")} className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-100">
                        <CheckCircle size={12} />
                        Accept
                      </button>
                      <button onClick={() => void updateRecommendation(row.id, "reject")} className="inline-flex items-center gap-1 rounded-full border border-rose-500/35 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-100">
                        <XCircle size={12} />
                        Reject
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">{row.ticket_title}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </CommandShell>
  );
}
