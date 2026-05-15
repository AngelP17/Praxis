import { ExpansionMap } from "@/components/praxis/ExpansionMap";
import { PraxisShell } from "@/components/praxis/PraxisShell";

export default function ExpansionMapPage() {
  return (
    <PraxisShell>
      <main className="min-h-[100dvh] bg-[var(--praxis-bg)] px-6 py-24 text-[var(--praxis-bone)]">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-medium">Expansion Map</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--praxis-muted)]">
            Adjacent use cases and expansion potential derived from the current proof and value case.
          </p>
          <div className="mt-8">
            <ExpansionMap />
          </div>
        </div>
      </main>
    </PraxisShell>
  );
}
