"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { formatCurrency } from "@/lib/praxis-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { PipelineLive } from "@/components/praxis/PipelineLive";
import { CurlWidget } from "@/components/praxis/CurlWidget";
import { FlociHealth } from "@/components/praxis/FlociHealth";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction } from "./WorkbenchShell";
import { ProofJourneyTimeline } from "@/components/praxis/ProofJourneyTimeline";
import { ProofNarrativeStrip } from "@/components/praxis/ProofNarrativeStrip";

const FLOCI_SERVICES = [
  { service: "S3", resource: "praxis-raw-events", status: "archive" },
  { service: "SQS", resource: "praxis-incident-events", status: "queue" },
  { service: "DynamoDB", resource: "PraxisIncidentState", status: "state" },
  { service: "EventBridge", resource: "praxis-workflow-events", status: "bus" },
];

export function ConsoleBoard({ packId: propPackId }: { packId?: string }) {
  const searchParams = useSearchParams();
  const packId = propPackId ?? searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const { proof, loading, error, reload } = useProof(packId);
  const { packs } = useSolutionPacks();
  const activePack = packs.find((p) => p.id === packId);

  if (loading) return <WorkbenchShell topbar={<TopbarTitle title="Operator Console" subtitle="Loading…" />}><div className="p-8"><LoadingSkeleton /></div></WorkbenchShell>;
  if (error || !proof) return <WorkbenchShell topbar={<TopbarTitle title="Operator Console" subtitle="Error" />}><div className="p-8"><ErrorState title="Proof unavailable" message={error?.message ?? "Could not load proof"} onRetry={reload} /></div></WorkbenchShell>;

  const packName = activePack?.name ?? packId;
  const runId = proof.run_id;
  const priorityScore = proof.decision.priority_score;
  const evidenceTrust = proof.evidence.evidence_trust;
  const eventCount = proof.evidence.raw_events;

  const topbarRight = (
    <>
      <FlociHealth />
      <PrimaryAction href={`/proof/${runId}`}>View proof object</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={runId}
      packName={packName}
      topbar={<TopbarTitle title="Operator Console" subtitle="Live pipeline · Floci health · Active runs" right={topbarRight} />}
    >
      <ProofNarrativeStrip proof={proof} packName={packName} />
      <div className="grid grid-cols-1 grid-flow-dense gap-[18px] p-6 md:p-8 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <ProofJourneyTimeline proof={proof} />
        </div>
        <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Live pipeline &middot; {packName}</div>
            <Pill tone="argon">streaming</Pill>
          </div>
          <PipelineLive packId={packId} />
        </article>

        <aside className="flex flex-col gap-[14px] lg:col-span-4">
          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Active solution pack</div>
            <h3 className="mt-3 font-display text-[22px] font-medium tracking-[-0.015em]">{packName}</h3>
            <p className="mt-2 text-[13px] leading-6 text-[var(--praxis-mute)]">
              {proof.value_case.primary_value_driver}. Annual value: {formatCurrency(proof.value_case.estimated_annual_value)}.
            </p>
            <div className="mt-4 space-y-2 font-mono text-[10px] uppercase text-[var(--praxis-mute)]">
              <div className="flex justify-between">
                <span>Priority</span>
                <span style={{ color: "var(--praxis-plasma)" }}>{priorityScore.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Trust</span>
                <span style={{ color: "var(--praxis-argon)" }}>{evidenceTrust.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Events</span>
                <span className="text-[var(--praxis-bone)]">{eventCount}</span>
              </div>
            </div>
            <PrimaryAction href={`/proof/${runId}`}>Inspect proof</PrimaryAction>
          </article>

          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Verify independently</div>
            <p className="mt-2 text-[13px] leading-6 text-[var(--praxis-mute)]">
              Anyone can verify this proof using the open-source Praxis verifier.
            </p>
            <div className="mt-4">
              <CurlWidget proofHash={proof.proof_hash} packId={packId} />
            </div>
          </article>
        </aside>

        <section className="py-20 lg:col-span-12">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Floci substrate &middot; localhost services</div>
            <Link href="/fieldlab" className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform hover:translate-x-1">
              Open FieldLab &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 grid-flow-dense gap-3 md:grid-cols-4">
            {FLOCI_SERVICES.map((svc) => (
              <article key={svc.service} className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">{svc.service}</div>
                <div className="mt-3 font-display text-[22px] tracking-[-0.015em]">{svc.resource}</div>
                <div className="mt-1 font-mono text-[10px] uppercase" style={{ color: "var(--praxis-argon)" }}>{svc.status}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-20 lg:col-span-12">
          <div className="mb-3 flex items-baseline justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Active runs &middot; {packs.length}</div>
            <Link href="/solution-packs" className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform hover:translate-x-1">
              All packs &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 grid-flow-dense gap-3 md:grid-cols-3">
            {packs.map((p) => (
              <Link key={p.id} href={`/field-workbench?pack=${p.id}`} className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-4 transition-transform duration-700 ease-out hover:-translate-y-[2px] hover:scale-[1.02]">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">{p.id}</div>
                <div className="mt-2 font-display text-[16px] font-medium tracking-[-0.01em]">{p.name}</div>
                <div className="mt-3 flex justify-between font-mono text-[10px] text-[var(--praxis-mute)]">
                  <span>priority <span style={{ color: "var(--praxis-plasma)" }}>{p.priorityScore?.toFixed(2) ?? "n/a"}</span></span>
                  <span>trust <span style={{ color: "var(--praxis-argon)" }}>{p.evidenceTrust?.toFixed(2) ?? "n/a"}</span></span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </WorkbenchShell>
  );
}
