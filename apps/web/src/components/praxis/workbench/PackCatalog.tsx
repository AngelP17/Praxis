"use client";

import Link from "next/link";
import { SOLUTION_PACKS } from "@/lib/praxis-api";
import { getWorkflowRun } from "@/lib/praxis-workflow";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction } from "./WorkbenchShell";

function StatusTone(status: string): "argon" | "plasma" | "default" | "crit" {
  const s = status.toLowerCase();
  if (s.includes("pilot") || s.includes("live") || s.includes("ready")) return "argon";
  if (s.includes("demo") || s.includes("scope")) return "plasma";
  if (s.includes("defer") || s.includes("block")) return "crit";
  return "default";
}

export function PackCatalog() {
  const topbarRight = (
    <>
      <Pill>{SOLUTION_PACKS.length} packs</Pill>
      <PrimaryAction href={`/proof/${getWorkflowRun("manufacturing-printer-gpo").runId}`}>
        Inspect flagship proof
      </PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      topbar={<TopbarTitle title="Solution Packs" subtitle="Repeatable customer scenarios &middot; canvas catalog" right={topbarRight} />}
    >
      <div className="p-6">
        <div className="mb-4 grid grid-cols-12 grid-flow-dense gap-3 border-b border-[var(--praxis-line)] pb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
          <div className="col-span-12 md:col-span-4">Pack</div>
          <div className="col-span-6 md:col-span-2">Buyer</div>
          <div className="col-span-6 md:col-span-2">Priority</div>
          <div className="col-span-6 md:col-span-2">Status</div>
          <div className="col-span-6 md:col-span-2 text-right">Annual value</div>
        </div>

        <div className="flex flex-col">
          {SOLUTION_PACKS.map((p) => {
            const run = getWorkflowRun(p.id);
            return (
              <Link
                key={p.id}
                href={`/proof/${run.runId}`}
                className="group grid grid-cols-12 grid-flow-dense items-center gap-3 border-b border-[var(--praxis-line)] py-4 transition-transform hover:translate-x-1"
              >
                <div className="col-span-12 md:col-span-4">
                  <div className="font-display text-[18px] font-medium tracking-[-0.01em]">{p.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                    {p.id}
                  </div>
                </div>
                <div className="col-span-6 truncate text-[13px] md:col-span-2">{p.buyer}</div>
                <div className="col-span-6 md:col-span-2">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span style={{ color: "var(--praxis-plasma)" }}>{p.priorityScore.toFixed(2)}</span>
                    <div className="h-[3px] flex-1 bg-[var(--praxis-line)]">
                      <div
                        className="h-full"
                        style={{ width: `${p.priorityScore * 100}%`, background: "var(--praxis-plasma)" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Pill tone={StatusTone(p.status)}>{p.status}</Pill>
                </div>
                <div className="col-span-6 text-right font-display text-[22px] font-medium tracking-[-0.01em] md:col-span-2">
                  {p.annualValue}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-1 grid-flow-dense gap-4 md:grid-cols-3">
          {SOLUTION_PACKS.map((p) => {
            const run = getWorkflowRun(p.id);
            return (
              <article
                key={`detail-${p.id}`}
                className="flex flex-col border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-5"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: "var(--praxis-plasma)" }}>
                  {p.id}
                </div>
                <h3 className="mt-2 font-display text-[20px] font-medium tracking-[-0.01em]">{p.name}</h3>
                <p className="mt-2 text-[13px] leading-[1.55] text-[var(--praxis-mute)]">{p.rootCause}</p>
                <div className="mt-4 grid grid-cols-2 grid-flow-dense gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                  <div>
                    events <span className="text-[var(--praxis-bone)]">{p.eventCount}</span>
                  </div>
                  <div>
                    trust <span style={{ color: "var(--praxis-argon)" }}>{p.evidenceTrust.toFixed(2)}</span>
                  </div>
                  <div>
                    sources <span className="text-[var(--praxis-bone)]">{p.sources.length}</span>
                  </div>
                  <div>
                    proof <span className="text-[var(--praxis-bone)]">{run.proofHashPreview.slice(0, 8)}&hellip;</span>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Link
                    href={`/field-workbench/${run.runId}`}
                    className="inline-flex items-center gap-2 border border-[var(--praxis-line)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bone)] transition-transform hover:scale-105"
                  >
                    Open workbench
                  </Link>
                  <Link
                    href={`/proof/${run.runId}`}
                    className="inline-flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-transform hover:scale-105"
                    style={{ background: "var(--praxis-plasma)", color: "var(--praxis-obsidian)" }}
                  >
                    View proof &rarr;
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </WorkbenchShell>
  );
}
