"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { formatCurrency } from "@/lib/praxis-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { WorkbenchShell, TopbarTitle, GhostAction, PrimaryAction } from "./WorkbenchShell";
import { ProofNarrativeStrip } from "@/components/praxis/ProofNarrativeStrip";
import { ProofJourneyTimeline } from "@/components/praxis/ProofJourneyTimeline";

function Spark({ data, color, w = 310, h = 70 }: { data: number[]; color: string; w?: number; h?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const dx = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * dx},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="block">
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.14" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function ReadoutBoard({ packId: propPackId, runId }: { packId?: string; runId?: string }) {
  const searchParams = useSearchParams();
  const packId = propPackId ?? searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const { proof, loading, error, reload } = useProof(packId);
  const { packs } = useSolutionPacks();
  const activePack = packs.find((p) => p.id === packId);

  if (loading) return <WorkbenchShell topbar={<TopbarTitle title="Executive Readout" subtitle="Loading…" />}><div className="p-8"><LoadingSkeleton /></div></WorkbenchShell>;
  if (error || !proof) return <WorkbenchShell topbar={<TopbarTitle title="Executive Readout" subtitle="Error" />}><div className="p-8"><ErrorState title="Proof unavailable" message={error?.message ?? "Could not load proof"} onRetry={reload} /></div></WorkbenchShell>;

  const runId_ = runId ?? proof.run_id;
  const proofDate = proof.generated_at ? new Date(proof.generated_at) : new Date();
  const quarter = `Q${Math.ceil((proofDate.getMonth() + 1) / 3)}`;
  const annualValue = proof.value_case.estimated_annual_value;
  const annualLabel = `${formatCurrency(annualValue)}/yr`;
  const trust = proof.evidence.evidence_trust;
  const packName = activePack?.name ?? packId;
  const buyer = activePack?.buyer_persona ?? proof.action.actor;
  const rootCause = proof.decision.root_cause_hypothesis.replace(/_/g, " ");
  const proofShort = proof.proof_hash.slice(7, 15);

  const timelineSteps = [
    { label: "Events ingested", detail: `${proof.evidence.raw_events} raw field events` },
    { label: "Ontology compiled", detail: `${proof.ontology.objects_created} objects, ${proof.ontology.links_created} links` },
    { label: "Decision generated", detail: `priority ${proof.decision.priority_score.toFixed(2)}` },
  ];

  const expansion = (proof.expansion ?? []).slice(0, 3);

  const topbarRight = (
    <>
      <GhostAction href={`/readout/${runId_}/print`}>PDF</GhostAction>
      <GhostAction href={`/readout/${runId_}/print?format=deck`}>Deck</GhostAction>
      <PrimaryAction href={`/proof/${runId_}`}>Send to CFO</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={runId_}
      packName={packName}
      topbar={<TopbarTitle title={`Executive Readout · ${quarter}`} subtitle={packName} right={topbarRight} />}
    >
      <ProofNarrativeStrip proof={proof} packName={packName} />
      <div className="px-8 pt-6 pb-2">
        <ProofJourneyTimeline proof={proof} />
      </div>
      <div
        className="flex h-full justify-center overflow-hidden p-[30px]"
        style={{ background: "radial-gradient(ellipse at 50% 0%, var(--praxis-surface-2) 0%, var(--praxis-obsidian) 60%)" }}
      >
        <article className="relative w-full max-w-[780px] overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.98),rgba(10,10,20,0.96))] p-11" style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">
            Executive readout &middot; {runId_.toUpperCase()} &middot; FieldLab
          </div>
          <h1 className="mt-[14px] max-w-[640px] font-display text-[42px] font-medium leading-[1.08] tracking-[-0.025em]" style={{ textWrap: "balance" }}>
            {rootCause}{" "}
            <span style={{ background: "linear-gradient(110deg, var(--praxis-plasma) 30%, var(--praxis-argon) 95%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {annualLabel}
            </span>{" "}
            in {buyer.toLowerCase()} cost at FieldLab.
          </h1>

          <div className="mt-9 grid grid-cols-2 grid-flow-dense gap-5 md:grid-cols-4">
            {[
              ["Primary impact", proof.value_case.primary_value_driver],
              ["Root cause", rootCause],
              ["Evidence trust", trust.toFixed(2), "var(--praxis-argon)"],
              ["Annual value", annualLabel, "var(--praxis-plasma)"],
            ].map(([k, v, c]) => (
              <div key={k}>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">{k}</div>
                <div className="mt-[6px] font-display text-[26px] font-medium tracking-[-0.015em]" style={{ color: (c as string) ?? "var(--praxis-bone)" }}>{v}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 grid-flow-dense gap-7 border-t border-[var(--praxis-line)] pt-6 md:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="mb-[10px] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Recommended action &middot; human approval</div>
              <p className="text-[14.5px] leading-[1.6] text-[var(--praxis-bone)]">
                {proof.action.recommended_action.replace(/_/g, " ")}. No production mutation, communication-only path through{" "}
                <span className="font-mono" style={{ color: "var(--praxis-plasma)" }}>{buyer}</span> ticketing.
              </p>
              <div className="mb-[10px] mt-[22px] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Next 30 days</div>
              <ol className="m-0 list-decimal pl-[18px] text-[13.5px] leading-[1.75] text-[var(--praxis-bone)]">
                {timelineSteps.map((s) => (
                  <li key={s.label}>{s.label} &middot; <span className="text-[var(--praxis-mute)]">{s.detail}</span></li>
                ))}
              </ol>
            </div>

            <div className="border border-[var(--praxis-line)] bg-[var(--praxis-surface-2)] p-[18px]">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Trend &middot; incidents / week</div>
              <Spark data={[8, 9, 11, 12, 10, 9, 7, 6, 5, 4]} color="var(--praxis-plasma)" />
              <div className="mt-[14px] flex justify-between font-mono text-[10px] text-[var(--praxis-mute)]">
                <span>Last 10 weeks</span>
                <span style={{ color: "var(--praxis-argon)" }}>&minus;50%</span>
              </div>
              {expansion.length > 0 && (
                <div className="mt-[22px]">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Expansion path</div>
                  <div className="mt-2 flex flex-col gap-[6px]">
                    {expansion.map((e) => (
                      <Link key={e.name} href={`/expansion-map?focus=${encodeURIComponent(e.name)}`} className="flex justify-between font-mono text-[11px] transition-transform hover:translate-x-1">
                        <span className="text-[var(--praxis-bone)]">{e.name}</span>
                        <span style={{ color: "var(--praxis-plasma)" }}>{e.expansion_score.toFixed(2)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-9 flex justify-between border-t border-[var(--praxis-line)] pt-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
            <span>Praxis &middot; run {runId_}</span>
            <span>v1.0 &middot; auto-generated &middot; audit {proofShort}&hellip;</span>
          </div>
        </article>
      </div>
    </WorkbenchShell>
  );
}
