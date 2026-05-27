"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  HiFiOverviewPanel,
  HiFiDecisionPanel,
  HiFiProofObjectPanel,
  HiFiFieldLabPanel,
  HiFiReadoutPanel,
} from "./HiFiPanels";

gsap.registerPlugin(ScrollTrigger);

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
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const panelEls = gsap.utils.toArray<HTMLElement>(".tour-panel-trigger");

      panelEls.forEach((trigger, i) => {
        ScrollTrigger.create({
          trigger,
          start: "top center",
          end: "bottom center",
          onEnter: () => setActiveIdx(i),
          onEnterBack: () => setActiveIdx(i),
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToPanel = (i: number) => {
    if (!trackRef.current) return;
    const panelEls = trackRef.current.querySelectorAll(".tour-panel-trigger");
    const target = panelEls[i] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-20"
      style={{ background: "var(--praxis-obsidian)" }}
    >
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
            Scroll through the five workbench screens, from operational overview to executive readout, each built on the same deterministic proof object.
          </p>
        </div>
      </div>

      <div className="sticky top-0 z-10 flex items-center justify-center gap-3 border-b px-6 py-3" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}>
        {PANELS.map((panel, i) => (
          <button
            key={panel.id}
            onClick={() => scrollToPanel(i)}
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

      <div ref={trackRef} className="relative">
        {PANELS.map((panel, i) => (
          <div
            key={panel.id}
            className="tour-panel-trigger min-h-[100dvh] border-b"
            style={{ borderColor: "var(--praxis-line)" }}
          >
            <div className="mx-auto max-w-7xl px-5 py-12">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: i === activeIdx ? "var(--praxis-plasma)" : "var(--praxis-muted)" }}
                >
                  {panel.label}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "var(--praxis-muted)" }}>
                  {panel.desc}
                </span>
              </div>
              <div className="overflow-hidden border" style={{ borderColor: "var(--praxis-line)" }}>
                <PanelRenderer id={panel.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
