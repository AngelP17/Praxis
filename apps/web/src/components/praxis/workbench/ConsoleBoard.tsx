"use client";

import Link from "next/link";
import { getWorkflowRun, getWorkflowRuns } from "@/lib/praxis-workflow";
import { PipelineLive } from "@/components/praxis/PipelineLive";
import { CurlWidget } from "@/components/praxis/CurlWidget";
import { FlociHealth } from "@/components/praxis/FlociHealth";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction } from "./WorkbenchShell";

export function ConsoleBoard({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const run = getWorkflowRun(packId);
  const runs = getWorkflowRuns();

  const topbarRight = (
    <>
      <FlociHealth />
      <PrimaryAction href={`/proof/${run.runId}`}>View signed proof</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={run.runId}
      packName={run.pack.name}
      topbar={<TopbarTitle title="Operator Console" subtitle="Live pipeline · Floci health · Active runs" right={topbarRight} />}
    >
      <div className="grid grid-cols-1 grid-flow-dense gap-[18px] p-6 lg:grid-cols-12">
        <article className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-6 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              Live pipeline &middot; {run.pack.name}
            </div>
            <Pill tone="argon">streaming</Pill>
          </div>
          <PipelineLive packId={packId} />
        </article>

        <aside className="flex flex-col gap-[14px] lg:col-span-4">
          <article className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              Active solution pack
            </div>
            <h3 className="mt-3 font-display text-[22px] font-medium tracking-[-0.015em]">{run.pack.name}</h3>
            <p className="mt-2 text-[13px] leading-6 text-[var(--praxis-mute)]">{run.workflowSummary}</p>
            <div className="mt-4 space-y-2 font-mono text-[10px] uppercase text-[var(--praxis-mute)]">
              <div className="flex justify-between">
                <span>Priority</span>
                <span style={{ color: "var(--praxis-plasma)" }}>{run.pack.priorityScore.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Trust</span>
                <span style={{ color: "var(--praxis-argon)" }}>{run.pack.evidenceTrust.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Events</span>
                <span className="text-[var(--praxis-bone)]">{run.pack.eventCount}</span>
              </div>
            </div>
            <PrimaryAction href={`/proof/${run.runId}`}>Inspect proof</PrimaryAction>
          </article>

          <article className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              Verify independently
            </div>
            <p className="mt-2 text-[13px] leading-6 text-[var(--praxis-mute)]">
              Anyone can verify this proof using the open-source Praxis verifier.
            </p>
            <div className="mt-4">
              <CurlWidget proofHash={run.proofHashPreview} packId={packId} />
            </div>
          </article>
        </aside>

        <section className="py-20 lg:col-span-12">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              Floci substrate &middot; localhost services
            </div>
            <Link
              href="/fieldlab"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform hover:translate-x-1"
            >
              Open FieldLab &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 grid-flow-dense gap-3 md:grid-cols-4">
            {run.services.map((svc) => (
              <article key={svc.service} className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                  {svc.service}
                </div>
                <div className="mt-3 font-display text-[22px] tracking-[-0.015em]">{svc.resource}</div>
                <div className="mt-1 font-mono text-[10px] uppercase" style={{ color: "var(--praxis-argon)" }}>
                  {svc.status}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-20 lg:col-span-12">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              Active runs &middot; {runs.length}
            </div>
            <Link
              href="/solution-packs"
              className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform hover:translate-x-1"
            >
              All packs &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 grid-flow-dense gap-3 md:grid-cols-3">
            {runs.map((r) => (
              <Link
                key={r.pack.id}
                href={`/field-workbench/${r.runId}`}
                className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-4 transition-transform hover:-translate-y-[2px]"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                  {r.pack.id}
                </div>
                <div className="mt-2 font-display text-[16px] font-medium tracking-[-0.01em]">{r.pack.name}</div>
                <div className="mt-3 flex justify-between font-mono text-[10px] text-[var(--praxis-mute)]">
                  <span>
                    priority{" "}
                    <span style={{ color: "var(--praxis-plasma)" }}>{r.pack.priorityScore.toFixed(2)}</span>
                  </span>
                  <span>
                    trust{" "}
                    <span style={{ color: "var(--praxis-argon)" }}>{r.pack.evidenceTrust.toFixed(2)}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </WorkbenchShell>
  );
}
