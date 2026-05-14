"use client";

import Link from "next/link";
import { ArrowSquareOut, BracketsCurly } from "@phosphor-icons/react";
import { CurlWidget } from "@/components/praxis/CurlWidget";
import { PackSwitcher } from "@/components/praxis/PackSwitcher";
import { ProofDiff } from "@/components/praxis/ProofDiff";
import { ProofProtocolHero } from "@/components/praxis/ProofProtocolHero";
import { useProof } from "@/lib/hooks/useProof";
import { useSearchParams } from "next/navigation";

export default function ProofDetailPage() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const { proof } = useProof(packId);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
      <ProofProtocolHero packId={packId} />

      <section className="border-y border-[var(--praxis-line)] py-20 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-flow-dense gap-6 px-5 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6 transition-transform duration-700 ease-out hover:scale-[1.01]">
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
              <BracketsCurly className="h-4 w-4 text-[var(--praxis-violet)]" />
              Active proof controls
            </div>
            <div className="mt-6">
              <PackSwitcher activePackId={packId} />
            </div>
            <div className="mt-6">
              <CurlWidget proofHash={proof?.proof_hash} packId={packId} />
            </div>
            <Link
              href="/proof/diff"
              className="mt-6 inline-flex items-center gap-2 border border-[var(--praxis-line)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]"
            >
              Open dedicated diff page
              <ArrowSquareOut className="h-4 w-4" />
            </Link>
          </article>

          <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.84)] p-4 transition-transform duration-700 ease-out hover:scale-[1.01] md:p-6">
            <ProofDiff />
          </div>
        </div>
      </section>
    </main>
  );
}
