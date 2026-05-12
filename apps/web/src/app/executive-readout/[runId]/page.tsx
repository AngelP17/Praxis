"use client";

import { useParams } from "next/navigation";
import { PraxisShell } from "@/components/praxis/PraxisShell";
import { ExecutiveReadout } from "@/components/praxis/ExecutiveReadout";
import { ValueCasePanel } from "@/components/praxis/ValueCasePanel";
import { ExpansionMap } from "@/components/praxis/ExpansionMap";
import Link from "next/link";
import { ArrowLeft, FileText } from "@phosphor-icons/react";

function resolvePackId(runId: string): string {
  if (runId.includes("erp")) return "erp-access-disruption";
  if (runId.includes("k8s") || runId.includes("ingress")) return "k8s-ingress-degradation";
  return "manufacturing-printer-gpo";
}

export default function ExecutiveReadoutRunPage() {
  const params = useParams();
  const runId = (params.runId as string) ?? "unknown";
  const packId = resolvePackId(runId);

  return (
    <PraxisShell>
      <div className="min-h-[100dvh] bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
        <header className="border-b border-[var(--praxis-line)] bg-[var(--praxis-panel)] px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <Link href="/field-workbench" className="text-[var(--praxis-muted)] transition-colors hover:text-[var(--praxis-bone)]">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <FileText className="h-6 w-6 text-[var(--praxis-mint)]" />
            <div>
              <h1 className="font-display text-xl font-medium">Executive Readout</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                {runId} · {packId}
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 p-6">
          <section>
            <ExecutiveReadout packId={packId} />
          </section>
          <section>
            <h2 className="mb-4 font-display text-2xl font-medium">Value Case</h2>
            <ValueCasePanel packId={packId} />
          </section>
          <section>
            <h2 className="mb-4 font-display text-2xl font-medium">Expansion Opportunities</h2>
            <ExpansionMap packId={packId} />
          </section>
        </main>
      </div>
    </PraxisShell>
  );
}
