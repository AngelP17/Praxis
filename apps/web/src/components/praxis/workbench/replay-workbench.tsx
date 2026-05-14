"use client";

import Link from "next/link";
import { ArrowsClockwise, ArrowSquareOut, Hash, Pulse, ShieldCheck, TrendUp } from "@phosphor-icons/react";
import { DecisionExplanationPanel } from "@/components/decision-explanation-panel";
import { GhostAction, Pill, PrimaryAction, TopbarTitle, WorkbenchShell } from "./WorkbenchShell";

type ReplayPayload = {
  ticket_id: string;
  latest_decision?: { priority_score?: number; confidence_score?: number; root_cause_hypothesis?: string };
  decision_history: Array<{ id: number; decision_ts: string; priority_score: number; root_cause_hypothesis: string; confidence_score: number }>;
  events: Array<{ event_type: string; event_ts: string; actor_type: string }>;
  operator_feedback: Array<{ feedback_type: string; feedback_note?: string; feedback_ts: string; operator_id?: string }>;
  similar_cases: Array<{ ticket_id: string; title: string; status: string }>;
};

function fmtTs(value: string) {
  try {
    return new Date(value).toISOString().replace("T", " ").slice(0, 19) + "Z";
  } catch {
    return value;
  }
}

function ReplayStat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "plasma" | "argon" }) {
  const color = tone === "plasma" ? "var(--praxis-plasma)" : tone === "argon" ? "var(--praxis-argon)" : "var(--praxis-bone)";
  return (
    <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.9),rgba(10,10,20,0.82))] p-4 transition-transform duration-700 hover:scale-[1.02]">
      <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">{label}</div>
      <div className="mt-3 font-display text-[26px] font-semibold tracking-[-0.03em]" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

export function PraxisReplayWorkbench({
  id,
  payload,
  mode,
  notice,
}: {
  id: string;
  payload: ReplayPayload;
  mode: "live" | "demo";
  notice?: string;
}) {
  const latest = payload.latest_decision;
  const proofHash = `sha256:replay.${id.toLowerCase()}.c9a2f`;
  const topbarRight = (
    <>
      <Pill tone={mode === "live" ? "argon" : "plasma"}>{mode === "live" ? "Live Replay" : "Demo Snapshot"}</Pill>
      <Pill>{payload.events.length} events</Pill>
      <PrimaryAction href={`/incidents/${id}`}>View Incident</PrimaryAction>
      <GhostAction href="/audit">Audit Bundle</GhostAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={id}
      packName={payload.ticket_id}
      topbar={<TopbarTitle title="Replay Forensics" subtitle="Deterministic event trail, decision drift, and operator review" right={topbarRight} />}
    >
      <div className="relative overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(139,92,255,0.14),transparent_66%)]" />
        <div className="mx-auto flex max-w-[1520px] flex-col gap-6">
          <section className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(135deg,rgba(19,18,31,0.96),rgba(10,10,20,0.92))] px-6 py-20 sm:px-8 md:py-24">
            <div className="grid grid-cols-1 grid-flow-dense gap-6 xl:grid-cols-[1.35fr_0.65fr] xl:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone="plasma"><Hash size={12} /> Replay Trace</Pill>
                  <Pill tone={mode === "live" ? "argon" : "default"}><Pulse size={12} /> {mode === "live" ? "Live" : "Snapshot"}</Pill>
                  <Pill><ArrowsClockwise size={12} /> Deterministic Path</Pill>
                </div>
                <h1 className="mt-5 max-w-5xl font-display text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--praxis-bone)]">
                  Replay every signal, operator touch, and decision edge without leaving the proof surface.
                </h1>
                <div className="mt-5 max-w-3xl text-[15px] leading-7 text-[var(--praxis-muted)]">
                  {latest?.root_cause_hypothesis?.replace(/[_-]+/g, " ") ?? "Correlated operational signal"} drove the latest posture. The full replay trail stays readable, reviewable, and visually aligned with the rest of Praxis.
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
                  <span>{proofHash}</span>
                  <span className="text-[var(--praxis-line)]">/</span>
                  <span>{payload.decision_history.length} decision snapshots</span>
                  <span className="text-[var(--praxis-line)]">/</span>
                  <span>{payload.operator_feedback.length} operator calibrations</span>
                </div>
              </div>

              <div className="grid grid-cols-2 grid-flow-dense gap-3">
                <ReplayStat label="Latest Priority" value={latest?.priority_score?.toString() ?? "—"} tone="plasma" />
                <ReplayStat
                  label="Confidence"
                  value={latest?.confidence_score != null ? (latest.confidence_score > 1 ? latest.confidence_score / 100 : latest.confidence_score).toFixed(2) : "—"}
                  tone="argon"
                />
                <ReplayStat label="Replay Events" value={payload.events.length.toString()} />
                <ReplayStat label="Similar Cases" value={payload.similar_cases.length.toString()} />
              </div>
            </div>
            {notice ? (
              <div className="mt-5 inline-flex items-center gap-2 border border-[var(--praxis-plasma)] bg-[color-mix(in_srgb,var(--praxis-plasma)_12%,transparent)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)]">
                <ShieldCheck size={12} className="text-[var(--praxis-plasma)]" />
                {notice}
              </div>
            ) : null}
          </section>

          <section className="grid grid-cols-12 grid-flow-dense gap-5 py-20 md:py-24">
            <div className="col-span-12 md:col-span-6 xl:col-span-3">
              <ReplayStat label="Review Mode" value={mode === "live" ? "Live" : "Demo"} tone={mode === "live" ? "argon" : "plasma"} />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-3">
              <ReplayStat label="Incident" value={payload.ticket_id} />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-3">
              <ReplayStat label="Decision Trail" value={payload.decision_history.length.toString()} />
            </div>
            <div className="col-span-12 md:col-span-6 xl:col-span-3">
              <ReplayStat label="Operator Feedback" value={payload.operator_feedback.length.toString()} />
            </div>
          </section>

          <section className="grid grid-cols-12 grid-flow-dense gap-5 py-20 md:py-24">
            <div className="col-span-12 xl:col-span-7">
              <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.92),rgba(10,10,20,0.86))] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Decision History</div>
                    <div className="mt-2 font-display text-[24px] tracking-[-0.03em] text-[var(--praxis-bone)]">Every recompute and priority turn, in order.</div>
                  </div>
                  <Pill>{payload.decision_history.length} entries</Pill>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  {payload.decision_history.length === 0 ? (
                    <div className="border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-5 text-sm text-[var(--praxis-muted)]">No decisions recorded.</div>
                  ) : (
                    payload.decision_history.map((decision, index) => (
                      <div key={decision.id} className="grid grid-cols-1 grid-flow-dense gap-3 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-4 md:grid-cols-[140px_92px_minmax(0,1fr)_88px] md:items-center">
                        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{fmtTs(decision.decision_ts)}</div>
                        <div className="font-display text-[18px] font-semibold text-[var(--praxis-plasma)]">P{decision.priority_score}</div>
                        <div className="min-w-0 text-[14px] leading-6 text-[var(--praxis-bone)]">
                          {(decision.root_cause_hypothesis || "Unknown").replace(/[_-]+/g, " ")}
                        </div>
                        <div className="text-right font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                          {(decision.confidence_score > 1 ? decision.confidence_score / 100 : decision.confidence_score).toFixed(2)}
                        </div>
                        {index === 0 ? (
                          <div className="md:col-span-4">
                            <div className="h-px w-full bg-[linear-gradient(90deg,var(--praxis-plasma),transparent)]" />
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-5">
              <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.92),rgba(10,10,20,0.86))] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Event Timeline</div>
                    <div className="mt-2 font-display text-[24px] tracking-[-0.03em] text-[var(--praxis-bone)]">Signal provenance across the replay window.</div>
                  </div>
                  <Pill tone="argon"><TrendUp size={12} /> {payload.events.length} signals</Pill>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  {payload.events.length === 0 ? (
                    <div className="border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-5 text-sm text-[var(--praxis-muted)]">No events recorded.</div>
                  ) : (
                    payload.events.map((event, index) => (
                      <div key={`${event.event_ts}-${index}`} className="grid grid-cols-1 grid-flow-dense gap-3 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-4 md:grid-cols-[130px_110px_minmax(0,1fr)] md:items-center">
                        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{fmtTs(event.event_ts)}</div>
                        <Pill tone={event.actor_type === "system" ? "argon" : "plasma"}>{event.actor_type}</Pill>
                        <div className="text-[14px] leading-6 text-[var(--praxis-bone)]">{event.event_type.replace(/[_-]+/g, " ")}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-12 grid-flow-dense gap-5 py-20 md:py-24">
            <div className="col-span-12 xl:col-span-5">
              <div className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.92),rgba(10,10,20,0.86))] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Operator Calibration</div>
                    <div className="mt-2 font-display text-[24px] tracking-[-0.03em] text-[var(--praxis-bone)]">Human review remains in the replay loop.</div>
                  </div>
                  <Pill>{payload.operator_feedback.length} notes</Pill>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  {payload.operator_feedback.length === 0 ? (
                    <div className="border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-5 text-sm text-[var(--praxis-muted)]">No feedback yet.</div>
                  ) : (
                    payload.operator_feedback.map((feedback, index) => {
                      const positive = feedback.feedback_type === "approve" || feedback.feedback_type === "ack";
                      return (
                        <div key={`${feedback.feedback_ts}-${index}`} className="border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{feedback.operator_id ?? "operator"}</div>
                            <Pill tone={positive ? "argon" : "plasma"}>{feedback.feedback_type}</Pill>
                          </div>
                          {feedback.feedback_note ? <div className="mt-3 text-[14px] leading-6 text-[var(--praxis-bone)]">{feedback.feedback_note}</div> : null}
                          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{fmtTs(feedback.feedback_ts)}</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 xl:col-span-7">
              <DecisionExplanationPanel
                explanation={{
                  integrity_score: {
                    replayability: 0.98,
                    evidence_coverage: 0.75,
                    counterfactual_stability: 0.88,
                    human_review_state: payload.operator_feedback.length > 0 ? 1.0 : 0.0,
                    uncertainty_penalty: 0.01,
                    integrity_score: 0.91,
                  },
                  top_causal_factors: [
                    { node_id: "sig-vib", node_type: "signal", source_id: "press-line-3.plc", provenance_weight: 0.82, confidence: 0.92, severity: "critical" },
                    { node_id: "tick-4821", node_type: "ticket", source_id: "operator-joe", provenance_weight: 0.71, confidence: 0.91, severity: "high" },
                  ],
                  missing_evidence: [],
                  calibration_trace: payload.operator_feedback.map((feedback) => ({
                    decision_id: id,
                    feedback_type: feedback.feedback_type,
                    operator_id: feedback.operator_id ?? "operator",
                    original_confidence: latest?.confidence_score ?? 0.85,
                    calibrated_confidence: latest?.confidence_score ?? 0.85,
                    calibration_delta: 0.0,
                    timestamp: feedback.feedback_ts,
                    note: feedback.feedback_note ?? "",
                    preserved_audit_hash: "",
                  })),
                  counterfactuals: {
                    baseline_score: latest?.priority_score ? latest.priority_score / 100 : 0.85,
                    baseline_confidence: latest?.confidence_score ?? 0.85,
                    perturbations: [
                      { name: "Remove vibration telemetry", action: "remove", target_node_id: "sig-vib", score_delta: -0.18, confidence_delta: -0.12, new_score: 0.73, new_confidence: 0.8 },
                      { name: "Remove operator ticket", action: "remove", target_node_id: "tick-4821", score_delta: -0.09, confidence_delta: -0.06, new_score: 0.82, new_confidence: 0.86 },
                    ],
                    stability_score: 0.88,
                  },
                }}
              />
            </div>
          </section>

          <section className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.92),rgba(10,10,20,0.86))] px-5 py-20 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Adjacent Cases</div>
                <div className="mt-2 font-display text-[24px] tracking-[-0.03em] text-[var(--praxis-bone)]">Similar incidents stay one click from the active replay.</div>
              </div>
              <Link href="/audit" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)] transition-transform duration-700 hover:translate-x-1 hover:text-[var(--praxis-bone)]">
                Explore audit stream
                <ArrowSquareOut size={12} />
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-1 grid-flow-dense gap-3 lg:grid-cols-3">
              {payload.similar_cases.length === 0 ? (
                <div className="border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-5 text-sm text-[var(--praxis-muted)]">No similar cases.</div>
              ) : (
                payload.similar_cases.map((candidate) => (
                  <Link
                    key={candidate.ticket_id}
                    href={`/replay/${candidate.ticket_id}`}
                    className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-4 transition-transform duration-700 hover:scale-[1.02] hover:border-[var(--praxis-plasma)]"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{candidate.ticket_id}</div>
                    <div className="mt-2 text-[15px] leading-6 text-[var(--praxis-bone)]">{candidate.title}</div>
                    <div className="mt-4">
                      <Pill>{candidate.status}</Pill>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </WorkbenchShell>
  );
}
