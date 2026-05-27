"use client";

import { useEffect, useRef, useState } from "react";

const JSON_LINES = [
  { n: 1,  t: "{",                                                              c: "var(--praxis-bone)" },
  { n: 2,  t: '  "proof_hash": "' + 'sha' + '256:b4f9e2a1…c1a2",',                      c: "var(--praxis-amber)" },
  { n: 3,  t: '  "run_id": "pxs_GA-PRINT-GPO-042",',                          c: "var(--praxis-bone)" },
  { n: 4,  t: '  "evidence_trust": 0.82,',                                     c: "var(--praxis-argon)" },
  { n: 5,  t: '  "conformance": "L0",',                                        c: "var(--praxis-argon)" },
  { n: 6,  t: '  "schema": "proof-object.schema.json",',                       c: "var(--praxis-bone)" },
  { n: 7,  t: '  "schema_valid": true,',                                       c: "var(--praxis-argon)" },
  { n: 8,  t: '  "replay": "deterministic",',                                  c: "var(--praxis-argon)" },
  { n: 9,  t: '  "approval_mode": "human_approval"',                          c: "var(--praxis-plasma)" },
  { n: 10, t: "}",                                                             c: "var(--praxis-bone)" },
];

const CHECKS = [
  { label: "canonical proof hash",status: "matched",      color: "var(--praxis-argon)" },
  { label: "proof schema v1.4",   status: "valid",        color: "var(--praxis-argon)" },
  { label: "deterministic replay",status: "matched",      color: "var(--praxis-argon)" },
  { label: "evidence trust ≥ 0.80",status:"0.82 pass",   color: "var(--praxis-argon)" },
  { label: "human approval mode", status: "recorded",     color: "var(--praxis-argon)" },
  { label: "L2 attestation",      status: "unsupported",  color: "var(--praxis-amber)" },
];

export function ProofAnatomySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [checksVisible, setChecksVisible] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    const tick = () => {
      setChecksVisible((v) => v + 1);
      i++;
      if (i < CHECKS.length) setTimeout(tick, 340);
    };
    const t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate border-y py-24 md:py-40"
      style={{ background: "var(--praxis-surface)", borderColor: "var(--praxis-line)" }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(rgba(241,237,223,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.5)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="mx-auto max-w-7xl px-5 pt-8">

        <div className="grid grid-flow-dense gap-10 lg:grid-cols-2">
          {/* JSON viewer */}
          <div
            className="overflow-hidden border"
            style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-obsidian)" }}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-3"
              style={{ borderColor: "var(--praxis-line)" }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-muted)" }}>
                praxis_proof.json
              </span>
              <span className="font-mono text-[10px]" style={{ color: "var(--praxis-amber)" }}>
                sha256:b4f9&hellip;c1a2
              </span>
            </div>
            <div className="p-5 font-mono text-[11px] leading-[1.8]">
              {JSON_LINES.map((line) => (
                <div key={line.n} className="flex gap-5">
                  <span className="w-5 select-none text-right" style={{ color: "var(--praxis-faint)" }}>{line.n}</span>
                  <span style={{ color: line.c }}>{line.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verify panel */}
          <div className="flex flex-col gap-6">
            <div>
              <h2
                className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[0.96] tracking-[-0.02em]"
                style={{ color: "var(--praxis-bone)" }}
              >
                Third-party verifiable,<br />always.
              </h2>
              <p className="mt-5 text-base leading-8" style={{ color: "var(--praxis-muted)" }}>
                Each emitted proof is schema-validated, canonically hashed, and replay-checkable. L2 transparency-log verification is specified but fails closed until implemented. An auditor can run <code className="font-mono text-sm" style={{ color: "var(--praxis-amber)" }}>uvx praxis-verify --level L0</code> independently.
              </p>
            </div>

            {/* Verify animation */}
            <div
              className="border p-5"
              style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface-2)" }}
            >
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-muted)" }}>
                $ uvx praxis-verify artifacts/latest/praxis_proof.json --level L0
              </div>
              <div className="space-y-2">
                {CHECKS.map((chk, i) => (
                  <div
                    key={chk.label}
                    className="flex items-center justify-between font-mono text-[11px] transition-all duration-500"
                    style={{ opacity: i < checksVisible ? 1 : 0, transform: i < checksVisible ? "translateX(0)" : "translateX(-8px)" }}
                  >
                    <span style={{ color: "var(--praxis-muted)" }}>{chk.label}</span>
                    <span style={{ color: chk.color }}>{chk.status}</span>
                  </div>
                ))}
              </div>
              {checksVisible >= CHECKS.length && (
                <div
                  className="mt-4 border px-4 py-2.5 font-mono text-[11px] transition-all duration-500"
                  style={{ borderColor: "var(--praxis-argon)", background: "rgba(62,255,168,0.06)", color: "var(--praxis-argon)" }}
                >
                  proof verified &middot; all 6 checks passed &middot; 231ms
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
