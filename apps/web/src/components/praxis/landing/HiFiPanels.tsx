"use client";

import { useEffect, useState } from "react";

// Tokens sourced from globals.css `:root` (canvas-faithful values).
const PLASMA = "var(--praxis-plasma)";
const ARGON = "var(--praxis-argon)";
const AMBER = "var(--praxis-amber)";
const BONE = "var(--praxis-bone)";
const OBSIDIAN = "var(--praxis-obsidian)";
const SURFACE = "var(--praxis-surface)";
const SURFACE_2 = "var(--praxis-surface-2)";
const LINE = "var(--praxis-line)";
const MUTE = "var(--praxis-mute)";
const FAINT = "var(--praxis-faint)";
const CRIT = "var(--praxis-crit)";

function ScreenChrome({ runId, screenLabel }: { runId: string; screenLabel: string }) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em]"
      style={{ borderColor: LINE, color: MUTE, background: OBSIDIAN }}
    >
      <span style={{ color: BONE }}>praxis &middot; field workbench</span>
      <span>{screenLabel}</span>
      <span>run_id &middot; <span style={{ color: BONE }}>{runId}</span></span>
    </div>
  );
}

function Sidebar({ active }: { active: string }) {
  const items = [
    "Overview",
    "Solution Packs",
    "FieldLab",
    "Ontology",
    "Decision",
    "Discovery",
    "Value Case",
    "Expansion",
    "Proof Object",
    "Readout",
  ];
  return (
    <aside
      className="absolute bottom-0 left-0 top-[42px] flex w-[176px] flex-col border-r px-4 py-5"
      style={{ borderColor: LINE, background: SURFACE, color: MUTE }}
    >
      <div className="mb-4 font-mono text-[9px] uppercase tracking-[0.2em]">Workbench</div>
      {items.map((label) => {
        const on = label === active;
        return (
          <div
            key={label}
            className="flex items-center border-l-2 px-3 py-[7px] font-mono text-[11px]"
            style={{
              borderColor: on ? PLASMA : "transparent",
              color: on ? BONE : MUTE,
              background: on ? "rgba(139,92,255,0.10)" : "transparent",
            }}
          >
            {label}
          </div>
        );
      })}
      <div className="mt-auto border-t pt-3 font-mono text-[9px] uppercase tracking-[0.18em]" style={{ borderColor: LINE }}>
        floci &middot; <span style={{ color: ARGON }}>ready</span>
      </div>
    </aside>
  );
}

export function HiFiOverviewPanel() {
  return (
    <div className="relative h-full w-full" style={{ background: OBSIDIAN, color: BONE }}>
      <ScreenChrome runId="pxs_GA-PRINT-GPO-042" screenLabel="01 / 09 Overview" />
      <Sidebar active="Overview" />

      <div className="absolute bottom-0 left-[176px] right-0 top-[42px] grid grid-cols-12 grid-flow-dense gap-[10px] p-5">
        {/* run status */}
        <div className="col-span-5 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
            Fieldlab run &middot; <span style={{ color: ARGON }}>active</span>
          </div>
          <div className="mt-3 font-display text-[24px] font-medium leading-[1.05]" style={{ letterSpacing: "-0.015em" }}>
            manufacturing-printer-gpo
          </div>
          <div className="mt-2 font-mono text-[10px]" style={{ color: MUTE }}>
            director of operations &middot; 4 plants &middot; 7 vendors
          </div>
          <div className="mt-4 grid grid-cols-3 grid-flow-dense gap-3 font-mono text-[10px]" style={{ color: MUTE }}>
            <div>
              <div style={{ color: BONE, fontSize: 20 }}>12</div>
              <div className="mt-1 uppercase tracking-[0.16em]">events ingested</div>
            </div>
            <div>
              <div style={{ color: BONE, fontSize: 20 }}>0.86</div>
              <div className="mt-1 uppercase tracking-[0.16em]">mapping conf.</div>
            </div>
            <div>
              <div style={{ color: ARGON, fontSize: 20 }}>0.82</div>
              <div className="mt-1 uppercase tracking-[0.16em]">evidence trust</div>
            </div>
          </div>
        </div>

        {/* evidence quality */}
        <div className="col-span-4 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
            Evidence breakdown
          </div>
          <div className="mt-4 space-y-[10px] font-mono text-[10px]">
            {[
              ["source_reliability", 0.88, ARGON],
              ["freshness", 0.82, ARGON],
              ["corroboration", 0.78, ARGON],
              ["completeness", 0.71, PLASMA],
              ["consistency", 0.85, ARGON],
              ["auditability", 0.92, ARGON],
            ].map(([label, v, color]) => (
              <div key={label as string}>
                <div className="flex justify-between" style={{ color: MUTE }}>
                  <span>{label}</span>
                  <span style={{ color: BONE }}>{(v as number).toFixed(2)}</span>
                </div>
                <div className="mt-1 h-[3px] w-full" style={{ background: SURFACE_2 }}>
                  <div className="h-full" style={{ width: `${(v as number) * 100}%`, background: color as string }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* value signal */}
        <div className="col-span-3 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
            Value signal
          </div>
          <div
            className="mt-3 font-display font-medium leading-[0.9]"
            style={{
              fontSize: 44,
              background: `linear-gradient(110deg, ${PLASMA}, ${ARGON})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            $38.4K
          </div>
          <div className="mt-2 font-mono text-[10px]" style={{ color: MUTE }}>
            annual &middot; conf 0.74
          </div>
          <div className="mt-4 border-t pt-3 font-mono text-[10px]" style={{ borderColor: LINE, color: MUTE }}>
            primary driver
            <div style={{ color: BONE }}>printer-fleet downtime</div>
          </div>
        </div>

        {/* workflow progress */}
        <div className="col-span-12 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
            <span>Workflow timeline</span>
            <span>7 min &middot; signal &rarr; readout</span>
          </div>
          <div className="mt-3 grid grid-cols-8 grid-flow-dense gap-2">
            {[
              ["Select", true],
              ["Context", true],
              ["Ontology", true],
              ["FieldLab", true],
              ["Events", true],
              ["Decide", true],
              ["Action", true],
              ["Readout", false],
            ].map(([label, done], i) => (
              <div
                key={label as string}
                className="border p-2 font-mono text-[9px] uppercase tracking-[0.14em]"
                style={{
                  borderColor: done ? PLASMA : LINE,
                  color: done ? BONE : MUTE,
                  background: done ? "rgba(139,92,255,0.08)" : "transparent",
                }}
              >
                <div style={{ color: done ? ARGON : FAINT }}>0{i + 1}</div>
                <div className="mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HiFiDecisionPanel() {
  return (
    <div className="relative h-full w-full" style={{ background: OBSIDIAN, color: BONE }}>
      <ScreenChrome runId="pxs_GA-PRINT-GPO-042" screenLabel="05 / 09 Decision" />
      <Sidebar active="Decision" />

      <div className="absolute bottom-0 left-[176px] right-0 top-[42px] grid grid-cols-12 grid-flow-dense gap-[10px] p-5">
        <div className="col-span-7 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
            <span>Decision &middot; <span style={{ color: PLASMA }}>review required</span></span>
            <span>priority 0.74 &middot; conf 0.81</span>
          </div>
          <div className="mt-3 font-display text-[22px] font-medium leading-[1.1]" style={{ letterSpacing: "-0.015em" }}>
            Replace plant-3 printer fleet under GPO contract &mdash; 14-day delivery, 6-week stabilisation.
          </div>
          <div className="mt-4 font-mono text-[10px]" style={{ color: MUTE }}>
            root_cause_hypothesis
            <div style={{ color: BONE }}>fleet age &middot; toner SKU drift &middot; ticket cluster Q1</div>
          </div>
          <div className="mt-4 grid grid-cols-2 grid-flow-dense gap-3 font-mono text-[10px]">
            {[
              ["recurrence_rate", "0.32 / mo", ARGON],
              ["mttr_hours", "11.4", PLASMA],
              ["ticket_volume", "+38% qoq", PLASMA],
              ["budget_impact", "+$12.1K", BONE],
              ["vendor_dependency", "single source", PLASMA],
              ["compliance_risk", "low", ARGON],
            ].map(([k, v, c]) => (
              <div key={k} className="border p-2" style={{ borderColor: LINE }}>
                <div style={{ color: MUTE }}>{k}</div>
                <div className="mt-1" style={{ color: c }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-5 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
            Priority weighting &middot; 10 factors
          </div>
          <div className="mt-3 space-y-[6px] font-mono text-[10px]">
            {[
              ["impact_breadth", 0.92],
              ["revenue_at_risk", 0.78],
              ["evidence_trust", 0.82],
              ["recurrence", 0.65],
              ["sla_breach_likelihood", 0.55],
              ["effort_to_fix", 0.42],
              ["blast_radius", 0.71],
              ["vendor_exposure", 0.88],
              ["stakeholder_pressure", 0.61],
              ["audit_risk", 0.34],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-center gap-2">
                <div className="w-[140px]" style={{ color: MUTE }}>{k}</div>
                <div className="h-[3px] flex-1" style={{ background: SURFACE_2 }}>
                  <div className="h-full" style={{ width: `${(v as number) * 100}%`, background: PLASMA }} />
                </div>
                <div className="w-[34px] text-right" style={{ color: BONE }}>{(v as number).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-7 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
            Next-best questions &middot; value of information
          </div>
          <ol className="mt-3 list-decimal space-y-2 pl-5 font-mono text-[11px]" style={{ color: BONE }}>
            <li>What is the average toner cost per page across plants 1&ndash;4?</li>
            <li>Are tickets P1&ndash;P3 correlated with calibration logs from vendor-A?</li>
            <li>Confirm GPO contract clause 4.2 covers fleet swap-out within 14 days.</li>
          </ol>
          <div className="mt-3 font-mono text-[10px]" style={{ color: MUTE }}>
            answering all three lifts confidence to <span style={{ color: ARGON }}>0.91</span>
          </div>
        </div>

        <div className="col-span-5 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
            Recommended action &middot; <span style={{ color: PLASMA }}>human approval</span>
          </div>
          <div className="mt-3 font-display text-[16px] font-medium leading-[1.2]">
            Initiate GPO swap-out for plant-3 fleet, 14-day SLA.
          </div>
          <div className="mt-4 grid grid-cols-2 grid-flow-dense gap-2 font-mono text-[10px]" style={{ color: MUTE }}>
            <div>mode <span style={{ color: BONE }}>HUMAN_APPROVAL</span></div>
            <div>actor <span style={{ color: BONE }}>ops-director</span></div>
            <div>writeback <span style={{ color: BONE }}>blocked</span></div>
            <div>audit_hash <span style={{ color: ARGON }}>9f3a&hellip;</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <span
              className="border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ background: BONE, color: OBSIDIAN, borderColor: BONE }}
            >
              Approve
            </span>
            <span
              className="border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ borderColor: LINE, color: BONE }}
            >
              Send back for review
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HiFiReadoutPanel() {
  const [mode, setMode] = useState<"dark" | "paper">("dark");
  const paper = mode === "paper";

  const bg      = paper ? "#F1EDDF" : OBSIDIAN;
  const surface = paper ? "#E8E4D4" : SURFACE;
  const surface2= paper ? "#DDD9C8" : SURFACE_2;
  const line    = paper ? "#C8C4B0" : LINE;
  const bone    = paper ? "#1C1A2E" : BONE;
  const mute    = paper ? "#6B6655" : MUTE;
  const argon   = paper ? "#1A7A52" : ARGON;

  return (
    <div className="relative h-full w-full transition-colors duration-500" style={{ background: bg, color: bone }}>
      {/* custom topbar with toggle */}
      <div
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ borderColor: line, color: mute, background: bg }}
      >
        <span style={{ color: bone }}>praxis &middot; field workbench</span>
        <span>09 / 09 Executive Readout</span>
        <div className="flex items-center gap-3">
          <span>run_id &middot; <span style={{ color: bone }}>pxs_GA-PRINT-GPO-042</span></span>
          {/* dark / paper toggle */}
          <div
            className="flex items-center rounded-full border"
            style={{ borderColor: line, background: surface }}
          >
            {(["dark", "paper"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition-all duration-300"
                style={{
                  color: mode === m ? bone : mute,
                  background: mode === m ? (paper ? "#1C1A2E" : BONE) : "transparent",
                  borderRadius: "9999px",
                  ...(mode === m && !paper ? { color: OBSIDIAN } : {}),
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Sidebar active="Readout" />

      <div className="absolute bottom-0 left-[176px] right-0 top-[42px] overflow-hidden p-6">
        {paper && (
          <div
            className="pointer-events-none absolute inset-0 -z-0 opacity-[0.04]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat" }}
          />
        )}
        <div className="grid h-full grid-cols-12 grid-flow-dense gap-[12px]">
          <div className="col-span-8 border p-5" style={{ borderColor: line, background: surface }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: mute }}>
              Executive readout &middot; manufacturing-printer-gpo &middot; 2026-Q2
            </div>
            <div className="mt-3 font-display font-medium leading-[1]" style={{ fontSize: 38, letterSpacing: "-0.025em", textWrap: "balance" as const, color: bone }}>
              Plant-3 printer fleet renewal under GPO &mdash; $38.4K annual recovery, 10-week recurrence cut.
            </div>
            <div className="mt-5 grid grid-cols-3 grid-flow-dense gap-4 font-mono text-[10px]" style={{ color: mute }}>
              <div>
                <div className="font-display font-medium" style={{ fontSize: 28, color: bone }}>$38.4K</div>
                <div className="mt-1 uppercase tracking-[0.14em]">annual value &middot; conf 0.74</div>
              </div>
              <div>
                <div className="font-display font-medium" style={{ fontSize: 28, color: bone }}>-50%</div>
                <div className="mt-1 uppercase tracking-[0.14em]">ticket recurrence</div>
              </div>
              <div>
                <div className="font-display font-medium" style={{ fontSize: 28, color: argon }}>0.82</div>
                <div className="mt-1 uppercase tracking-[0.14em]">evidence trust</div>
              </div>
            </div>
            <div className="mt-5 border-t pt-4 font-mono text-[10.5px] leading-[1.7]" style={{ borderColor: line, color: mute }}>
              <span style={{ color: bone }}>What happened.</span> Twelve ticket clusters across plants 1&ndash;4 traced to a single printer-fleet SKU drift under the current vendor contract. Evidence-trust 0.82, mapping_confidence 0.86. Recommended action: initiate GPO swap-out for plant-3, 14-day SLA, human-approved by the Director of Operations.
              <br /><br />
              <span style={{ color: bone }}>Why now.</span> Recurrence is climbing 38% quarter over quarter; the GPO contract window closes in 21 days. Acting now captures the favorable line item; delaying loses it.
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-[12px]">
            <div className="border p-4" style={{ borderColor: line, background: surface }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: mute }}>Proof object</div>
              <div className="mt-3 space-y-2 font-mono text-[10px]" style={{ color: mute }}>
                <div>proof_hash <span style={{ color: bone }}>b4f9&hellip;c1a2</span></div>
                <div>replay <span style={{ color: argon }}>deterministic</span></div>
                <div>signature <span style={{ color: argon }}>ed25519 verified</span></div>
                <div>sources <span style={{ color: bone }}>tickets &middot; ddb &middot; sqs &middot; events</span></div>
              </div>
            </div>
            <div className="border p-4" style={{ borderColor: line, background: surface }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: mute }}>Approval chain</div>
              <ol className="mt-3 list-decimal space-y-1 pl-5 font-mono text-[10px]" style={{ color: bone }}>
                <li>SE compiled (auto)</li>
                <li>Plant lead reviewed</li>
                <li>Ops director <span style={{ color: argon }}>approved</span></li>
                <li>CFO sign-off pending</li>
              </ol>
            </div>
            <div className="border p-4" style={{ borderColor: line, background: surface2 }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: argon }}>Risk &middot; residual</div>
              <div className="mt-2 font-mono text-[10px]" style={{ color: mute }}>
                Vendor lead-time slip beyond 14 days triggers fallback to interim toner contract. Cost delta tracked: <span style={{ color: bone }}>+$2.1K / wk</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PROOF_JSON_LINES = [
  { n: 1,  t: "{", c: "var(--praxis-bone)" },
  { n: 2,  t: '  "proof_hash": "sha256:b4f9e2a1…c1a2",', c: "var(--praxis-amber)" },
  { n: 3,  t: '  "run_id": "pxs_GA-PRINT-GPO-042",', c: "var(--praxis-bone)" },
  { n: 4,  t: '  "solution_pack": "manufacturing-printer-gpo",', c: "var(--praxis-bone)" },
  { n: 5,  t: '  "conformance": "L1",', c: "var(--praxis-argon)" },
  { n: 6,  t: '  "evidence_trust": 0.82,', c: "var(--praxis-argon)" },
  { n: 7,  t: '  "events_processed": 12,', c: "var(--praxis-bone)" },
  { n: 8,  t: '  "signature": {', c: "var(--praxis-bone)" },
  { n: 9,  t: '    "alg": "ed25519",', c: "var(--praxis-bone)" },
  { n: 10, t: '    "verified": true,', c: "var(--praxis-argon)" },
  { n: 11, t: '    "sigstore_bundle": "rekor:sha256:9f3a…"', c: "var(--praxis-amber)" },
  { n: 12, t: '  },', c: "var(--praxis-bone)" },
  { n: 13, t: '  "merkle_root": "sha256:7d2c…e4f1",', c: "var(--praxis-amber)" },
  { n: 14, t: '  "replay": "deterministic",', c: "var(--praxis-argon)" },
  { n: 15, t: '  "estimated_value_usd": 38400,', c: "var(--praxis-bone)" },
  { n: 16, t: '  "priority_score": 0.74,', c: "var(--praxis-bone)" },
  { n: 17, t: '  "decision": "Initiate GPO swap-out, plant-3",', c: "var(--praxis-bone)" },
  { n: 18, t: '  "approval_mode": "HUMAN_APPROVAL"', c: "var(--praxis-plasma)" },
  { n: 19, t: "}", c: "var(--praxis-bone)" },
];

const VERIFY_CHECKS = [
  { label: "ed25519 signature", status: "verified", color: "var(--praxis-argon)" },
  { label: "proof schema v1.4", status: "valid", color: "var(--praxis-argon)" },
  { label: "deterministic replay", status: "matched", color: "var(--praxis-argon)" },
  { label: "evidence trust ≥ 0.80", status: "0.82 pass", color: "var(--praxis-argon)" },
  { label: "merkle root integrity", status: "intact", color: "var(--praxis-amber)" },
  { label: "sigstore attestation", status: "rekor anchor", color: "var(--praxis-amber)" },
];

export function HiFiProofObjectPanel() {
  const [verified, setVerified] = useState(false);
  const [checksVisible, setChecksVisible] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setVerified(true), 2200);
    let i = 0;
    const tick = () => {
      setChecksVisible((v) => v + 1);
      i++;
      if (i < VERIFY_CHECKS.length) setTimeout(tick, 320);
    };
    const t2 = setTimeout(tick, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: OBSIDIAN, color: BONE }}>
      <ScreenChrome runId="pxs_GA-PRINT-GPO-042" screenLabel="07 / 09 Proof Object" />
      <Sidebar active="Proof Object" />
      <div className="absolute bottom-0 left-[176px] right-0 top-[42px] grid grid-flow-dense grid-cols-12 gap-[10px] overflow-auto p-5">
        <div className="col-span-7 flex flex-col border" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="flex items-center justify-between border-b px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ borderColor: LINE, color: MUTE }}>
            <span>praxis_proof.json</span>
            <span style={{ color: "var(--praxis-amber)" }}>sha256:b4f9&hellip;c1a2</span>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-[10.5px] leading-[1.7]">
            {PROOF_JSON_LINES.map((line) => (
              <div key={line.n} className="flex gap-4">
                <span className="w-6 select-none text-right" style={{ color: "var(--praxis-faint)" }}>{line.n}</span>
                <span style={{ color: line.c }}>{line.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-5 flex flex-col gap-[10px]">
          <div className="border p-4" style={{ borderColor: LINE, background: SURFACE }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>uvx praxis-verify &middot; output</div>
            <div className="mt-3 space-y-2">
              {VERIFY_CHECKS.slice(0, checksVisible).map((chk) => (
                <div key={chk.label} className="flex items-center justify-between font-mono text-[10px]">
                  <span style={{ color: MUTE }}>{chk.label}</span>
                  <span style={{ color: chk.color }}>{chk.status}</span>
                </div>
              ))}
            </div>
            {verified && (
              <div className="mt-4 border px-3 py-2 font-mono text-[11px]" style={{ borderColor: "var(--praxis-argon)", background: "rgba(62,255,168,0.06)", color: "var(--praxis-argon)" }}>
                proof verified &middot; all checks passed
              </div>
            )}
          </div>
          <div className="border p-4" style={{ borderColor: LINE, background: SURFACE }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>Merkle tree</div>
            <div className="mt-3 space-y-2 font-mono text-[9px]">
              <div className="flex items-center gap-2"><span style={{ color: "var(--praxis-amber)" }}>ROOT</span><span style={{ color: MUTE }}>sha256:7d2c&hellip;e4f1</span></div>
              <div className="ml-4 flex items-center gap-2"><span style={{ color: PLASMA }}>L</span><span style={{ color: MUTE }}>events &rarr; ontology &rarr; decision</span></div>
              <div className="ml-4 flex items-center gap-2"><span style={{ color: PLASMA }}>R</span><span style={{ color: MUTE }}>evidence &rarr; action &rarr; value_case</span></div>
              <div className="ml-8 flex items-center gap-2"><span style={{ color: "var(--praxis-amber)" }}>sigstore</span><span style={{ color: MUTE }}>rekor:9f3a&hellip;</span></div>
            </div>
          </div>
          <div className="border p-4" style={{ borderColor: "var(--praxis-amber)", background: "rgba(232,184,111,0.06)" }}>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--praxis-amber)" }}>Attestation</div>
            <div className="mt-2 space-y-1 font-mono text-[10px]" style={{ color: MUTE }}>
              <div>alg <span style={{ color: BONE }}>ed25519</span></div>
              <div>anchor <span style={{ color: "var(--praxis-amber)" }}>rekor &middot; sha256:9f3a&hellip;</span></div>
              <div>timestamp <span style={{ color: BONE }}>2026-05-15T14:22:07Z</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FIELDLAB_SERVICES = [
  { name: "SQS", role: "event ingestion", healthy: true },
  { name: "S3", role: "artifact storage", healthy: true },
  { name: "DDB", role: "proof ledger", healthy: true },
  { name: "EventBridge", role: "routing", healthy: true },
  { name: "Lambda", role: "compute", healthy: true },
];

const FIELDLAB_EVENTS = [
  { t: "14:22:01", stage: "signal",   msg: "ticket_cluster_P2 ingested \xb7 trust 0.88",          color: "var(--praxis-argon)" },
  { t: "14:22:02", stage: "signal",   msg: "calibration_log_drift detected \xb7 trust 0.81",      color: "var(--praxis-argon)" },
  { t: "14:22:03", stage: "ontology", msg: "PLC_Unit linked → Printer_Fleet_SKU",             color: "var(--praxis-plasma)" },
  { t: "14:22:04", stage: "ontology", msg: "vendor_contract mapped → GPO_Clause_4.2",        color: "var(--praxis-plasma)" },
  { t: "14:22:05", stage: "decision", msg: "priority_score 0.74 \xb7 confidence 0.81",            color: "var(--praxis-bone)" },
  { t: "14:22:06", stage: "action",   msg: "HUMAN_APPROVAL required \xb7 notifying ops-director", color: "var(--praxis-amber)" },
  { t: "14:22:07", stage: "proof",    msg: "merkle_root sealed \xb7 ed25519 signed",              color: "var(--praxis-amber)" },
  { t: "14:22:08", stage: "proof",    msg: "rekor attestation anchored",                           color: "var(--praxis-amber)" },
];

export function HiFiFieldLabPanel() {
  const [visibleEvents, setVisibleEvents] = useState(0);

  useEffect(() => {
    if (visibleEvents >= FIELDLAB_EVENTS.length) return;
    const t = setTimeout(() => setVisibleEvents((v) => v + 1), 420);
    return () => clearTimeout(t);
  }, [visibleEvents]);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: OBSIDIAN, color: BONE }}>
      <ScreenChrome runId="pxs_GA-PRINT-GPO-042" screenLabel="08 / 09 FieldLab" />
      <Sidebar active="FieldLab" />
      <div className="absolute bottom-0 left-[176px] right-0 top-[42px] grid grid-flow-dense grid-cols-12 gap-[10px] p-5">
        <div className="col-span-3 flex flex-col gap-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>Services</div>
          {FIELDLAB_SERVICES.map((svc) => (
            <div key={svc.name} className="flex items-center gap-3 border p-3 font-mono text-[10px]" style={{ borderColor: LINE, background: SURFACE }}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: svc.healthy ? "var(--praxis-argon)" : "var(--praxis-crit)", boxShadow: svc.healthy ? "0 0 6px var(--praxis-argon)" : undefined }} />
              <div>
                <div style={{ color: BONE }}>{svc.name}</div>
                <div style={{ color: MUTE }}>{svc.role}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-9 border p-4" style={{ borderColor: LINE, background: SURFACE }}>
          <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>Signal &rarr; Proof &middot; pipeline</div>
          <div className="mt-4 flex items-center gap-2">
            {["Signal", "Ontology", "Decision", "Action", "Proof"].map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div className="border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em]" style={{ borderColor: "var(--praxis-argon)", color: BONE, background: "rgba(62,255,168,0.08)" }}>{stage}</div>
                {i < 4 && <span style={{ color: MUTE }}>&rarr;</span>}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>Event stream</div>
            <div className="space-y-1 font-mono text-[10px]">
              {FIELDLAB_EVENTS.slice(0, visibleEvents).map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ color: "var(--praxis-faint)" }}>{ev.t}</span>
                  <span className="w-16 shrink-0 uppercase" style={{ color: ev.color }}>{ev.stage}</span>
                  <span style={{ color: MUTE }}>{ev.msg}</span>
                </div>
              ))}
              {visibleEvents < FIELDLAB_EVENTS.length && (
                <div style={{ color: PLASMA }}><span className="animate-pulse">&#9618;</span></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
