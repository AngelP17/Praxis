"use client";

/**
 * Praxis Workbench V3 — flagship visual primitives.
 * TSX port of the mockup's primitives.jsx. Used by v3 surfaces only.
 * Class names live in styles/praxis-workbench.css; consumers must wrap their
 * surface in a .sv3 element so the tokens are scoped.
 */

import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

/* ───────────── Inline SVG icon set (currentColor, 1.5px stroke) ───────────── */

type IconProps = { size?: number; className?: string };

const sw = (p: IconProps, extra: Record<string, unknown> = {}) => ({
  viewBox: "0 0 24 24",
  width: p.size ?? 14,
  height: p.size ?? 14,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: p.className,
  ...extra,
});

export const SvIco = {
  Bolt: (p: IconProps = {}) => (<svg {...sw(p)}><path d="M13 3 L4 14 h7 l-1 7 9-11 h-7 z"/></svg>),
  Hash: (p: IconProps = {}) => (<svg {...sw(p)}><path d="M4 9h16M4 15h16M10 4l-2 16M16 4l-2 16"/></svg>),
  Arrow: (p: IconProps = {}) => (<svg {...sw(p)}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  Play: (p: IconProps = {}) => (<svg {...sw(p, { fill: "currentColor", stroke: "none" })}><path d="M7 5l12 7-12 7z"/></svg>),
  Layers: (p: IconProps = {}) => (<svg {...sw(p)}><path d="M12 3 3 8l9 5 9-5z M3 13l9 5 9-5 M3 18l9 5 9-5"/></svg>),
  Shield: (p: IconProps = {}) => (<svg {...sw(p)}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg>),
  Cpu: (p: IconProps = {}) => (<svg {...sw(p, { strokeLinecap: undefined })}><rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 9h6v6H9z M3 10h3 M3 14h3 M18 10h3 M18 14h3 M10 3v3 M14 3v3 M10 18v3 M14 18v3"/></svg>),
  Wave: (p: IconProps = {}) => (<svg {...sw(p)}><path d="M3 12 L6 12 L8 6 L11 18 L13 9 L15 15 L17 12 L21 12"/></svg>),
  Doc: (p: IconProps = {}) => (<svg {...sw(p)}><path d="M14 3 H6 a1 1 0 0 0-1 1 v16 a1 1 0 0 0 1 1 h12 a1 1 0 0 0 1-1 V8 z M14 3 v5 h5 M8 13h8 M8 17h6"/></svg>),
  K8s: (p: IconProps = {}) => (<svg {...sw(p, { strokeLinecap: undefined })}><polygon points="12,3 21,8 19,18 5,18 3,8"/><circle cx="12" cy="12" r="3"/></svg>),
  Check: (p: IconProps = {}) => (<svg {...sw(p, { strokeWidth: 1.8 })}><path d="M5 12l5 5 9-11"/></svg>),
  Q: (p: IconProps = {}) => (<svg {...sw(p, { strokeWidth: 1.6 })}><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-1 .5-1.5 1-1.5 2.5 M12 17.5h.01"/></svg>),
  Ack: (p: IconProps = {}) => (<svg {...sw(p)}><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>),
  Brand: (p: IconProps = {}) => (
    <svg viewBox="0 0 32 32" width={p.size ?? 22} height={p.size ?? 22} fill="none" className={p.className}>
      <rect x="2" y="2" width="28" height="28" stroke="currentColor" strokeWidth={1} opacity={0.6}/>
      <path d="M6 22 L12 8 L20 26 L26 12" stroke="#E5A83B" strokeWidth={1.6} fill="none"/>
      <circle cx="12" cy="8" r="1.6" fill="#E5A83B"/>
      <circle cx="20" cy="26" r="1.6" fill="#E5A83B"/>
    </svg>
  ),
};

/* ───────────── Pulse ───────────── */

export type PulseKind = "ok" | "amber" | "crit" | "warn" | "stale";

export function SvPulse({ kind = "ok" }: { kind?: PulseKind }) {
  const cls = kind === "ok" ? "sv3-pulse" : `sv3-pulse ${kind}`;
  return <span className={cls} />;
}

/* ───────────── Corner accents ───────────── */

export function SvCorners({ amber }: { amber?: boolean }) {
  const c = amber ? "var(--sv3-amber-line)" : "var(--sv3-line-strong)";
  const base: CSSProperties = { position: "absolute", width: 10, height: 10, pointerEvents: "none" };
  return (
    <>
      <span style={{ ...base, top: -1, left:  -1, borderTop:    `1px solid ${c}`, borderLeft:  `1px solid ${c}` }} />
      <span style={{ ...base, top: -1, right: -1, borderTop:    `1px solid ${c}`, borderRight: `1px solid ${c}` }} />
      <span style={{ ...base, bottom: -1, left:  -1, borderBottom: `1px solid ${c}`, borderLeft:  `1px solid ${c}` }} />
      <span style={{ ...base, bottom: -1, right: -1, borderBottom: `1px solid ${c}`, borderRight: `1px solid ${c}` }} />
    </>
  );
}

/* ───────────── Magnetic CTA (transform-only on mouse-move) ───────────── */

export function SvMagneticCTA({
  children,
  ghost,
  onClick,
  type = "button",
  disabled,
  href,
  className = "",
}: {
  children: ReactNode;
  ghost?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  href?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ""; };
  const cls = `sv3-cta${ghost ? " ghost" : ""} ${className}`.trim();

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={`hover:scale-105 transition-transform duration-500 ${cls}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`hover:scale-105 transition-transform duration-500 ${cls}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </button>
  );
}

/* ───────────── Chip ───────────── */

export type ChipTone = "default" | "amber" | "ok" | "crit" | "warn" | "info";

export function SvChip({ tone = "default", children }: { tone?: ChipTone; children: ReactNode }) {
  const cls = tone === "default" ? "sv3-chip" : `sv3-chip ${tone}`;
  return <span className={cls}>{children}</span>;
}

/* ───────────── FlowRail (Signal → Decision → Workflow → Feedback → Replay) ───────────── */

export function SvFlowRail({ activeIndex = 0 }: { activeIndex?: number }) {
  const steps = ["SIGNAL", "DECISION", "WORKFLOW", "FEEDBACK", "REPLAY"];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      fontFamily: "var(--font-mono), Geist Mono, monospace",
      fontSize: 10, letterSpacing: "0.18em",
      color: "var(--sv3-subtle)",
    }}>
      {steps.map((s, i) => (
        <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: i === activeIndex ? "var(--sv3-amber)" : undefined }}>{s}</span>
          {i < steps.length - 1 && <span style={{ color: "var(--sv3-line-strong)" }}>──</span>}
        </span>
      ))}
    </div>
  );
}

/* ───────────── Waveform (vertical bars) ───────────── */

export function SvWaveform({ heights, color }: { heights?: number[]; color?: string }) {
  const def = [6, 9, 4, 12, 18, 22, 28, 18, 12, 8, 16, 24, 18, 10, 6, 4, 8, 12, 8, 6, 4, 3, 5, 7];
  const bars = heights ?? def;
  return (
    <div className="sv3-wave">
      {bars.map((h, i) => (
        <i key={i} style={{ height: h, ...(color ? { background: color } : null) }} />
      ))}
    </div>
  );
}

/* ───────────── Sparkline (SLO burn rate-style) ───────────── */

export function SvSparkline({
  points,
  height = 30,
  stroke = "var(--sv3-warn)",
  guide = true,
}: {
  points?: Array<{ x: number; y: number }>;
  height?: number;
  stroke?: string;
  guide?: boolean;
}) {
  const pts = points ?? [
    { x: 0, y: 24 }, { x: 20, y: 22 }, { x: 35, y: 18 }, { x: 50, y: 14 },
    { x: 65, y: 10 }, { x: 80, y: 6 }, { x: 100, y: 4 },
  ];
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 100 ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {guide && <path d="M0 26 L100 18" stroke="var(--sv3-subtle)" strokeWidth={0.6} strokeDasharray="2 2" fill="none" />}
      <path d={d} stroke={stroke} strokeWidth={1.2} fill="none" />
    </svg>
  );
}

/* ───────────── Heatmap (k8s event window) ───────────── */

export function SvHeatmap({ cells = 20, height = 18 }: { cells?: number; height?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cells}, 1fr)`, gap: 2, height }}>
      {Array.from({ length: cells }).map((_, j) => (
        <span
          key={j}
          style={{
            background: j > 15 ? "var(--sv3-ok)" : j > 11 ? "var(--sv3-warn)" : "var(--sv3-ok)",
            opacity: 0.55 + (j % 3) * 0.15,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────── KPad — small key-value tile ───────────── */

export function SvKPad({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  tone?: "amber" | "default";
}) {
  return (
    <div className="sv3-plate" style={{ padding: "12px 14px" }}>
      <div className="label">{label}</div>
      <div
        className={mono ? "num" : undefined}
        style={{
          marginTop: 8,
          fontSize: 14,
          color: tone === "amber" ? "var(--sv3-amber)" : "var(--sv3-fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ───────────── ScenarioStrip — demo banner with amber pulse ───────────── */

export function SvScenarioStrip({
  active,
  ticketId = "INC-4821",
  scenario = "Press vibration cascade",
  children,
}: {
  active: boolean;
  ticketId?: string;
  scenario?: string;
  children?: ReactNode;
}) {
  if (!active) return null;
  return (
    <div
      className="sv3-plate"
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "10px 16px",
        borderColor: "var(--sv3-amber-line)",
        background: "linear-gradient(90deg, rgba(229,168,59,0.08), rgba(229,168,59,0.02) 60%, transparent)",
      }}
    >
      <SvPulse kind="amber" />
      <span className="label label-amber">Operations scenario active</span>
      <span className="label" style={{ color: "var(--sv3-muted)" }}>· {scenario.toLowerCase()} · {ticketId}</span>
      <div style={{ flex: 1 }} />
      {children}
    </div>
  );
}

/* ───────────── PrioBar ───────────── */

export function SvPrioBar({ value }: { value: number }) {
  return (
    <div className="sv3-prio">
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
