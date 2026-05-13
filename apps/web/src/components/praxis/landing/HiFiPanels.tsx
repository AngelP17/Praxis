"use client";

// Tokens sourced from globals.css `:root` (canvas-faithful values).
const PLASMA = "var(--praxis-plasma)";
const ARGON = "var(--praxis-argon)";
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
  return (
    <div className="relative h-full w-full" style={{ background: OBSIDIAN, color: BONE }}>
      <ScreenChrome runId="pxs_GA-PRINT-GPO-042" screenLabel="09 / 09 Executive Readout" />
      <Sidebar active="Readout" />

      <div className="absolute bottom-0 left-[176px] right-0 top-[42px] overflow-hidden p-6">
        <div className="grid h-full grid-cols-12 grid-flow-dense gap-[12px]">
          <div className="col-span-8 border p-5" style={{ borderColor: LINE, background: SURFACE }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
              Executive readout &middot; manufacturing-printer-gpo &middot; 2026-Q2
            </div>
            <div className="mt-3 font-display font-medium leading-[1]" style={{ fontSize: 38, letterSpacing: "-0.025em", textWrap: "balance" as const }}>
              Plant-3 printer fleet renewal under GPO &mdash; $38.4K annual recovery, 10-week recurrence cut.
            </div>
            <div className="mt-5 grid grid-cols-3 grid-flow-dense gap-4 font-mono text-[10px]" style={{ color: MUTE }}>
              <div>
                <div className="font-display font-medium" style={{ fontSize: 28, color: BONE }}>$38.4K</div>
                <div className="mt-1 uppercase tracking-[0.14em]">annual value &middot; conf 0.74</div>
              </div>
              <div>
                <div className="font-display font-medium" style={{ fontSize: 28, color: BONE }}>-50%</div>
                <div className="mt-1 uppercase tracking-[0.14em]">ticket recurrence</div>
              </div>
              <div>
                <div className="font-display font-medium" style={{ fontSize: 28, color: ARGON }}>0.82</div>
                <div className="mt-1 uppercase tracking-[0.14em]">evidence trust</div>
              </div>
            </div>
            <div className="mt-5 border-t pt-4 font-mono text-[10.5px] leading-[1.7]" style={{ borderColor: LINE, color: MUTE }}>
              <span style={{ color: BONE }}>What happened.</span> Twelve ticket clusters across plants 1&ndash;4 traced to a single printer-fleet SKU drift under the current vendor contract. Evidence-trust 0.82, mapping_confidence 0.86. Recommended action: initiate GPO swap-out for plant-3, 14-day SLA, human-approved by the Director of Operations.
              <br />
              <br />
              <span style={{ color: BONE }}>Why now.</span> Recurrence is climbing 38% quarter over quarter; the GPO contract window closes in 21 days. Acting now captures the favorable line item; delaying loses it.
            </div>
          </div>

          <div className="col-span-4 flex flex-col gap-[12px]">
            <div className="border p-4" style={{ borderColor: LINE, background: SURFACE }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
                Proof object
              </div>
              <div className="mt-3 space-y-2 font-mono text-[10px]" style={{ color: MUTE }}>
                <div>proof_hash <span style={{ color: BONE }}>b4f9&hellip;c1a2</span></div>
                <div>replay <span style={{ color: ARGON }}>deterministic</span></div>
                <div>signature <span style={{ color: ARGON }}>ed25519 verified</span></div>
                <div>sources <span style={{ color: BONE }}>tickets &middot; ddb &middot; sqs &middot; events</span></div>
              </div>
            </div>
            <div className="border p-4" style={{ borderColor: LINE, background: SURFACE }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: MUTE }}>
                Approval chain
              </div>
              <ol className="mt-3 list-decimal space-y-1 pl-5 font-mono text-[10px]" style={{ color: BONE }}>
                <li>SE compiled (auto)</li>
                <li>Plant lead reviewed</li>
                <li>Ops director <span style={{ color: ARGON }}>approved</span></li>
                <li>CFO sign-off pending</li>
              </ol>
            </div>
            <div className="border p-4" style={{ borderColor: LINE, background: SURFACE_2 }}>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: ARGON }}>
                Risk &middot; residual
              </div>
              <div className="mt-2 font-mono text-[10px]" style={{ color: MUTE }}>
                Vendor lead-time slip beyond 14 days triggers fallback to interim toner contract. Cost delta tracked: <span style={{ color: BONE }}>+$2.1K / wk</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
