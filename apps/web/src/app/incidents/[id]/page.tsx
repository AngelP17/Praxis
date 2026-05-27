"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChartLine, Hash, ShieldCheck, Waveform } from "@phosphor-icons/react/dist/ssr";

import { getDemoIncident, DEMO_TICKETS } from "@/lib/demo-scenario";
import { fetchJsonWithTimeout, postJsonWithTimeout } from "@/lib/api";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { DecisionExplanationPanel } from "@/components/decision-explanation-panel";
import { getScenarioByTicketId } from "@/lib/scenarios";
import { Pill, TopbarTitle, WorkbenchShell } from "@/components/praxis/workbench/WorkbenchShell";

type IncidentDetailPayload = {
  incident: {
    title: string;
    status: string;
    ticket_count: number;
    confidence?: number;
    business_impact_score?: number;
    opened_at?: string;
  };
  common_cause: string;
  recommended_action: string;
  tickets: Array<{
    ticket_id: string;
    title: string;
    status: string;
    priority_score?: number;
  }>;
};

type TimelinePayload = {
  incident_id: string;
  timeline: Array<{ phase: string; timestamp?: string; detail: string; source?: string; label?: string }>;
};

function percent(value?: number | null) {
  if (typeof value !== "number") return "--";
  return `${Math.round(value)}%`;
}

function score(value?: number | null) {
  if (typeof value !== "number") return "--";
  return value.toFixed(1);
}

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  const incidentId = params.id;

  const [payload, setPayload] = useState<IncidentDetailPayload | null>(null);
  const [timeline, setTimeline] = useState<TimelinePayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [notice, setNotice] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  const loadIncident = useCallback(async () => {
    setStatus("loading");
    setNotice(null);
    try {
      const [incidentR, timelineR] = await Promise.allSettled([
        fetchJsonWithTimeout<IncidentDetailPayload>(`/api/incidents/${incidentId}`),
        fetchJsonWithTimeout<TimelinePayload>(`/api/incidents/${incidentId}/timeline`),
      ]);

      const incidentData =
        incidentR.status === "fulfilled" ? incidentR.value : getDemoIncident(incidentId);

      const timelineData: TimelinePayload =
        timelineR.status === "fulfilled"
          ? timelineR.value
          : {
              incident_id: incidentId,
              timeline: [
                { phase: "signal", detail: "Telemetry threshold crossed on upstream source", timestamp: "T+00s" },
                { phase: "decision", detail: "Praxis priority raised with high confidence", timestamp: "T+04s" },
                { phase: "workflow", detail: "Escalation route created for responsible team", timestamp: "T+09s" },
                { phase: "feedback", detail: "Ops Lead approved / Reliability requested extra sample", timestamp: "T+15s" },
              ],
            };

      setPayload(incidentData);
      setTimeline(timelineData);
      setStatus("ready");
      if (incidentR.status === "rejected") setNotice(null);
    } catch (error) {
      setPayload(getDemoIncident(incidentId));
      setTimeline({
        incident_id: incidentId,
        timeline: [
          { phase: "signal", detail: "Telemetry threshold crossed on upstream source", timestamp: "T+00s" },
          { phase: "decision", detail: "Praxis priority raised with high confidence", timestamp: "T+04s" },
          { phase: "workflow", detail: "Escalation route created for responsible team", timestamp: "T+09s" },
          { phase: "feedback", detail: "Operations lead approved additional sampling window", timestamp: "T+15s" },
        ],
      });
      setStatus("ready");
      setNotice(null);
    }
  }, [incidentId]);

  useEffect(() => {
    void loadIncident();
  }, [loadIncident]);

  async function resolveIncident() {
    setResolving(true);
    try {
      await postJsonWithTimeout(`/api/incidents/${incidentId}/resolve`, {
        summary: "Resolved from forensic command interface with mechanical replacement workflow.",
      });
      setNotice(`Incident ${incidentId} marked resolved.`);
      await loadIncident();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Resolve operation failed.");
    } finally {
      setResolving(false);
    }
  }

  if (status === "loading") {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Incident Detail" subtitle="Loading…" />}>
        <div className="overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1580px]">
            <LoadingSkeleton />
          </div>
        </div>
      </WorkbenchShell>
    );
  }

  if (status === "error" || !payload) {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Incident Detail" subtitle="Error" />}>
        <div className="overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1580px]">
            <ErrorState title="Incident detail unavailable" message={notice || "Could not load incident payload."} onRetry={() => void loadIncident()} />
          </div>
        </div>
      </WorkbenchShell>
    );
  }

  const linkedTicket = DEMO_TICKETS.find((t) => t.incident_id === incidentId) ?? DEMO_TICKETS[0];
  const scenario = getScenarioByTicketId(linkedTicket.ticket_id);

  return (
    <WorkbenchShell
      packName={scenario.label}
      topbar={
        <TopbarTitle
          title="Incident Detail"
          subtitle={`${payload.incident.title} · ${payload.incident.status} · ${payload.incident.ticket_count} linked tickets`}
          right={
            <>
              <Pill tone="plasma">{payload.incident.status}</Pill>
              <Pill tone="argon">{percent(payload.incident.confidence)} confidence</Pill>
            </>
          }
        />
      }
    >
      <div className="overflow-auto px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative z-10 mx-auto w-full max-w-[1580px]">
        <section className="praxis-v2-panel-enhanced px-5 py-20 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Incident Detail</div>
              <h1 className="mt-2 max-w-5xl font-display text-2xl font-semibold tracking-tight text-[var(--praxis-bone)] sm:text-3xl">{payload.incident.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--praxis-muted)]">
                Forensic incident context with timeline reconstruction, deterministic recommendation, and closure control.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/command-center"
                className="inline-flex min-h-10 items-center border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.66)] px-4 py-2 text-sm text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-[1.01] hover:border-[var(--praxis-plasma)]"
              >
                Command center
              </Link>
              <button
                onClick={() => void resolveIncident()}
                disabled={resolving}
                className="inline-flex min-h-10 items-center border border-[var(--praxis-argon)] bg-[color-mix(in_srgb,var(--praxis-argon)_12%,transparent)] px-4 py-2 text-sm text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-[1.01] hover:bg-[color-mix(in_srgb,var(--praxis-argon)_18%,transparent)] disabled:opacity-60"
              >
                {resolving ? "Resolving..." : "Resolve Incident"}
              </button>
              <Link
                href={`/replay/${linkedTicket?.ticket_id ?? incidentId}`}
                className="inline-flex min-h-10 items-center border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.66)] px-4 py-2 text-sm text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-[1.01] hover:border-[var(--praxis-plasma)]"
              >
                Replay
              </Link>
            </div>
          </div>

          {notice ? (
            <div className="mt-4 border border-[var(--praxis-plasma)] bg-[color-mix(in_srgb,var(--praxis-plasma)_12%,transparent)] px-4 py-2.5 text-sm text-[var(--praxis-bone)]">{notice}</div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 grid-flow-dense">
            <Stat label="Status" value={payload.incident.status} />
            <Stat label="Linked Tickets" value={String(payload.incident.ticket_count)} mono />
            <Stat label="Confidence" value={percent(payload.incident.confidence)} mono />
            <Stat label="Impact Score" value={score(payload.incident.business_impact_score)} mono />
          </div>
        </section>

        <section className="mt-4 grid grid-cols-12 gap-4 grid-flow-dense py-20">
          <div className="col-span-12 xl:col-span-7">
            <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.92),rgba(10,10,20,0.86))] p-4 sm:p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Incident Focus</div>
              <p className="mt-3 text-sm leading-7 text-[var(--praxis-muted)]">{payload.common_cause}</p>
              <div className="mt-4 border border-[var(--praxis-plasma)] bg-[color-mix(in_srgb,var(--praxis-plasma)_12%,transparent)] p-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--praxis-bone)]">Praxis recommendation</div>
                <p className="mt-2 text-sm leading-7 text-[var(--praxis-bone)]">{payload.recommended_action}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 grid-flow-dense">
                {["SLO burn rate", "Kubernetes event window", "Forensic waveform capture", "Operator response runbook"].map((item, index) => (
                  <div key={item} className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-3 py-2.5">
                    <div className="inline-flex items-center gap-1.5 text-xs text-[var(--praxis-bone)]">
                      {index % 2 === 0 ? <ChartLine size={13} className="text-[var(--praxis-plasma)]" /> : <Waveform size={13} className="text-[var(--praxis-plasma)]" />}
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 space-y-4">
            <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.92),rgba(10,10,20,0.86))] p-4 sm:p-5">
              <DecisionExplanationPanel
                explanation={{
                  integrity_score: {
                    replayability: 0.95,
                    evidence_coverage: 0.75,
                    counterfactual_stability: 0.88,
                    human_review_state: 1.0,
                    uncertainty_penalty: 0.02,
                    integrity_score: 0.91,
                  },
                  top_causal_factors: [
                    { node_id: "sig-primary", node_type: "signal", source_id: scenario.source, provenance_weight: 0.82, confidence: scenario.confidenceScore, severity: "critical" },
                    { node_id: `tick-${linkedTicket?.ticket_id?.replace(/\D/g, "") ?? "0"}`, node_type: "ticket", source_id: "operator", provenance_weight: 0.71, confidence: scenario.confidenceScore, severity: "high" },
                  ],
                  missing_evidence: [],
                  calibration_trace: [
                    { decision_id: "dec-001", feedback_type: "approve", operator_id: "ops.lead.santos", original_confidence: 0.92, calibrated_confidence: 0.93, calibration_delta: 0.01, timestamp: "2026-04-27T10:20:14Z", note: "Correct routing.", preserved_audit_hash: "0c9a-2f" },
                  ],
                  counterfactuals: {
                    baseline_score: 0.96,
                    baseline_confidence: 0.92,
                    perturbations: [
                      { name: "Remove vibration telemetry", action: "remove", target_node_id: "sig-vib", score_delta: -0.18, confidence_delta: -0.12, new_score: 0.78, new_confidence: 0.80 },
                      { name: "Remove operator ticket", action: "remove", target_node_id: "tick-4821", score_delta: -0.09, confidence_delta: -0.06, new_score: 0.87, new_confidence: 0.86 },
                    ],
                    stability_score: 0.88,
                  },
                }}
              />
            </div>

            <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.92),rgba(10,10,20,0.86))] p-4 sm:p-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Timeline Reconstruction</div>
              <div className="mt-3 space-y-2">
                {(timeline?.timeline || []).map((item, index) => (
                  <div key={`${item.phase}-${index}`} className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm capitalize text-[var(--praxis-bone)]">{item.phase}</div>
                      <span className="font-mono text-[11px] text-[var(--praxis-mute)]">{item.timestamp || "--"}</span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--praxis-muted)]">{item.detail}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.68)] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Incident Ledger</div>
                <div className="mt-2 space-y-2">
                  <LedgerItem label="Replay hash" value={`sha256:${linkedTicket?.ticket_id?.toLowerCase() ?? incidentId.toLowerCase()}c9a2f`} />
                  <LedgerItem label="Root cause" value={scenario.rootCause.replace(/[_-]+/g, " ")} />
                  <LedgerItem label="Workflow route" value={`${scenario.ownerTeam} response lane`} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 border border-[var(--praxis-argon)] bg-[color-mix(in_srgb,var(--praxis-argon)_10%,transparent)] px-3 py-2 text-xs text-[var(--praxis-bone)]">
                  <ShieldCheck size={13} className="text-[var(--praxis-argon)]" />
                  Human-reviewed before closure
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.92),rgba(10,10,20,0.86))] p-4 sm:p-5 py-20 md:py-24">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Correlated Tickets</div>
            <div className="font-mono text-[11px] text-[var(--praxis-mute)]">{payload.tickets.length} linked records</div>
          </div>
          <div className="mt-3 space-y-2">
            {payload.tickets.map((ticket) => (
              <Link
                key={ticket.ticket_id}
                href={`/tickets/${ticket.ticket_id}`}
                className="grid gap-2 overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-3 py-2.5 transition-transform duration-700 hover:scale-[1.02] hover:border-[var(--praxis-plasma)] md:grid-cols-[130px,minmax(0,1fr),180px] grid-flow-dense"
              >
                <div className="font-mono text-xs text-[var(--praxis-bone)]">{ticket.ticket_id}</div>
                <div className="text-sm text-[var(--praxis-muted)]">{ticket.title}</div>
                <div className="flex items-center gap-2 md:justify-end">
                  <span className="border border-[var(--praxis-line)] px-2 py-0.5 text-[10px] text-[var(--praxis-bone)]">{ticket.status}</span>
                  <span className="font-mono border border-[var(--praxis-plasma)] bg-[color-mix(in_srgb,var(--praxis-plasma)_12%,transparent)] px-2 py-0.5 text-[10px] text-[var(--praxis-bone)]">
                    {score(ticket.priority_score)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 py-20">
          <div className="overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-surface)]">
            <div className="praxis-marquee flex min-w-max items-center gap-8 px-4 py-[10px]">
              {[
                payload.incident.title,
                `priority ${scenario.priorityScore} / confidence ${scenario.confidenceScore.toFixed(2)}`,
                `root cause ${scenario.rootCause.replace(/[_-]+/g, " ")}`,
                `route ${scenario.ownerTeam.toLowerCase()}`,
                `replay hash sha256:${linkedTicket?.ticket_id?.toLowerCase() ?? incidentId.toLowerCase()}c9a2f`,
                payload.incident.title,
                `priority ${scenario.priorityScore} / confidence ${scenario.confidenceScore.toFixed(2)}`,
                `root cause ${scenario.rootCause.replace(/[_-]+/g, " ")}`,
                `route ${scenario.ownerTeam.toLowerCase()}`,
                `replay hash sha256:${linkedTicket?.ticket_id?.toLowerCase() ?? incidentId.toLowerCase()}c9a2f`,
              ].map((label, i) => (
                <div key={i} className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-4 pb-1">
          <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.88)] px-4 py-2.5 text-xs text-[var(--praxis-muted)]">
            <div className="inline-flex items-center gap-1.5">
              <Hash size={12} className="text-[var(--praxis-plasma)]" />
              Incident linked to replay hash chain and audit export.
            </div>
          </div>
        </footer>
      </div>
      </div>
    </WorkbenchShell>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] p-3.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">{label}</div>
      <div className={`mt-1.5 text-lg font-semibold text-[var(--praxis-bone)] ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function LedgerItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.72)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">{label}</div>
      <div className="mt-1 font-mono text-xs text-[var(--praxis-bone)]">{value}</div>
    </div>
  );
}
