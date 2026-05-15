"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiFiOverviewPanel,
  HiFiDecisionPanel,
  HiFiProofObjectPanel,
  HiFiFieldLabPanel,
  HiFiReadoutPanel,
} from "./HiFiPanels";

const PANELS = [
  { id: "overview",     label: "Overview",      desc: "Run status, evidence quality, value signal at a glance." },
  { id: "decision",     label: "Decision",      desc: "Priority-weighted reasoning with next-best questions." },
  { id: "proof-object", label: "Proof Object",  desc: "Syntax-highlighted proof JSON with live verify animation." },
  { id: "fieldlab",     label: "FieldLab",      desc: "Services rail, pipeline diagram, and streaming event log." },
  { id: "readout",      label: "Exec Readout",  desc: "Executive narrative with dark/paper mode and approval chain." },
];

function PanelRenderer({ id }: { id: string }) {
  switch (id) {
    case "overview":     return <HiFiOverviewPanel />;
    case "decision":     return <HiFiDecisionPanel />;
    case "proof-object": return <HiFiProofObjectPanel />;
    case "fieldlab":     return <HiFiFieldLabPanel />;
    case "readout":      return <HiFiReadoutPanel />;
    default:             return null;
  }
}

export function HiFiStickyTour() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const totalHeight = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / totalHeight));
      const idx = Math.min(PANELS.length - 1, Math.floor(progress * PANELS.length));
      setActiveIdx(idx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      className="relative py-20"
      style={{ background: "var(--praxis-obsidian)" }}
    >
      {/* section header */}
      <div className="border-b py-20 text-center" style={{ borderColor: "var(--praxis-line)" }}>
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-muted)" }}>
            Field workbench tour
          </div>
          <h2
            className="font-display text-[clamp(2.2rem,5vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.02em]"
            style={{ color: "var(--praxis-bone)" }}
          >
            Every surface, proof-backed.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8" style={{ color: "var(--praxis-muted)" }}>
            Scroll through the five workbench screens — from operational overview to executive readout — each built on the same deterministic proof object.
          </p>
        </div>
      </div>

      {/* sticky scroll track */}
      <div
        ref={trackRef}
        style={{ height: `${PANELS.length * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
          {/* tracker pills */}
          <div
            className="flex items-center justify-center gap-3 border-b px-6 py-3"
            style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}
          >
            {PANELS.map((panel, i) => (
              <button
                key={panel.id}
                onClick={() => {
                  if (!trackRef.current) return;
                  const rect = trackRef.current.getBoundingClientRect();
                  const totalHeight = rect.height - window.innerHeight;
                  const targetProgress = (i / PANELS.length) + 0.01;
                  const scrollY = window.scrollY + rect.top + targetProgress * totalHeight;
                  window.scrollTo({ top: scrollY, behavior: "smooth" });
                }}
                className="border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-500"
                style={{
                  borderColor: i === activeIdx ? "var(--praxis-plasma)" : "var(--praxis-line)",
                  color: i === activeIdx ? "var(--praxis-bone)" : "var(--praxis-muted)",
                  background: i === activeIdx ? "rgba(139,92,255,0.1)" : "transparent",
                  backdropFilter: "blur(28px)",
                }}
              >
                {panel.label}
              </button>
            ))}
          </div>

          {/* panel display area — all panels stay mounted to preserve animations */}
          <div className="relative flex-1 overflow-hidden">
            {PANELS.map((panel, i) => (
              <div
                key={panel.id}
                className="absolute inset-0 transition-all duration-700"
                style={{
                  opacity: i === activeIdx ? 1 : 0,
                  transform: i === activeIdx ? "scale(1)" : i < activeIdx ? "scale(0.98)" : "scale(1.01)",
                  pointerEvents: i === activeIdx ? "auto" : "none",
                  zIndex: i === activeIdx ? 1 : 0,
                }}
              >
                <PanelRenderer id={panel.id} />
              </div>
            ))}
          </div>

          {/* panel description strip */}
          <div
            className="border-t px-6 py-3"
            style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-plasma)" }}>
                  {String(activeIdx + 1).padStart(2, "0")} / {String(PANELS.length).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "var(--praxis-muted)" }}>
                  {PANELS[activeIdx]?.desc}
                </span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-faint)" }}>
                scroll to advance
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
