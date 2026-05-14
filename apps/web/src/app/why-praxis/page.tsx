import { MoatStack } from "@/components/praxis/MoatStack";
import { ProofArtifactChain } from "@/components/praxis/ProofArtifactChain";
import { RoleProofMatrix } from "@/components/praxis/RoleProofMatrix";

export default function WhyPraxisPage() {
  return (
    <main className="min-h-[100dvh] bg-[var(--praxis-bg)] px-6 py-24 text-[var(--praxis-bone)]">
      <section className="mx-auto grid grid-flow-dense w-[min(1180px,100%)] gap-8 py-20">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--praxis-violet)]">
          Why Praxis
        </div>
        <h1 className="max-w-5xl font-display text-6xl font-medium leading-none md:text-7xl">
          Not a dashboard. Not a chatbot. A field proof system.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-[var(--praxis-muted)]">
          The moat is the connected loop: solution pack, local runtime, algorithmic
          decision, human action, verified proof, and executive value.
        </p>
      </section>
      <section className="mx-auto w-[min(1180px,100%)] py-20">
        <MoatStack />
      </section>
      <section className="mx-auto w-[min(1180px,100%)] py-20">
        <RoleProofMatrix />
      </section>
      <section className="mx-auto w-[min(1180px,100%)] py-20">
        <ProofArtifactChain />
      </section>
    </main>
  );
}
