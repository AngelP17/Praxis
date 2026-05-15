import { PraxisShell } from "@/components/praxis/PraxisShell";
import { ValueCasePanel } from "@/components/praxis/ValueCasePanel";

export default function ValueCasePage() {
  return (
    <PraxisShell>
      <main className="min-h-[100dvh] bg-[var(--praxis-bg)] px-6 py-24 text-[var(--praxis-bone)]">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-medium">Value Case</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--praxis-muted)]">
            Estimated annual value, confidence, and evidence assumptions derived from the current proof path.
          </p>
          <div className="mt-8">
            <ValueCasePanel />
          </div>
        </div>
      </main>
    </PraxisShell>
  );
}
