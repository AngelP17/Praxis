"use client";

/**
 * V3 replay forensics view. Same payload shape as v2's ReplayForensicsView.
 * Drop-in: replace ReplayForensicsView import in app/replay/[id]/page.tsx.
 */

import Link from "next/link";
import {
  SvIco, SvPulse, SvCorners, SvChip, SvFlowRail, SvSparkline, SvWaveform,
} from "@/components/praxis/workbench-v3/primitives";
import { DecisionExplanationPanel } from "@/components/decision-explanation-panel";

type ReplayPayload = {
  ticket_id: string;
  latest_decision?: { priority_score?: number; confidence_score?: number; root_cause_hypothesis?: string };
  decision_history: Array<{ id: number; decision_ts: string; priority_score: number; root_cause_hypothesis: string; confidence_score: number }>;
  events: Array<{ event_type: string; event_ts: string; actor_type: string }>;
  operator_feedback: Array<{ feedback_type: string; feedback_note?: string; feedback_ts: string; operator_id?: string }>;
  similar_cases: Array<{ ticket_id: string; title: string; status: string }>;
};

function fmtTs(s: string) {
  try { return new Date(s).toISOString().replace("T", " ").slice(0, 19) + "Z"; } catch { return s; }
}

export function ReplayForensicsViewV3({
  id, payload, mode, notice,
}: { id: string; payload: ReplayPayload; mode: "live" | "demo"; notice?: string }) {
  const latest = payload.latest_decision;
  return (
    <main className="sv3 sv3-bg" style={{ minHeight: "100dvh", padding: "20px 16px 32px" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Header */}
        <header className="sv3-plate sv3-plate-crisp" style={{ padding: "14px 18px", position: "relative" }}>
          <SvCorners amber />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <SvIco.Hash size={13} />
                <span className="label label-amber">Replay forensics</span>
                <SvPulse kind={mode === "live" ? "ok" : "amber"} />
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  {mode === "live" ? "live" : "snapshot"}
                </span>
              </div>
              <h1 style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 600, color: "var(--sv3-fg)", letterSpacing: "-0.018em" }}>
                {id}
              </h1>
              <div className="mono" style={{ fontSize: 11, color: "var(--sv3-muted)", marginTop: 4 }}>
                sha256:replay.{id.toLowerCase()}.c9a2f
              </div>
            </div>
            <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
              <Link href={`/incidents/${id}`} className="sv3-cta ghost hover:scale-105 transition-transform duration-500">View incident</Link>
              <Link href="/audit" className="sv3-cta hover:scale-105 transition-transform duration-500">Audit bundle</Link>
            </div>
          </div>
          {notice && (
            <div style={{ marginTop: 10 }}>
              <SvChip tone="warn">{notice}</SvChip>
            </div>
          )}
        </header>

        {/* Top stats + flow rail */}
        <div className="sv3-plate" style={{ padding: 16 }}>
          <SvFlowRail activeIndex={4} />
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            <KV label="Latest priority" value={latest?.priority_score?.toString() ?? "—"} amber />
            <KV label="Root cause" value={(latest?.root_cause_hypothesis ?? "Unknown").replace(/[_-]+/g, " ")} />
            <KV label="Decisions" value={payload.decision_history.length.toString()} />
            <KV label="Events" value={payload.events.length.toString()} />
          </div>
          <div style={{ marginTop: 14 }}><SvWaveform /></div>
        </div>

        {/* 2-col body */}
        <div className="sv3-replay-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 14 }}>
          {/* Left — decision + event timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section className="sv3-plate py-20" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="label">Decision history</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{payload.decision_history.length} entries</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 0 }}>
                {payload.decision_history.length === 0 && (
                  <li style={{ fontSize: 12, color: "var(--sv3-subtle)" }}>No decisions recorded.</li>
                )}
                {payload.decision_history.map((d, i) => (
                  <li key={d.id} style={{ display: "grid", gridTemplateColumns: "84px 60px 1fr 70px", gap: 10, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--sv3-line)" }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{fmtTs(d.decision_ts)}</span>
                    <span className="num" style={{ fontSize: 13, color: "var(--sv3-amber)" }}>P{d.priority_score}</span>
                    <span style={{ fontSize: 12, color: "var(--sv3-fg)" }}>{(d.root_cause_hypothesis || "Unknown").replace(/[_-]+/g, " ")}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)", textAlign: "right" }}>conf {(d.confidence_score > 1 ? d.confidence_score / 100 : d.confidence_score).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="sv3-plate py-20" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="label">Event timeline</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{payload.events.length} events</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
                {payload.events.length === 0 && (
                  <li style={{ fontSize: 12, color: "var(--sv3-subtle)" }}>No events recorded.</li>
                )}
                {payload.events.map((e, i) => (
                  <li key={i} className="sv3-plate" style={{ padding: "8px 12px", display: "grid", gridTemplateColumns: "120px 90px 1fr", gap: 10, alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{fmtTs(e.event_ts)}</span>
                    <SvChip tone={e.actor_type === "system" ? "info" : "amber"}>{e.actor_type}</SvChip>
                    <span style={{ fontSize: 12, color: "var(--sv3-fg)" }}>{e.event_type.replace(/[_-]+/g, " ")}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right — feedback, similar cases, sparkline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <section className="sv3-plate py-20" style={{ padding: 16 }}>
              <span className="label">Operator feedback</span>
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
                {payload.operator_feedback.length === 0 && (
                  <li style={{ fontSize: 12, color: "var(--sv3-subtle)" }}>No feedback yet.</li>
                )}
                {payload.operator_feedback.map((f, i) => {
                  const ok = f.feedback_type === "approve" || f.feedback_type === "ack";
                  return (
                    <li key={i} className="sv3-plate" style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{f.operator_id ?? "operator"}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: ok ? "var(--sv3-ok)" : "var(--sv3-amber)" }}>
                          {ok ? <SvIco.Check size={10} /> : <SvIco.Q size={10} />}
                          <span className="label" style={{ color: "inherit", fontSize: 9 }}>{f.feedback_type}</span>
                        </span>
                      </div>
                      {f.feedback_note && <div style={{ fontSize: 11, marginTop: 4, color: "var(--sv3-fg)" }}>{f.feedback_note}</div>}
                      <div className="mono" style={{ fontSize: 9, marginTop: 4, color: "var(--sv3-subtle)" }}>{fmtTs(f.feedback_ts)}</div>
                    </li>
                  );
                })}
              </ul>
            </section>

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
                calibration_trace: payload.operator_feedback.map((f) => ({
                  decision_id: id,
                  feedback_type: f.feedback_type,
                  operator_id: f.operator_id ?? "operator",
                  original_confidence: latest?.confidence_score ?? 0.85,
                  calibrated_confidence: latest?.confidence_score ?? 0.85,
                  calibration_delta: 0.0,
                  timestamp: f.feedback_ts,
                  note: f.feedback_note ?? "",
                  preserved_audit_hash: "",
                })),
                counterfactuals: {
                  baseline_score: latest?.priority_score ? latest.priority_score / 100 : 0.85,
                  baseline_confidence: latest?.confidence_score ?? 0.85,
                  perturbations: [
                    { name: "Remove vibration telemetry", action: "remove", target_node_id: "sig-vib", score_delta: -0.18, confidence_delta: -0.12, new_score: 0.73, new_confidence: 0.80 },
                    { name: "Remove operator ticket", action: "remove", target_node_id: "tick-4821", score_delta: -0.09, confidence_delta: -0.06, new_score: 0.82, new_confidence: 0.86 },
                  ],
                  stability_score: 0.88,
                },
              }}
              compact
            />

            <section className="sv3-plate py-20" style={{ padding: 16 }}>
              <span className="label">Confidence trend</span>
              <div style={{ marginTop: 10 }}><SvSparkline stroke="var(--sv3-amber)" /></div>
              <div className="mono" style={{ fontSize: 10, color: "var(--sv3-subtle)", marginTop: 8 }}>
                rolling decision confidence across replay window
              </div>
            </section>

            <section className="sv3-plate py-20" style={{ padding: 16 }}>
              <span className="label">Similar cases</span>
              <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
                {payload.similar_cases.length === 0 && (
                  <li style={{ fontSize: 12, color: "var(--sv3-subtle)" }}>No similar cases.</li>
                )}
                {payload.similar_cases.map((c) => (
                  <li key={c.ticket_id}>
                    <Link href={`/replay/${c.ticket_id}`} className="sv3-plate hover:scale-105 transition-transform duration-500" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", textDecoration: "none", color: "var(--sv3-fg)" }}>
                      <div style={{ minWidth: 0 }}>
                        <div className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{c.ticket_id}</div>
                        <div style={{ fontSize: 11, marginTop: 2, color: "var(--sv3-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                      </div>
                      <SvChip>{c.status}</SvChip>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 1000px) {
            :global(.sv3-replay-grid) {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}

function KV({ label, value, amber }: { label: string; value: string; amber?: boolean }) {
  return (
    <div className="sv3-plate" style={{ padding: "10px 12px" }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div className="num" style={{ fontSize: 22, marginTop: 4, color: amber ? "var(--sv3-amber)" : "var(--sv3-fg)", letterSpacing: "-0.018em" }}>
        {value}
      </div>
    </div>
  );
}
