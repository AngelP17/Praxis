"use client";

import { useSearchParams } from "next/navigation";
import { ArrowRight, BracketsCurly } from "@phosphor-icons/react";
import { CurlWidget } from "@/components/praxis/CurlWidget";
import { PipelineLive } from "@/components/praxis/PipelineLive";
import { ProofProtocolHero } from "@/components/praxis/ProofProtocolHero";
import { PraxisExperience } from "@/components/praxis/praxis-experience";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";

export function PraxisLanding() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const { proof, verification } = useProof(packId);
  const { packs } = useSolutionPacks();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
      <ProofProtocolHero packId={packId} proof={proof} />

      <section
        id="live-proof"
        className="relative isolate border-y border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.96))] py-32 md:py-48"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(139,92,255,0.16),transparent_26%),radial-gradient(circle_at_80%_70%,rgba(62,255,168,0.12),transparent_24%)]" />
        <div className="mx-auto grid max-w-7xl grid-flow-dense gap-8 px-5 lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="flex flex-col justify-between gap-6 overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.88)] p-6 transition-transform duration-700 ease-out hover:scale-[1.01] md:p-8">
            <div>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
                <BracketsCurly className="h-4 w-4 text-[var(--praxis-violet)]" />
                Live proof handshake
              </div>
              <h2 className="mt-8 max-w-3xl font-display text-[clamp(2.3rem,4.4vw,4.6rem)] font-medium leading-[0.96] tracking-normal">
                Trigger the proof path, watch the stages lock in, then verify the artifact independently.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--praxis-muted)] md:text-lg">
                The landing now scrolls from protocol claim to visible runtime behavior. This section is the bridge: live stage motion on the right, independent verifier path below, and the working dashboard after that.
              </p>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
              <CurlWidget proofHash={proof?.proof_hash} packId={packId} />
              <div className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
                <ArrowRight className="h-3.5 w-3.5 text-[var(--praxis-mint)]" />
                Proof hash becomes the visible product surface
              </div>
            </div>
          </aside>

          <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.84)] p-4 transition-transform duration-700 ease-out hover:scale-[1.01] md:p-6">
            <PipelineLive packId={packId} />
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--praxis-line)] py-20">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-5">
          <div className="h-px flex-1 bg-[var(--praxis-line)]" />
          <span className="px-5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-muted)]">
            From cinematic claim to operating proof
          </span>
          <div className="h-px flex-1 bg-[var(--praxis-line)]" />
        </div>
      </section>

      <PraxisExperience initialScreen="overview" embedded externalProof={proof} externalVerification={verification} externalPacks={packs} />
    </main>
  );
}
