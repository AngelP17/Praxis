"use client";

/** V3 bento — square data plates with mono labels, big numerics, and
 * embedded micro-charts. Consumes useLandingData() metrics + recentIncidents. */

import { SvIco, SvPulse, SvSparkline, SvWaveform, SvHeatmap, SvChip } from "@/components/praxis/workbench-v3/primitives";
import type { SystemMetrics, RecentIncident } from "@/lib/hooks/use-landing-data";

function fmt(n: number | undefined, suffix = "") {
  if (n === undefined || n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M${suffix}`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k${suffix}`;
  return `${n}${suffix}`;
}

export function BentoSectionV3({
  metrics,
  recentIncidents,
}: {
  metrics: SystemMetrics | null;
  recentIncidents: RecentIncident[];
}) {
  const top = recentIncidents[0];

  return (
    <section className="py-20" style={{ padding: "48px 24px 24px" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
          <div>
            <span className="label label-amber">[ Operational surface ]</span>
            <h2 style={{
              margin: "8px 0 0",
              fontSize: "clamp(1.6rem, 2.4vw, 2.2rem)",
              fontWeight: 600, letterSpacing: "-0.018em",
              color: "var(--sv3-fg)",
            }}>
              One frame for signal, decision, and proof.
            </h2>
          </div>
          <span className="mono" style={{ fontSize: 11, color: "var(--sv3-muted)", letterSpacing: "0.18em" }}>
            LIVE · 30s refresh
          </span>
        </header>

        <div
          className="sv3-bento"
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(12, 1fr)",
            gridAutoRows: "minmax(140px, auto)",
          }}
        >
          {/* Open incidents — wide */}
          <Plate cols={5} rows={2}>
            <PlateHeader label="Open Incidents" status={<SvPulse kind={metrics && metrics.critical > 0 ? "amber" : "ok"} />} right={<SvChip tone="amber">live</SvChip>} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 14 }}>
              <span className="num" style={{ fontSize: 64, color: "var(--sv3-fg)", letterSpacing: "-0.04em" }}>
                {metrics?.total_open ?? "—"}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-amber)" }}>{metrics?.critical ?? 0} critical</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-warn)" }}>{metrics?.sla_breach_risk ?? 0} sla risk</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{metrics?.incident_clusters ?? 0} clusters</span>
              </div>
            </div>
            <div style={{ marginTop: "auto", paddingTop: 14 }}>
              <SvWaveform />
            </div>
          </Plate>

          {/* Decision latency */}
          <Plate cols={3} rows={1}>
            <PlateHeader label="Decision Latency" />
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
              <span className="num" style={{ fontSize: 36, color: "var(--sv3-fg)" }}>
                {metrics?.avg_decision_latency_ms ?? "—"}
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--sv3-muted)" }}>ms p50</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <SvSparkline stroke="var(--sv3-amber)" />
            </div>
          </Plate>

          {/* Replay coverage */}
          <Plate cols={4} rows={1}>
            <PlateHeader label="Replay Coverage" right={<span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>last 24h</span>} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
              <span className="num" style={{ fontSize: 36, color: "var(--sv3-amber)" }}>
                {metrics?.replay_coverage_percent ?? "—"}
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--sv3-muted)" }}>% of decisions</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <SvHeatmap cells={24} height={14} />
            </div>
          </Plate>

          {/* Signals processed */}
          <Plate cols={3} rows={1}>
            <PlateHeader label="Signals Processed" />
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
              <span className="num" style={{ fontSize: 32, color: "var(--sv3-fg)" }}>
                {fmt(metrics?.signals_processed_24h)}
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--sv3-muted)" }}>last 24h</span>
            </div>
            <div className="mono" style={{ fontSize: 10, marginTop: 14, color: "var(--sv3-subtle)", lineHeight: 1.6 }}>
              telemetry · tickets · k8s<br/>
              fused → ranked → routed
            </div>
          </Plate>

          {/* Active evidence lanes */}
          <Plate cols={4} rows={1}>
            <PlateHeader label="Evidence Lanes" right={<SvIco.Layers size={11} />} />
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {["telemetry", "tickets", "k8s", "ledger"].map((l, i) => (
                <div key={l} style={{
                  padding: "8px 6px",
                  border: "1px solid var(--sv3-line)",
                  background: "rgba(255,255,255,0.015)",
                }}>
                  <div className="label" style={{ fontSize: 9 }}>{l}</div>
                  <div className="mono" style={{ fontSize: 11, marginTop: 6, color: i === 2 ? "var(--sv3-warn)" : "var(--sv3-ok)" }}>
                    {i === 2 ? "watch" : "ok"}
                  </div>
                </div>
              ))}
            </div>
          </Plate>

          {/* Top incident card — wide */}
          <Plate cols={8} rows={1}>
            <PlateHeader
              label="Highest Priority Incident"
              status={<SvPulse kind="amber" />}
              right={
                <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>
                  {top?.id ?? "—"}
                </span>
              }
            />
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))", gap: 14, marginTop: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--sv3-fg)", lineHeight: 1.35 }}>
                  {top?.title ?? "No active incidents"}
                </div>
                <div className="mono" style={{ fontSize: 10, marginTop: 6, color: "var(--sv3-subtle)" }}>
                  {top?.root_cause_hypothesis ?? "—"}
                </div>
              </div>
              <KV k="confidence" v={top ? top.confidence.toFixed(2) : "—"} />
              <KV k="impact" v={top ? top.business_impact_score.toString() : "—"} amber />
              <KV k="tickets" v={top ? top.ticket_count.toString() : "—"} />
            </div>
          </Plate>

          {/* SLO burn */}
          <Plate cols={4} rows={1}>
            <PlateHeader label="SLO Burn" right={<span className="mono" style={{ fontSize: 10, color: "var(--sv3-warn)" }}>2.4× target</span>} />
            <div style={{ marginTop: 10 }}>
              <SvSparkline />
            </div>
            <div className="mono" style={{ fontSize: 10, marginTop: 10, color: "var(--sv3-subtle)" }}>
              fast-burn window: 13m remaining
            </div>
          </Plate>
        </div>
      </div>
    </section>
  );
}

/* ───────────── helpers (local) ───────────── */

function Plate({ children, cols, rows = 1 }: { children: React.ReactNode; cols: number; rows?: number }) {
  return (
    <div
      className="sv3-plate"
      style={{
        gridColumn: `span ${cols}`,
        gridRow: `span ${rows}`,
        padding: 16, position: "relative",
        display: "flex", flexDirection: "column",
        minHeight: 0,
      }}
    >
      {children}
    </div>
  );
}

function PlateHeader({ label, status, right }: { label: string; status?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {status}
        <span className="label">{label}</span>
      </div>
      {right}
    </div>
  );
}

function KV({ k, v, amber }: { k: string; v: string; amber?: boolean }) {
  return (
    <div>
      <div className="label" style={{ fontSize: 9 }}>{k}</div>
      <div className="num" style={{ fontSize: 22, marginTop: 4, color: amber ? "var(--sv3-amber)" : "var(--sv3-fg)" }}>{v}</div>
    </div>
  );
}
