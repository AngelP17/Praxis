"use client";

/** V3 product-shell preview — replaces v2's rounded glass with square plates,
 * waveform header, hash-rail timeline, dense KPad metrics. Static; no data deps. */

import { SvIco, SvPulse, SvWaveform, SvSparkline, SvFlowRail, SvPrioBar, SvChip } from "@/components/praxis/workbench-v3/primitives";

const queue = [
  { id: "INC-4821", title: "Press Line 3 vibration cascade", source: "telemetry + ticket", score: 96, sel: true },
  { id: "INC-4814", title: "Telemetry ingest retry burst", source: "kubernetes ingress", score: 88 },
  { id: "INC-4799", title: "ERP auth drift cluster", source: "operator + IAM", score: 82 },
];

export function ProductShellPreviewV3() {
  return (
    <div
      className="sv3-plate sv3-plate-crisp sv3-rise"
      style={{
        position: "relative", padding: 14,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 35px 95px rgba(0,0,0,0.5)",
      }}
    >
      {/* corner accents */}
      <span style={{ position: "absolute", top: -1, left: -1, width: 10, height: 10, borderTop: "1px solid var(--sv3-amber-line)", borderLeft: "1px solid var(--sv3-amber-line)" }} />
      <span style={{ position: "absolute", top: -1, right: -1, width: 10, height: 10, borderTop: "1px solid var(--sv3-amber-line)", borderRight: "1px solid var(--sv3-amber-line)" }} />
      <span style={{ position: "absolute", bottom: -1, left: -1, width: 10, height: 10, borderBottom: "1px solid var(--sv3-amber-line)", borderLeft: "1px solid var(--sv3-amber-line)" }} />
      <span style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderBottom: "1px solid var(--sv3-amber-line)", borderRight: "1px solid var(--sv3-amber-line)" }} />

      {/* topline waveform header */}
      <div className="sv3-plate" style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <SvPulse kind="amber" />
          <span className="label label-amber">Replay + Decision Context</span>
        </div>
        <div style={{ flex: 1, maxWidth: 260, opacity: 0.7 }}>
          <SvWaveform />
        </div>
        <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>26:27 UTC</span>
      </div>

      <div className="sv3-hr-amber" style={{ margin: "10px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)", gap: 12 }}>
        {/* Signal queue */}
        <div className="sv3-plate" style={{ padding: 0 }}>
          <div style={{ padding: "10px 12px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span className="label">Signal Queue</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>4 visible</span>
          </div>
          <div className="sv3-hr" />
          {queue.map((q) => (
            <div
              key={q.id}
              style={{
                padding: "10px 12px",
                borderLeft: q.sel ? "2px solid var(--sv3-amber)" : "2px solid transparent",
                background: q.sel ? "linear-gradient(90deg, rgba(229,168,59,0.10), transparent 70%)" : "transparent",
                borderBottom: "1px solid var(--sv3-line)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: q.sel ? "var(--sv3-amber)" : "var(--sv3-muted)", letterSpacing: "0.08em" }}>{q.id}</span>
                <span className="num" style={{ fontSize: 12, fontWeight: 600, color: q.sel ? "var(--sv3-amber)" : "var(--sv3-fg)" }}>P{q.score}</span>
              </div>
              <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.35, color: "var(--sv3-fg)" }}>{q.title}</div>
              <div className="mono" style={{ fontSize: 9, marginTop: 4, color: "var(--sv3-subtle)" }}>{q.source}</div>
              <div style={{ marginTop: 6 }}><SvPrioBar value={q.score} /></div>
            </div>
          ))}
        </div>

        {/* Right: incident + decision + replay rail + evidence */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="sv3-plate" style={{ padding: 12 }}>
            <span className="label">Selected Incident</span>
            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: "var(--sv3-fg)" }}>Press Line 3 vibration cascade</div>
            <div className="mono" style={{ fontSize: 10, marginTop: 4, color: "var(--sv3-muted)" }}>INC-4821 · machine telemetry + operator ticket</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
              {[["Priority", "96", true], ["Confidence", "0.92"], ["Source", "tel + tkt"]].map(([k, v, amber]) => (
                <div key={k as string} className="sv3-plate" style={{ padding: "8px 10px" }}>
                  <div className="label" style={{ fontSize: 9 }}>{k}</div>
                  <div className="num" style={{ fontSize: 13, marginTop: 4, color: amber ? "var(--sv3-amber)" : "var(--sv3-fg)" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="sv3-plate" style={{ padding: 12 }}>
              <span className="label">Praxis decision</span>
              <p style={{ margin: "6px 0 0", fontSize: 12, lineHeight: 1.5, color: "var(--sv3-fg)" }}>
                Route to mechanical and schedule bearing replacement.
              </p>
              <div className="mono" style={{ fontSize: 10, marginTop: 6, color: "var(--sv3-muted)" }}>root cause: bearing degradation</div>
              <div style={{ marginTop: 8 }}><SvChip tone="amber">checkpoint pending</SvChip></div>
            </div>
            <div className="sv3-plate" style={{ padding: 12 }}>
              <span className="label">Replay hash</span>
              <div className="mono" style={{ fontSize: 11, marginTop: 6, color: "var(--sv3-amber)", wordBreak: "break-all" }}>sha256:inc-4821c9a2f</div>
              <div style={{ marginTop: 10 }}>
                <SvSparkline />
              </div>
            </div>
          </div>

          <div className="sv3-plate" style={{ padding: 12 }}>
            <span className="label">Mini replay timeline</span>
            <div style={{ marginTop: 8 }}>
              <SvFlowRail activeIndex={2} />
            </div>
            <div className="sv3-hr" style={{ margin: "10px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { k: "SLO burn", icon: "Bolt" as const, ok: true },
                { k: "k8s window", icon: "K8s" as const, ok: true },
                { k: "Waveform", icon: "Wave" as const, ok: false },
                { k: "Runbook", icon: "Doc" as const, ok: true },
              ].map((e) => {
                const Icon = SvIco[e.icon];
                return (
                  <div key={e.k} className="sv3-plate" style={{ padding: "8px 10px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: e.ok ? "var(--sv3-ok)" : "var(--sv3-warn)" }}>
                      <Icon size={11} />
                      <span className="label" style={{ color: "inherit", fontSize: 9 }}>{e.k}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 9, marginTop: 6, color: "var(--sv3-subtle)" }}>{e.ok ? "captured" : "ok"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
