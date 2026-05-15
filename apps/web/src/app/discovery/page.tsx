import { DiscoveryPanel } from "@/components/praxis/DiscoveryPanel";
import { PraxisShell } from "@/components/praxis/PraxisShell";

export default function DiscoveryPage() {
  return (
    <PraxisShell>
      <main className="min-h-[100dvh] bg-[var(--praxis-bg)] px-6 py-24 text-[var(--praxis-bone)]">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-medium">Discovery</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--praxis-muted)]">
            Candidate objects, inferred links, and next questions from the discovery graph rather than a static proof snapshot.
          </p>
          <div className="mt-8">
            <DiscoveryPanel />
          </div>
        </div>
      </main>
    </PraxisShell>
  );
}
