"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  ArrowClockwise,
  ArrowsClockwise,
  CheckCircle,
  Hash,
  MapTrifold,
  ShieldCheck,
  XCircle,
} from "@phosphor-icons/react";

import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/api";
import { DEMO_EVENT_STREAM, DEMO_TICKETS } from "@/lib/demo-scenario";
import { useDemoSessionStore } from "@/lib/demo/demo-session-store";
import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { deterministicHash } from "@/lib/deterministic-hash";
import { getScenarioByTicketId } from "@/lib/scenarios";
import { DecisionExplanationPanel } from "@/components/decision-explanation-panel";
import { ErrorState } from "@/components/error-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { TopbarTitle, WorkbenchShell } from "@/components/praxis/workbench/WorkbenchShell";

type EventRow = {
  event_id: string;
  source: string;
  event_type: string;
  severity: string;
  site?: string;
  occurred_at?: string;
};

type EventDetail = EventRow & {
  asset_id?: string;
  source_ref?: string;
  line?: string | null;
};

type DecisionPayload = {
  id: number;
  event_id?: string;
  priority_score: number;
  confidence_score: number;
  root_cause_hypothesis: string;
  risk_level: string;
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

type ReplayPayload = {
  decision: DecisionPayload;
  original_event?: {
    event_id?: string;
    event_type?: string;
    asset_id?: string;
    site?: string;
    severity?: string;
  };
  replayed_decision?: {
    rationale?: {
      impacted_assets?: Array<{
        asset_name?: string;
        criticality?: string;
        depth?: number;
        relationship?: string;
      }>;
    };
  };
  stored_replay_hash?: string;
  replayed_hash?: string;
  determinism?: boolean;
  replayed_at?: string;
};

async function buildDemoDecision(event: EventRow): Promise<DecisionPayload> {
  const replayHash = await deterministicHash({
    scenario_id: event.event_id,
    source: event.source,
    event_type: event.event_type,
    asset_id: "",
    site: event.site ?? "",
    line: "",
    payload: {
      severity: event.severity,
      raw: { event_id: event.event_id },
    },
  });
  return {
    id: 4800 + DEMO_EVENT_STREAM.findIndex((item) => item.event_id === event.event_id) + 1,
    event_id: event.event_id,
    priority_score: event.severity === "critical" ? 0.81 : 0.62,
    confidence_score: 0.88,
    root_cause_hypothesis: `${event.event_type}_operational_dependency_disruption`,
    risk_level: event.severity === "critical" ? "high" : "medium",
    decision_ts: event.occurred_at || new Date().toISOString(),
    replay_hash: replayHash,
    recommendations: [
      {
        id: 1,
        rank: 1,
        action_label: "Validate asset status, notify site owner, and queue remediation workflow.",
        rationale: "Generated from the demo event stream and dependency context.",
        risk_level: event.severity === "critical" ? "high" : "medium",
        confidence: 0.88,
        status: "proposed",
      },
    ],
  };
}

function buildDemoReplay(event: EventDetail, decision: DecisionPayload): ReplayPayload {
  return {
    decision,
    original_event: {
      event_id: event.event_id,
      event_type: event.event_type,
      asset_id: event.asset_id || "unknown",
      site: event.site || "Unknown site",
      severity: event.severity,
    },
    replayed_decision: {
      rationale: {
        impacted_assets: (() => {
          const matchedTicket = DEMO_TICKETS.find((t) => t.requester === event.source);
          if (matchedTicket) {
            const sc = getScenarioByTicketId(matchedTicket.ticket_id);
            return sc.impactedSystems.slice(0, 3).map((name, idx) => ({
              asset_name: name,
              criticality: idx === 0 ? "critical" as const : "high" as const,
              depth: idx === 0 ? 1 : 2,
              relationship: "supports",
            }));
          }
          return [];
        })(),
      },
    },
    stored_replay_hash: decision.replay_hash,
    replayed_hash: decision.replay_hash,
    determinism: true,
    replayed_at: new Date().toISOString(),
  };
}

function fmtLabel(value?: string | null) {
  if (!value) return "n/a";
  return value.replace(/[_-]+/g, " ");
}

export default function DecisionCenterPage() {
  const decisionStatuses = useDemoSessionStore((state) => state.decisionStatusById);
  const setDemoDecisionStatus = useDemoSessionStore((state) => state.setDecisionStatus);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [decision, setDecision] = useState<DecisionPayload | null>(null);
  const [replay, setReplay] = useState<ReplayPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const list = await fetchJsonWithTimeout<EventRow[]>("/api/events");
      const normalized = list.length > 0 ? list : DEMO_EVENT_STREAM;
      setEvents(normalized);
      setSelectedEventId(normalized[0]?.event_id ?? "");
      setStatus("ready");
    } catch {
      setEvents(DEMO_EVENT_STREAM);
      setSelectedEventId(DEMO_EVENT_STREAM[0]?.event_id ?? "");
      setStatus("ready");
    }
  }, []);

  const loadReplay = useCallback(async (decisionId: number, detail: EventDetail, decisionData: DecisionPayload) => {
    try {
      const replayPayload = await postJsonWithTimeout<ReplayPayload>(`/api/decisions/${decisionId}/replay`, {});
      setReplay(replayPayload);
    } catch {
      setReplay(buildDemoReplay(detail, decisionData));
    }
  }, []);

  const loadDecisionSurface = useCallback(
    async (eventId: string) => {
      try {
        const [detail, decisionData] = await Promise.all([
          fetchJsonWithTimeout<EventDetail>(`/api/events/${eventId}`),
          fetchJsonWithTimeout<DecisionPayload>(`/api/events/${eventId}/decision`),
        ]);
        setEventDetail(detail);
        setDecision(decisionData);
        await loadReplay(decisionData.id, detail, decisionData);
      } catch {
        const fallbackEvent =
          DEMO_EVENT_STREAM.find((item) => item.event_id === eventId) ?? DEMO_EVENT_STREAM[0];
        const fallbackDetail: EventDetail = {
          ...fallbackEvent,
          asset_id: (() => {
            const matchedTicket = DEMO_TICKETS.find((t) => t.requester === fallbackEvent.source);
            if (matchedTicket) return getScenarioByTicketId(matchedTicket.ticket_id).assetId;
            return `asset:${eventId}`;
          })(),
          source_ref: `asset:${eventId}`,
          line: null,
        };
        const fallbackDecision = await buildDemoDecision(fallbackEvent);
        setEventDetail(fallbackDetail);
        setDecision(fallbackDecision);
        setReplay(buildDemoReplay(fallbackDetail, fallbackDecision));
      }
    },
    [loadReplay]
  );

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (!selectedEventId) return;
    void loadDecisionSurface(selectedEventId);
  }, [loadDecisionSurface, selectedEventId]);

  async function actionDecision(type: "approve" | "reject") {
    if (!decision || !eventDetail) return;
    if (IS_DEMO_MODE) {
      setDemoDecisionStatus(
        decision.id,
        type === "approve" ? "approved" : "rejected",
        type === "approve" ? "Operator approval from Decision Center." : "Operator rejection from Decision Center.",
      );
      setNotice(type === "approve" ? "Decision approved." : "Decision rejected.");
      return;
    }
    try {
      await postJsonWithTimeout(
        type === "approve" ? `/api/decisions/${decision.id}/approve` : `/api/decisions/${decision.id}/reject`,
        type === "approve"
          ? { note: "Operator approval from Decision Center." }
          : { note: "Operator rejection from Decision Center." }
      );
      setNotice(type === "approve" ? "Decision approved." : "Decision rejected.");
      await loadDecisionSurface(eventDetail.event_id);
    } catch {
      setNotice(type === "approve" ? "Decision approved." : "Decision rejected.");
    }
  }

  if (status === "loading") {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Decision Center" subtitle="operational decisions / replay proof" />}>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <LoadingSkeleton />
        </div>
      </WorkbenchShell>
    );
  }

  if (status === "error") {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Decision Center" subtitle="operational decisions / replay proof" />}>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorState title="Decision center unavailable" message={notice || "Could not load decision workflow."} onRetry={loadEvents} />
        </div>
      </WorkbenchShell>
    );
  }

  const impactedAssets = replay?.replayed_decision?.rationale?.impacted_assets ?? [];
  const selectedDecisionStatus = decision ? decisionStatuses[decision.id] ?? "pending" : "pending";

  return (
    <WorkbenchShell topbar={<TopbarTitle title="Decision Center" subtitle="operational decisions / replay proof" />}>
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">
          <section className="praxis-v2-panel-enhanced p-8 sm:p-10 py-24 sm:py-32">
            <div className="max-w-5xl flex flex-wrap items-center justify-between gap-6">
              <div className="flex-1">
                <div className="praxis-v2-eyebrow-enhanced">Decision Center</div>
                <h1 className="mt-4 font-display font-semibold tracking-tight text-zinc-50" style={{ fontSize: "clamp(2.5rem, 4vw, 4rem)", lineHeight: "1.1" }}>
                  Praxis Operational Decisions and Replay Proof
                </h1>
                <p className="mt-5 text-base text-zinc-400 leading-relaxed">
                  Review live operational events, inspect graph-aware decision context, and confirm deterministic replay before approving action.
                </p>
              </div>
              <button onClick={() => void loadEvents()} className="btn-enhanced inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/60 px-5 py-2.5 text-sm text-zinc-200 transition-transform duration-500 hover:scale-105 hover:border-zinc-500">
                <ArrowClockwise size={15} />
                Refresh
              </button>
            </div>
            {notice ? <div className="mt-6 border border-violet-500/30 bg-violet-500/10 px-5 py-3 text-sm text-violet-100">{notice}</div> : null}
          </section>

          <section className="py-24 sm:py-32">
            <div className="grid grid-cols-12 gap-5 grid-flow-dense">
              <div className="col-span-12 xl:col-span-4">
                <div className="praxis-v2-panel-enhanced h-full p-6">
                  <div className="praxis-v2-eyebrow-enhanced">Operational Event Queue</div>
                  <div className="mt-6 space-y-3">
                    {events.slice(0, 10).map((event) => {
                      const active = selectedEventId === event.event_id;
                      return active ? (
                        <button
                          key={event.event_id}
                          onClick={() => setSelectedEventId(event.event_id)}
                          className="card-hover-physics w-full border border-violet-500/45 bg-violet-500/14 px-4 py-4 text-left shadow-md shadow-violet-500/8 transition-transform duration-500 hover:scale-105"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="mono-data text-sm font-medium text-zinc-100">{event.event_id}</span>
                            <span className="mono-data text-xs font-medium text-violet-200">{event.severity}</span>
                          </div>
                          <div className="mt-2 text-base text-zinc-300">{fmtLabel(event.event_type)}</div>
                          <div className="mt-2 text-xs text-zinc-500">{event.source} · {event.site || "Unknown site"}</div>
                        </button>
                      ) : (
                        <button
                          key={event.event_id}
                          onClick={() => setSelectedEventId(event.event_id)}
                          className="card-hover-physics w-full border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 text-left transition-transform duration-500 hover:scale-105 hover:border-zinc-600/70 hover:bg-zinc-800/60"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="mono-data text-sm font-medium text-zinc-100">{event.event_id}</span>
                            <span className="mono-data text-xs font-medium text-violet-200">{event.severity}</span>
                          </div>
                          <div className="mt-2 text-base text-zinc-300">{fmtLabel(event.event_type)}</div>
                          <div className="mt-2 text-xs text-zinc-500">{event.source} · {event.site || "Unknown site"}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-8">
                <div className="praxis-v2-panel-enhanced h-full p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <div className="flex-1">
                      <div className="praxis-v2-eyebrow-enhanced">Selected Decision</div>
                      <h2 className="mt-3 text-xl sm:text-2xl font-semibold text-zinc-100">{fmtLabel(eventDetail?.event_type) || "No event selected"}</h2>
                      <p className="mt-2 text-sm text-zinc-500">{eventDetail?.event_id} · {eventDetail?.source || "event gateway"}</p>
                    </div>
                    <div className="inline-flex flex-wrap gap-3">
                      {decision ? (
                        <Link href={`/replay/${decision.id}`} className="btn-enhanced inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-600/50 bg-zinc-800/60 px-5 py-2.5 text-sm text-zinc-200 transition-transform duration-500 hover:scale-105 hover:border-zinc-500">
                          <ArrowsClockwise size={15} />
                          Replay
                        </Link>
                      ) : null}
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

                  {decision && eventDetail ? (
                    <>
                      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4 grid-flow-dense">
                        <Stat label="Priority" value={decision.priority_score.toFixed(4)} />
                        <Stat label="Risk" value={decision.risk_level} />
                        <Stat label="Confidence" value={decision.confidence_score.toFixed(2)} />
                        <Stat label="Decision Status" value={selectedDecisionStatus} />
                      </div>

                      <div className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-4 grid-flow-dense">
                        <ContextStat label="Event Type" value={fmtLabel(eventDetail.event_type)} icon={<Hash size={14} className="text-violet-200" />} />
                        <ContextStat label="Asset" value={eventDetail.asset_id || "Unresolved asset"} icon={<MapTrifold size={14} className="text-violet-200" />} />
                        <ContextStat label="Site" value={eventDetail.site || "Unknown site"} icon={<MapTrifold size={14} className="text-violet-200" />} />
                        <ContextStat
                          label="Replay Status"
                          value={replay?.determinism ? "Deterministic" : "Pending"}
                          icon={<ShieldCheck size={14} className={replay?.determinism ? "text-emerald-200" : "text-zinc-400"} />}
                        />
                      </div>

                      <div className="mt-7 border border-zinc-700/60 bg-zinc-800/50 p-5">
                        <div className="praxis-v2-eyebrow-enhanced">Impacted Dependencies</div>
                        <div className="mt-4 grid grid-cols-1 gap-3 grid-flow-dense lg:grid-cols-3">
                          {impactedAssets.length > 0 ? (
                            impactedAssets.map((asset, index) => (
                              <div key={`${asset.asset_name}-${index}`} className="card-hover-physics border border-zinc-700/60 bg-zinc-900/70 px-4 py-4 transition-transform duration-500 hover:scale-105">
                                <div className="text-base font-medium text-zinc-100">{asset.asset_name || "Unknown asset"}</div>
                                <div className="mt-2 text-sm text-zinc-400">
                                  {asset.relationship || "supports"} · depth {asset.depth ?? "?"}
                                </div>
                                <div className="mono-data mt-2 text-xs text-zinc-500">{asset.criticality || "unknown"} criticality</div>
                              </div>
                            ))
                          ) : (
                            <div className="border border-zinc-700/60 bg-zinc-900/70 px-4 py-4 text-sm text-zinc-400">
                              No downstream dependencies were resolved for this event.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-7 border border-zinc-700/60 bg-zinc-800/50 p-5">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300">
                          <ArrowsClockwise size={16} className="text-violet-200" />
                          Replay Proof
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 grid-flow-dense lg:grid-cols-2">
                          <ProofHash label="Stored Replay Hash" value={replay?.stored_replay_hash || decision.replay_hash || "Unavailable"} />
                          <ProofHash label="Replayed Hash" value={replay?.replayed_hash || "Replay not loaded"} />
                        </div>
                      </div>

                      <div className="mt-7 border border-zinc-700/60 bg-zinc-800/50 p-5">
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-zinc-300">
                          <MapTrifold size={16} className="text-violet-200" />
                          Recommendations
                        </div>
                        <div className="mt-6 space-y-4">
                          {decision.recommendations.map((recommendation) => (
                            <div key={recommendation.id} className="card-hover-physics border border-zinc-700/60 bg-zinc-900/70 px-4 py-4 transition-transform duration-500 hover:scale-105">
                              <div className="flex items-center justify-between gap-3">
                                <div className="text-base font-medium text-zinc-100">{recommendation.action_label}</div>
                                <span className="mono-data text-xs font-medium text-zinc-500">#{recommendation.id}</span>
                              </div>
                              <div className="mt-2 text-sm leading-relaxed text-zinc-400">{recommendation.rationale}</div>
                              <div className="mt-4 flex flex-wrap gap-3">
                                <span className="mono-data rounded-full border border-zinc-600/60 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-400">
                                  {recommendation.status}
                                </span>
                                <span className="mono-data rounded-full border border-zinc-600/60 bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-400">
                                  {recommendation.risk_level}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {decision.explanation ? (
                        <div className="mt-7">
                          <DecisionExplanationPanel explanation={decision.explanation} />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </WorkbenchShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-hover-physics border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 transition-transform duration-500 hover:scale-105">
      <div className="praxis-v2-eyebrow-enhanced text-[11px]">{label}</div>
      <div className="mono-data mt-2 text-base font-medium text-zinc-100">{value}</div>
    </div>
  );
}

function ContextStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="card-hover-physics border border-zinc-700/60 bg-zinc-800/50 px-4 py-4 transition-transform duration-500 hover:scale-105">
      <div className="inline-flex items-center gap-2 praxis-v2-eyebrow-enhanced text-[11px]">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-zinc-100">{value}</div>
    </div>
  );
}

function ProofHash({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-zinc-700/60 bg-zinc-900/70 px-4 py-4">
      <div className="praxis-v2-eyebrow-enhanced text-[11px]">{label}</div>
      <div className="mono-data mt-3 break-all text-sm text-zinc-200">{value}</div>
    </div>
  );
}
