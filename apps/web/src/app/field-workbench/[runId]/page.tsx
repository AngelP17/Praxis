"use client";

import { useParams } from "next/navigation";
import { PraxisShell } from "@/components/praxis/PraxisShell";
import { FieldLabTimeline } from "@/components/praxis/FieldLabTimeline";
import { OntologyMap } from "@/components/praxis/OntologyMap";
import { EvidenceTrustPanel } from "@/components/praxis/EvidenceTrustPanel";
import { NextBestQuestions } from "@/components/praxis/NextBestQuestions";
import { SolutionPackRail } from "@/components/praxis/SolutionPackRail";
import Link from "next/link";
import { ArrowLeft, Circuitry } from "@phosphor-icons/react";

function resolvePackId(runId: string): string {
  if (runId.includes("erp")) return "erp-access-disruption";
  if (runId.includes("k8s") || runId.includes("ingress")) return "k8s-ingress-degradation";
  return "manufacturing-printer-gpo";
}

export default function FieldWorkbenchRunPage() {
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
            <Circuitry className="h-6 w-6 text-[var(--praxis-violet)]" />
            <div>
              <h1 className="font-display text-xl font-medium">FieldLab Run</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                {runId} · {packId}
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 p-6">
          <section>
            <h2 className="mb-4 font-display text-2xl font-medium">Workflow Timeline</h2>
            <FieldLabTimeline />
          </section>
          <section>
            <h2 className="mb-4 font-display text-2xl font-medium">Operational Ontology</h2>
            <OntologyMap />
          </section>
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EvidenceTrustPanel packId={packId} />
            <NextBestQuestions packId={packId} />
          </section>
          <section>
            <h2 className="mb-4 font-display text-2xl font-medium">Solution Packs</h2>
            <SolutionPackRail />
          </section>
        </main>
      </div>
    </PraxisShell>
  );
}
