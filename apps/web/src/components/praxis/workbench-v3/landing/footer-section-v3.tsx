"use client";

/** V3 footer — square plate, mono columns, hash-chain stamp on the bottom rule. */

import Link from "next/link";
import { SvIco, SvPulse } from "@/components/praxis/workbench-v3/primitives";

const COLS: Array<{ heading: string; items: Array<{ label: string; href: string }> }> = [
  {
    heading: "PLATFORM",
    items: [
      { label: "Command center", href: "/command-center" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Incidents", href: "/incidents" },
      { label: "Replay", href: "/replay/INC-4821" },
      { label: "Audit bundle", href: "/audit" },
    ],
  },
  {
    heading: "SOURCES",
    items: [
      { label: "Telemetry", href: "/platform#telemetry" },
      { label: "Tickets", href: "/platform#tickets" },
      { label: "Kubernetes", href: "/platform#k8s" },
      { label: "Operator input", href: "/platform#operator" },
    ],
  },
  {
    heading: "TRUST",
    items: [
      { label: "Decision provenance", href: "/audit" },
      { label: "Hash chain spec", href: "/audit#hash" },
      { label: "Human checkpoints", href: "/platform#checkpoints" },
      { label: "Evidence lanes", href: "/platform#evidence" },
    ],
  },
];

export function FooterSectionV3() {
  return (
    <footer style={{ padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <div className="sv3-hr-amber" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) repeat(3, minmax(0, 1fr))",
          gap: 32,
          padding: "40px 0 32px",
        }} className="sv3-footer-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <SvIco.Brand size={20} />
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--sv3-fg)" }}>
                Praxis
              </span>
            </div>
            <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.65, color: "var(--sv3-muted)", maxWidth: 320 }}>
              Operational decision platform. Replayable from signal to outcome.
            </p>
            <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <SvPulse kind="ok" />
              <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)", letterSpacing: "0.18em" }}>
                ALL SYSTEMS NOMINAL
              </span>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.heading}>
              <div className="label" style={{ marginBottom: 14 }}>{col.heading}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className="hover:scale-105 transition-transform duration-500"
                      style={{
                        fontSize: 13, color: "var(--sv3-fg)", textDecoration: "none",
                        opacity: 0.85,
                      }}
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sv3-hr" />
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12,
          paddingTop: 16,
        }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--sv3-subtle)", letterSpacing: "0.18em" }}>
            sha256:landing.v3.{Math.floor(Date.now() / 1000).toString(16).slice(-6)} · © {new Date().getFullYear()} Praxis
          </span>
          <div style={{ display: "inline-flex", gap: 18 }}>
            <Link href="/audit" className="mono hover:scale-105 transition-transform duration-500" style={{ fontSize: 10, color: "var(--sv3-muted)", letterSpacing: "0.18em", textDecoration: "none" }}>
              AUDIT TRAIL
            </Link>
            <Link href="/platform" className="mono hover:scale-105 transition-transform duration-500" style={{ fontSize: 10, color: "var(--sv3-muted)", letterSpacing: "0.18em", textDecoration: "none" }}>
              PLATFORM SPEC
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 760px) {
          :global(.sv3-footer-grid) { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
