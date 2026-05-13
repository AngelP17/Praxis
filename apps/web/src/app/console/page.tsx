"use client";

import { PraxisShell } from "@/components/praxis/PraxisShell";
import { PipelineLive } from "@/components/praxis/PipelineLive";
import { FlociHealth } from "@/components/praxis/FlociHealth";
import { CurlWidget } from "@/components/praxis/CurlWidget";
import Link from "next/link";
import { Circuitry, BracketsCurly, ShieldCheck, ArrowRight } from "@phosphor-icons/react";
import { getWorkflowRun, getFullProofHash } from "@/lib/praxis-workflow";

export default function ConsolePage() {
  const run = getWorkflowRun("manufacturing-printer-gpo");
  const proofHash = getFullProofHash("manufacturing-printer-gpo");

  return (
    <PraxisShell>
      <div className="min-h-[100dvh] bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
        <header className="border-b border-[var(--praxis-line)] bg-[var(--praxis-panel)] px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <Circuitry className="h-6 w-6 text-[var(--praxis-violet)]" />
              <div>
                <h1 className="font-display text-xl font-medium">Operator Console</h1>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                  Live pipeline · Floci health · Active runs
                </p>
              </div>
            </div>
            <FlociHealth />
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 p-6">
          <section className="grid grid-flow-dense gap-4 py-20 lg:grid-cols-12">
            <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
              <PipelineLive packId="manufacturing-printer-gpo" />
            </article>

            <aside className="lg:col-span-4 space-y-4">
              <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                  Active Solution Pack
                </div>
                <h3 className="mt-4 font-display text-2xl font-medium">{run.pack.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--praxis-muted)]">{run.workflowSummary}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                    <span>Priority</span>
                    <span className="text-[var(--praxis-violet)]">{run.pack.priorityScore.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                    <span>Trust</span>
                    <span className="text-[var(--praxis-mint)]">{run.pack.evidenceTrust.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                    <span>Events</span>
                    <span>{run.pack.eventCount}</span>
                  </div>
                </div>
                <Link
                  href={`/proof/${run.runId}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 bg-[var(--praxis-bone)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bg)] transition-transform duration-700 hover:scale-105"
                >
                  View Proof <ArrowRight className="h-3 w-3" />
                </Link>
              </article>

              <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
                <ShieldCheck className="h-8 w-8 text-[var(--praxis-violet)]" />
                <h3 className="mt-4 font-display text-xl font-medium">Verify This Proof</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--praxis-muted)]">
                  Anyone can verify this proof independently using the open-source Praxis verifier.
                </p>
                <div className="mt-4">
                  <CurlWidget proofHash={proofHash} packId="manufacturing-printer-gpo" />
                </div>
              </article>
            </aside>
          </section>

          <section className="grid grid-flow-dense gap-4 py-20 md:grid-cols-4">
            {run.services.map((svc) => (
              <article key={svc.service} className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">
                  {svc.service}
                </div>
                <div className="mt-3 font-display text-2xl">{svc.resource}</div>
                <div className="mt-1 font-mono text-[10px] uppercase text-[var(--praxis-mint)]">{svc.status}</div>
              </article>
            ))}
          </section>
        </main>
      </div>
    </PraxisShell>
  );
}
