import { OntologyMap } from "@/components/praxis/OntologyMap";
import { PraxisShell } from "@/components/praxis/PraxisShell";

export default function OntologyPage() {
  return (
    <PraxisShell>
      <main className="min-h-[100dvh] bg-[var(--praxis-bg)] px-6 py-24 text-[var(--praxis-bone)]">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-medium">Ontology</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--praxis-muted)]">
            Operational objects, inferred links, and available actions compiled from customer signals.
          </p>
          <div className="mt-8">
            <OntologyMap />
          </div>
        </div>
      </main>
    </PraxisShell>
  );
}
