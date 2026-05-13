"use client";

import { useParams, useSearchParams } from "next/navigation";
import { PraxisShell } from "@/components/praxis/PraxisShell";
import { DecisionProofCard } from "@/components/praxis/DecisionProofCard";
import { EvidenceTrustPanel } from "@/components/praxis/EvidenceTrustPanel";
import { NextBestQuestions } from "@/components/praxis/NextBestQuestions";
import { ActionApprovalPanel } from "@/components/praxis/ActionApprovalPanel";
import { ProofObjectViewer } from "@/components/praxis/ProofObjectViewer";
import { ProofProtocolHero } from "@/components/praxis/ProofProtocolHero";
import Link from "next/link";
import { ArrowLeft, BracketsCurly } from "@phosphor-icons/react";

function resolvePackId(proofId: string): string {
  if (proofId.includes("erp")) return "erp-access-disruption";
  if (proofId.includes("k8s") || proofId.includes("ingress")) return "k8s-ingress-degradation";
  return "manufacturing-printer-gpo";
}

export default function ProofDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const proofId = (params.proofId as string) ?? "unknown";
  const packId = resolvePackId(proofId);
  const preferOfflineProof = searchParams.get("proofSource") === "offline";

  return (
    <PraxisShell>
      <div className="min-h-[100dvh] bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
        <ProofProtocolHero packId={packId} />
        <header className="border-b border-[var(--praxis-line)] bg-[var(--praxis-panel)] px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <Link href="/field-workbench" className="text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <BracketsCurly className="h-6 w-6 text-[var(--praxis-violet)]" />
            <div>
              <h1 className="font-display text-xl font-medium">Proof Detail</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                {proofId} · {packId}
              </p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-10 p-6">
          <section id="live-proof" className="scroll-mt-16 py-20">
            <h2 className="mb-4 font-display text-2xl font-medium">Decision Proof</h2>
            <DecisionProofCard packId={packId} />
          </section>
          <section className="grid grid-flow-dense grid-cols-1 gap-6 py-20 lg:grid-cols-2">
            <EvidenceTrustPanel packId={packId} />
            <NextBestQuestions packId={packId} />
          </section>
          <section className="grid grid-flow-dense grid-cols-1 gap-6 py-20 lg:grid-cols-2">
            <ActionApprovalPanel packId={packId} />
            <ProofObjectViewer packId={packId} preferOffline={preferOfflineProof} />
          </section>
        </main>
      </div>
    </PraxisShell>
  );
}
