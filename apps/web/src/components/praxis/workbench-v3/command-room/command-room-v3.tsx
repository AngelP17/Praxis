"use client";

/**
 * V3 command room. Drop-in replacement for CommandRoomV2 — same prop contract,
 * different visual language: square plates, hash rail, mono labels, amber spine.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { FeedMode, FeedStatus, QueueTicket } from "@/lib/hooks/use-command-feed";
import {
  SvIco, SvPulse, SvCorners, SvChip, SvWaveform, SvSparkline, SvFlowRail,
  SvPrioBar, SvMagneticCTA, SvScenarioStrip,
} from "@/components/praxis/workbench-v3/primitives";
import { DecisionExplanationPanel } from "@/components/decision-explanation-panel";

type LinkedIncident = {
  id: string;
  title: string;
  rootCause: string;
  ticketCount: number;
  confidence: number;
  impact: number;
};

function formatSync(seconds: number) {
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function statusFromFeed(s: FeedStatus, m: FeedMode, visible: number) {
  if (s === "loading") return { label: "Syncing live data", kind: "amber" as const };
  if (s === "error") return { label: "operations snapshot", kind: "amber" as const };
  if (m === "demo") return { label: "operations snapshot", kind: "amber" as const };
  if (m === "stale") return { label: "Stale data with last known records", kind: "warn" as const };
  if (m === "live" && visible > 0) return { label: "Live data active", kind: "ok" as const };
  return { label: "Stale data with last known records", kind: "warn" as const };
}

function confidenceFor(t?: QueueTicket) {
  if (!t) return 0.84;
  if (t.ticketId === "INC-4821") return 0.92;
  return Math.max(0.55, Math.min(0.95, t.score / 100));
}

export function CommandRoomV3(props: {
  feedStatus: FeedStatus;
  feedMode: FeedMode;
  lastSyncSeconds: number;
  warnings: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  isExporting: boolean;
  onLogout: () => void;
  isSigningOut: boolean;
  tickets: QueueTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
  selectedTicket?: QueueTicket;
  linkedIncident?: LinkedIncident;
  visibleCountForStatus: number;
}) {
  const router = useRouter();
  const {
    feedStatus, feedMode, lastSyncSeconds, warnings, search, onSearchChange,
    onRefresh, onExport, isExporting, onLogout, isSigningOut,
    tickets, selectedTicketId, onSelectTicket, selectedTicket, linkedIncident,
    visibleCountForStatus,
  } = props;

  const goToDecisionCenter = () => {
    if (selectedTicketId) {
      router.push(`/decision-center?ticket=${selectedTicketId}`);
    } else {
      router.push("/decision-center");
    }
  };

  useEffect(() => {
    if (tickets.length === 0) return;
    const exists = selectedTicketId ? tickets.some((t) => t.ticketId === selectedTicketId) : false;
    if (!exists) {
      const pref = tickets.find((t) => t.ticketId === "INC-4821") ?? tickets[0];
      onSelectTicket(pref.ticketId);
    }
  }, [tickets, selectedTicketId, onSelectTicket]);

  const status = statusFromFeed(feedStatus, feedMode, visibleCountForStatus);
  const conf = confidenceFor(selectedTicket);
  const isPress = selectedTicket?.ticketId === "INC-4821";

  return (
    <main className="sv3 sv3-bg" style={{ minHeight: "100dvh", padding: "12px 16px 24px" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Header bar */}
        <header className="sv3-plate sv3-plate-crisp" style={{ padding: "12px 16px", position: "relative" }}>
          <SvCorners />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <SvIco.Brand size={18} />
                <span className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sv3-fg)" }}>
                  Praxis
                </span>
                <span className="sv3-hr-amber" style={{ width: 24, marginInline: 6 }} />
                <SvPulse kind={status.kind} />
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  {status.label}
                </span>
              </div>
              <h1 style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 500, color: "var(--sv3-fg)", letterSpacing: "-0.012em" }}>
                Signal → Decision → Workflow → Feedback → Replay
              </h1>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label
                className="sv3-plate"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px" }}
              >
                <SvIco.Hash size={11} />
                <input
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="search signal queue"
                  className="mono"
                  style={{
                    background: "transparent", border: 0, outline: "none",
                    color: "var(--sv3-fg)", width: 220, fontSize: 11, letterSpacing: "0.05em",
                  }}
                />
              </label>
              <SvMagneticCTA ghost onClick={onRefresh}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <SvIco.Bolt size={11} />
                  Refresh · {formatSync(lastSyncSeconds)}
                </span>
              </SvMagneticCTA>
              <SvMagneticCTA onClick={onExport} disabled={isExporting}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <SvIco.Doc size={11} />
                  {isExporting ? "Exporting…" : "Export audit"}
                </span>
              </SvMagneticCTA>
              <button
                type="button"
                onClick={onLogout}
                disabled={isSigningOut}
                className="mono hover:scale-105 transition-transform duration-500"
                style={{
                  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--sv3-subtle)", background: "transparent", border: 0,
                  cursor: isSigningOut ? "default" : "pointer",
                }}
              >
                {isSigningOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>

          {warnings.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {warnings.map((w) => (
                <SvChip key={w} tone="warn">{w}</SvChip>
              ))}
            </div>
          )}
        </header>

        <SvScenarioStrip active={isPress} ticketId={selectedTicket?.ticketId} />

        {/* 12-col workspace */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 12,
          }}
          className="sv3-cmd-grid"
        >
          {/* LEFT — Signal queue (4 cols) */}
          <section className="sv3-plate py-20" style={{ gridColumn: "span 4", padding: 0, position: "relative", minHeight: 520 }}>
            <SvCorners />
            <div style={{ padding: "10px 14px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <SvPulse kind={status.kind} />
                <span className="label">Signal Queue</span>
              </div>
              <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{tickets.length} visible</span>
            </div>
            <div className="sv3-hr" />
            <div style={{ maxHeight: 600, overflow: "auto" }}>
              {tickets.length === 0 && (
                <div style={{ padding: 24, color: "var(--sv3-subtle)", fontSize: 12 }}>
                  Queue pending. Live sync or seed required.
                </div>
              )}
              {tickets.map((t) => {
                const sel = t.ticketId === selectedTicketId || (!selectedTicketId && t === selectedTicket);
                const crit = t.priority === "Critical" || t.score >= 90;
                return (
                  <button
                    key={t.ticketId}
                    type="button"
                    onClick={() => onSelectTicket(t.ticketId)}
                    className="hover:scale-[1.01] transition-transform duration-500"
                    style={{
                      width: "100%", textAlign: "left",
                      padding: "12px 14px",
                      background: sel ? "linear-gradient(90deg, rgba(229,168,59,0.10), transparent 70%)" : "transparent",
                      borderLeft: sel ? "2px solid var(--sv3-amber)" : "2px solid transparent",
                      borderBottom: "1px solid var(--sv3-line)",
                      color: "var(--sv3-fg)", cursor: "pointer", outline: "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 11, color: sel ? "var(--sv3-amber)" : "var(--sv3-muted)", letterSpacing: "0.08em" }}>
                        {t.ticketId}
                      </span>
                      <span className="num" style={{ fontSize: 13, fontWeight: 600, color: crit ? "var(--sv3-amber)" : "var(--sv3-fg)" }}>
                        P{t.score}
                      </span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.4 }}>{t.title}</div>
                    <div className="mono" style={{ fontSize: 9, marginTop: 6, color: "var(--sv3-subtle)" }}>
                      {t.category} · {t.assignee} · {t.daysOpen}d open
                    </div>
                    <div style={{ marginTop: 6 }}><SvPrioBar value={t.score} /></div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* CENTER — focus + decision (5 cols) */}
          <section className="py-20" style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Focus card */}
            <div className="sv3-plate sv3-plate-crisp" style={{ padding: 16, position: "relative" }}>
              <SvCorners amber />
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <span className="label label-amber">Selected incident</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>
                  {selectedTicket?.ticketId ?? "—"}
                </span>
              </div>
              <h2 style={{ margin: "8px 0 0", fontSize: 22, lineHeight: 1.2, color: "var(--sv3-fg)", fontWeight: 500, letterSpacing: "-0.012em" }}>
                {selectedTicket?.title ?? "Select a signal"}
              </h2>
              <div className="mono" style={{ fontSize: 11, marginTop: 8, color: "var(--sv3-subtle)" }}>
                {selectedTicket?.requester || "machine telemetry + operator ticket"}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
                <KV label="Priority" value={selectedTicket ? `P${selectedTicket.score}` : "—"} amber />
                <KV label="Confidence" value={conf.toFixed(2)} />
                <KV label="Status" value={selectedTicket?.status ?? "—"} />
                <KV label="Days open" value={selectedTicket ? `${selectedTicket.daysOpen}d` : "—"} />
              </div>

              <div style={{ marginTop: 14 }}><SvWaveform /></div>
            </div>

            {/* Praxis decision */}
            <div className="sv3-plate" style={{ padding: 16, position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span className="label">Praxis decision</span>
                <SvChip tone="amber">checkpoint pending</SvChip>
              </div>
              <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.55, color: "var(--sv3-fg)" }}>
                {selectedTicket?.recommendation ?? "Select a signal to inspect deterministic recommendation details."}
              </p>
              <div style={{ marginTop: 12 }}>
                <SvFlowRail activeIndex={2} />
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <SvMagneticCTA onClick={goToDecisionCenter} disabled={!selectedTicketId}>
                  Approve workflow
                </SvMagneticCTA>
                <SvMagneticCTA ghost onClick={goToDecisionCenter} disabled={!selectedTicketId}>
                  Edit & re-rank
                </SvMagneticCTA>
                <SvMagneticCTA ghost onClick={() => router.push("/tickets")}>
                  Send to mechanical
                </SvMagneticCTA>
              </div>
            </div>

            {/* Replay hash rail */}
            <div className="sv3-plate" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="label">Replay hash chain</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-amber)" }}>
                  sha256:{(selectedTicket?.ticketId ?? "queue").toLowerCase()}.c9a2f
                </span>
              </div>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {["signal", "decision", "workflow", "feedback", "replay"].map((s, i) => (
                  <div key={s} className="sv3-plate" style={{ padding: "8px 10px", borderColor: i <= 2 ? "var(--sv3-amber-line)" : undefined }}>
                    <div className="mono" style={{ fontSize: 9, color: i <= 2 ? "var(--sv3-amber)" : "var(--sv3-muted)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                      {String(i + 1).padStart(2, "0")} · {s}
                    </div>
                    <div className="mono" style={{ fontSize: 9, marginTop: 6, color: "var(--sv3-subtle)" }}>
                      {i <= 2 ? "captured" : i === 3 ? "awaiting" : "queued"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision explanation */}
            <DecisionExplanationPanel
              explanation={{
                integrity_score: {
                  replayability: 0.95,
                  evidence_coverage: 0.75,
                  counterfactual_stability: 0.88,
                  human_review_state: 0.0,
                  uncertainty_penalty: 0.02,
                  integrity_score: 0.89,
                },
                top_causal_factors: [
                  { node_id: "sig-vib", node_type: "signal", source_id: "press-line-3.plc", provenance_weight: 0.82, confidence: 0.92, severity: "critical" },
                  { node_id: "tick-4821", node_type: "ticket", source_id: "operator-joe", provenance_weight: 0.71, confidence: 0.91, severity: "high" },
                ],
                missing_evidence: [],
                calibration_trace: [],
                counterfactuals: {
                  baseline_score: 0.91,
                  baseline_confidence: 0.92,
                  perturbations: [
                    { name: "Remove vibration telemetry", action: "remove", target_node_id: "sig-vib", score_delta: -0.18, confidence_delta: -0.12, new_score: 0.73, new_confidence: 0.80 },
                    { name: "Remove operator ticket", action: "remove", target_node_id: "tick-4821", score_delta: -0.09, confidence_delta: -0.06, new_score: 0.82, new_confidence: 0.86 },
                  ],
                  stability_score: 0.88,
                },
              }}
              compact
            />
          </section>

          {/* RIGHT — evidence, feedback, audit (3 cols) */}
          <section className="py-20" style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="sv3-plate" style={{ padding: 14 }}>
              <span className="label">Evidence ribbon</span>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { k: "telemetry", icon: "Wave" as const, ok: true },
                  { k: "ticket log", icon: "Doc" as const, ok: true },
                  { k: "k8s events", icon: "K8s" as const, ok: false },
                  { k: "runbook", icon: "Layers" as const, ok: true },
                ].map((e) => {
                  const Icon = SvIco[e.icon];
                  return (
                    <div key={e.k} className="sv3-plate" style={{ padding: "8px 10px" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: e.ok ? "var(--sv3-ok)" : "var(--sv3-warn)" }}>
                        <Icon size={11} />
                        <span className="label" style={{ color: "inherit", fontSize: 9 }}>{e.k}</span>
                      </div>
                      <div className="mono" style={{ fontSize: 9, marginTop: 6, color: "var(--sv3-subtle)" }}>
                        {e.ok ? "linked" : "watch"}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 12 }}>
                <SvSparkline />
              </div>
            </div>

            <div className="sv3-plate" style={{ padding: 14 }}>
              <span className="label">Operator feedback</span>
              <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { who: "M. Tan", verdict: "approve" as const, note: "matches morning vibration window" },
                  { who: "J. Okafor", verdict: "question" as const, note: "verify torque before bearing swap" },
                ].map((f) => (
                  <li key={f.who} className="sv3-plate" style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                      <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{f.who}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: f.verdict === "approve" ? "var(--sv3-ok)" : "var(--sv3-amber)" }}>
                        {f.verdict === "approve" ? <SvIco.Check size={10} /> : <SvIco.Q size={10} />}
                        <span className="label" style={{ color: "inherit", fontSize: 9 }}>{f.verdict}</span>
                      </span>
                    </div>
                    <div style={{ fontSize: 11, marginTop: 4, color: "var(--sv3-fg)" }}>{f.note}</div>
                  </li>
                ))}
              </ul>
            </div>

            {linkedIncident && (
              <div className="sv3-plate" style={{ padding: 14 }}>
                <span className="label">Linked incident</span>
                <div style={{ marginTop: 8, fontSize: 13, color: "var(--sv3-fg)", lineHeight: 1.4 }}>{linkedIncident.title}</div>
                <div className="mono" style={{ fontSize: 10, marginTop: 6, color: "var(--sv3-muted)" }}>{linkedIncident.id} · {linkedIncident.ticketCount} tickets</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                  <KV label="Impact" value={linkedIncident.impact.toString()} amber />
                  <KV label="Confidence" value={linkedIncident.confidence.toFixed(2)} />
                </div>
              </div>
            )}

            <div className="sv3-plate" style={{ padding: 14 }}>
              <span className="label">Audit ledger</span>
              <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  ["signal:fused", "9a2f"], ["decision:ranked", "b71c"], ["workflow:routed", "4d83"], ["checkpoint:pending", "—"],
                ].map(([label, hash]) => (
                  <li key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px dashed var(--sv3-line)", paddingBottom: 6 }}>
                    <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)", letterSpacing: "0.06em" }}>{label}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--sv3-amber)" }}>{hash}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <style jsx>{`
          @media (max-width: 1100px) {
            :global(.sv3-cmd-grid) {
              grid-template-columns: 1fr !important;
            }
            :global(.sv3-cmd-grid > section) {
              grid-column: 1 / -1 !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}

function KV({ label, value, amber }: { label: string; value: string; amber?: boolean }) {
  return (
    <div className="sv3-plate" style={{ padding: "8px 10px" }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div className="num" style={{ fontSize: 16, marginTop: 4, color: amber ? "var(--sv3-amber)" : "var(--sv3-fg)" }}>{value}</div>
    </div>
  );
}
