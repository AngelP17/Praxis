"use client";

import Link from "next/link";
import { ArrowSquareOut, BracketsCurly } from "@phosphor-icons/react";
import { CurlWidget } from "@/components/praxis/CurlWidget";
import { PackSwitcher } from "@/components/praxis/PackSwitcher";
import { ProofDiff } from "@/components/praxis/ProofDiff";
import { ProofJourneyTimeline } from "@/components/praxis/ProofJourneyTimeline";
import { ProofNarrativeStrip } from "@/components/praxis/ProofNarrativeStrip";
import { TopbarTitle, WorkbenchShell, GhostAction, PrimaryAction } from "@/components/praxis/workbench/WorkbenchShell";
import { useProof } from "@/lib/hooks/useProof";
import { formatCurrency, formatPercent } from "@/lib/praxis-client";
import { useParams, useSearchParams } from "next/navigation";

function resolvePackId(runId: string, queryPack: string | null): string {
  if (queryPack) return queryPack;
  if (runId.includes("erp") || runId.includes("onboarding") || runId.includes("identity")) return "identity-onboarding-drift";
  if (runId.includes("k8s") || runId.includes("ingress") || runId.includes("db") || runId.includes("database") || runId.includes("failover")) return "database-failover-lag";
  if (runId.includes("wan") || runId.includes("network") || runId.includes("isp") || runId.includes("starlink")) return "network-edge-failover";
  return "manufacturing-printer-gpo";
}

export default function ProofDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const proofId = (params.proofId as string) ?? "";
  const packId = resolvePackId(proofId, searchParams.get("pack"));
  const { proof } = useProof(packId);
  const runId = proof?.run_id ?? proofId;

  return (
    <WorkbenchShell
      runId={runId}
      packName={packId}
      topbar={
        <TopbarTitle
          title="Proof Control"
          subtitle={`${packId} / ${runId}`}
          right={
            <>
              <GhostAction href="/console">Console</GhostAction>
              <GhostAction href="/dashboard">Dashboard</GhostAction>
              <PrimaryAction href={`/executive-readout/${runId}`}>Export readout</PrimaryAction>
            </>
          }
        />
      }
    >
      <div className="grid grid-cols-1 grid-flow-dense gap-[14px] p-[26px] lg:grid-cols-[0.82fr_1.18fr]">
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
          <div className="mt-6 grid grid-flow-dense gap-3 sm:grid-cols-2">
            <Link
              href="/proof/diff"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--praxis-line)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)] transition-transform duration-300 hover:scale-[1.02] hover:text-[var(--praxis-bone)] active:scale-[0.98]"
            >
              Diff page
              <ArrowSquareOut className="h-4 w-4" />
            </Link>
            <Link
              href={`/api/proofs/${packId}`}
              className="inline-flex items-center justify-center rounded-full border border-[var(--praxis-line)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)] transition-transform duration-300 hover:scale-[1.02] hover:text-[var(--praxis-bone)] active:scale-[0.98]"
            >
              JSON export
            </Link>
          </div>
        </article>

        <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.84)] p-4 transition-transform duration-700 ease-out hover:scale-[1.01] md:p-6">
          <ProofDiff />
        </div>

        {proof && (
          <>
            <div className="lg:col-span-2">
              <ProofNarrativeStrip proof={proof} packName={packId} />
            </div>
            <div className="grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] sm:grid-cols-4 lg:col-span-2">
              {[
                ["Evidence trust", formatPercent(proof.evidence.evidence_trust)],
                ["Priority", formatPercent(proof.decision.priority_score)],
                ["Annual value", formatCurrency(proof.value_case.estimated_annual_value)],
                ["Conformance", "L0 verified"],
              ].map(([label, value]) => (
                <div key={label} className="bg-[var(--praxis-panel)] p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
                  <div className="mt-3 font-display text-3xl font-semibold tracking-[-0.02em] text-[var(--praxis-bone)]">{value}</div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              <ProofJourneyTimeline proof={proof} />
            </div>
          </>
        )}
      </div>
    </WorkbenchShell>
  );
}
