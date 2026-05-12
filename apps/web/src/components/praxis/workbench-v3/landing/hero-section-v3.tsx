"use client";

/** V3 hero — split flagship layout. Eyebrow rule + headline + sub + CTAs on
 * left; ProductShellPreviewV3 on right. Background grid + amber radial. */

import Link from "next/link";
import { SvChip, SvFlowRail, SvIco, SvPulse, SvSparkline, SvWaveform } from "@/components/praxis/workbench-v3/primitives";
import { ProductShellPreviewV3 } from "./product-shell-preview-v3";

export function HeroSectionV3() {
  return (
    <section className="py-24 sv3-hero-wow" style={{ position: "relative", overflow: "hidden", padding: "104px 24px 84px" }}>
      <div className="sv3-hero-scan" />
      <div className="sv3-hero-iris" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1540, margin: "0 auto" }}>
        <div className="sv3-hr-amber" style={{ marginBottom: 22 }} />

        <div style={{
          display: "grid",
          gap: 28,
          gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
          alignItems: "center",
        }} className="sv3-hero-grid">
          <div className="sv3-rise">
            <div className="sv3-hero-kicker">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <SvPulse kind="amber" />
                <span className="label label-amber">Operational decision platform</span>
              </span>
              <span className="mono" style={{ color: "var(--sv3-muted)", fontSize: 10, letterSpacing: "0.18em" }}>
                LIVE REPLAY FABRIC
              </span>
            </div>

            <h1 style={{
              margin: "24px 0 0",
              maxWidth: 980,
              fontFamily: "var(--font-sans), Geist, system-ui, sans-serif",
              fontSize: "clamp(3.4rem, 7.2vw, 7.4rem)",
              lineHeight: 0.91, letterSpacing: "-0.045em",
              fontWeight: 600, color: "var(--sv3-fg)",
            }}>
              Every incident,
              <span
                aria-hidden="true"
                className="sv3-inline-image"
                style={{ backgroundImage: "url('https://picsum.photos/seed/praxis-control-room-line/360/160')" }}
              />
              proven.
            </h1>

            <div className="sv3-hero-copy-grid">
              <p style={{
                maxWidth: 560, margin: 0,
                fontSize: 16, lineHeight: 1.7,
                color: "var(--sv3-muted)",
              }}>
                Praxis fuses telemetry, tickets, Kubernetes alerts, and operator notes into decisions your team can inspect, approve, override, and replay.
              </p>
              <div className="sv3-plate sv3-plate-amber" style={{ padding: "12px 14px" }}>
                <div className="label label-amber">Active proof chain</div>
                <div style={{ marginTop: 10 }}>
                  <SvFlowRail activeIndex={3} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <Link href="/command-center" className="hover:scale-105 transition-transform duration-500" style={{ display: "inline-flex" }}>
                <span
                  className="sv3-cta"
                  style={{ display: "inline-flex", alignItems: "center", gap: 12 }}
                >
                  <SvIco.Play size={12} />
                  Open command room
                  <SvIco.Arrow size={14} />
                </span>
              </Link>
              <Link href="/replay/INC-4821" className="hover:scale-105 transition-transform duration-500" style={{ display: "inline-flex" }}>
                <span className="sv3-cta ghost" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <SvIco.Hash size={12} />
                  View replay chain
                </span>
              </Link>
            </div>

            <div className="sv3-hero-mini-grid">
              <HeroSignal label="signals fused" value="2.4M" tone="amber" />
              <HeroSignal label="decision p50" value="184ms" />
              <HeroSignal label="replay coverage" value="97%" tone="ok" />
            </div>
          </div>

          <div className="sv3-hero-stage">
            <div className="sv3-orbit-frame" aria-hidden="true">
              <div className="sv3-orbit-ring sv3-orbit-ring-a" />
              <div className="sv3-orbit-ring sv3-orbit-ring-b" />
              <div className="sv3-orbit-node sv3-orbit-node-a" />
              <div className="sv3-orbit-node sv3-orbit-node-b" />
            </div>
            <div className="sv3-product-lift">
              <ProductShellPreviewV3 />
            </div>
            <DecisionTelemetryWall />
          </div>
        </div>

        <div className="sv3-hr-amber" style={{ marginTop: 56 }} />
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.sv3-hero-grid) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function HeroSignal({ label, value, tone }: { label: string; value: string; tone?: "amber" | "ok" }) {
  const color = tone === "amber" ? "var(--sv3-amber)" : tone === "ok" ? "var(--sv3-ok)" : "var(--sv3-fg)";
  return (
    <div className="sv3-plate" style={{ padding: "12px 14px" }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div className="num" style={{ marginTop: 8, fontSize: 24, color }}>{value}</div>
    </div>
  );
}

function DecisionTelemetryWall() {
  return (
    <aside className="sv3-hero-wall sv3-plate sv3-plate-crisp">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span className="label label-amber">Decision fabric</span>
        <SvChip tone="amber">hash linked</SvChip>
      </div>
      <div style={{ marginTop: 12 }}>
        <SvWaveform heights={[7, 12, 18, 10, 26, 21, 31, 18, 14, 24, 29, 12, 8, 17, 22, 15]} />
      </div>
      <div className="sv3-hr" style={{ margin: "12px 0" }} />
      {[
        ["signal", "telemetry + ticket", "captured"],
        ["decision", "P96 bearing degradation", "scored"],
        ["checkpoint", "operator approval", "pending"],
      ].map(([k, v, s], index) => (
        <div key={k} className="sv3-hero-wall-row" style={{ animationDelay: `${index * 120}ms` }}>
          <span className="mono" style={{ color: "var(--sv3-subtle)", fontSize: 9, letterSpacing: "0.18em" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <div style={{ minWidth: 0 }}>
            <div className="label" style={{ fontSize: 9 }}>{k}</div>
            <div style={{ marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--sv3-fg)", fontSize: 11 }}>
              {v}
            </div>
          </div>
          <span className="mono" style={{ color: index === 2 ? "var(--sv3-amber)" : "var(--sv3-ok)", fontSize: 9 }}>
            {s}
          </span>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <SvSparkline stroke="var(--sv3-amber)" />
      </div>
    </aside>
  );
}
