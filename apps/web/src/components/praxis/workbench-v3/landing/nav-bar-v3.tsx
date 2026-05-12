"use client";

/** V3 nav bar — squared pill, mono labels, amber brand glyph. */

import Link from "next/link";
import { useState } from "react";
import { SvIco, SvPulse } from "@/components/praxis/workbench-v3/primitives";

const LINKS = [
  { href: "/platform", label: "PLATFORM" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/command-center", label: "COMMAND" },
  { href: "/incidents", label: "INCIDENTS" },
  { href: "/replay/INC-4821", label: "REPLAY" },
  { href: "/audit", label: "AUDIT" },
];

export function NavBarV3() {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="sv3"
      style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 50, width: "calc(100% - 2rem)", maxWidth: 1100,
      }}
    >
      <nav
        className="sv3-plate sv3-plate-crisp"
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px",
          backdropFilter: "blur(14px)",
          background: "rgba(14,14,15,0.74)",
        }}
      >
        <Link href="/" className="hover:scale-105 transition-transform duration-500" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--sv3-fg)", textDecoration: "none" }}>
          <SvIco.Brand size={18} />
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Praxis
          </span>
        </Link>

        <div style={{ display: "none", alignItems: "center", gap: 18 }} className="sv3-nav-links">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="mono hover:scale-105 transition-transform duration-500"
              style={{
                fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--sv3-muted)", textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <SvPulse kind="ok" />
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--sv3-muted)" }}>LIVE</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="sv3-mobile-toggle hover:scale-105 transition-transform duration-500"
            style={{
              display: "inline-flex", height: 28, width: 28,
              alignItems: "center", justifyContent: "center",
              border: "1px solid var(--sv3-line-strong)",
              background: "rgba(255,255,255,0.02)",
              color: "var(--sv3-muted)",
              borderRadius: 2,
            }}
          >
            <span style={{ width: 12, height: 1, background: "currentColor", boxShadow: "0 -3px 0 currentColor, 0 3px 0 currentColor" }} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="sv3-plate" style={{ marginTop: 6, padding: 12, background: "rgba(10,10,11,0.94)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="mono hover:scale-105 transition-transform duration-500"
                style={{
                  padding: "10px 12px",
                  fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--sv3-muted)", textDecoration: "none",
                  border: "1px solid transparent",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 900px) {
          :global(.sv3-nav-links) { display: inline-flex !important; }
          :global(.sv3-mobile-toggle) { display: none !important; }
        }
      `}</style>
    </header>
  );
}
