"use client";

import { PraxisShell } from "@/components/praxis/PraxisShell";
import { ProofDiff } from "@/components/praxis/ProofDiff";
import Link from "next/link";
import { ArrowsLeftRight, ArrowLeft } from "@phosphor-icons/react";

export default function ProofDiffPage() {
  return (
    <PraxisShell>
      <div className="min-h-[100dvh] bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
        <header className="border-b border-[var(--praxis-line)] bg-[var(--praxis-panel)] px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <Link href="/console" className="text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <ArrowsLeftRight className="h-6 w-6 text-[var(--praxis-violet)]" />
            <div>
              <h1 className="font-display text-xl font-medium">Proof Diff</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                Compare two proof objects side by side
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-6 py-20">
          <ProofDiff />
        </main>
      </div>
    </PraxisShell>
  );
}
