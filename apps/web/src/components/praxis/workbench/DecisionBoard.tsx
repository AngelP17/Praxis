"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction, GhostAction } from "./WorkbenchShell";
import { ProofNarrativeStrip } from "@/components/praxis/ProofNarrativeStrip";
import { getActiveCase, hrefWithActiveCase } from "@/lib/active-case";

export function DecisionBoard({ packId: propPackId, runId }: { packId?: string; runId?: string }) {
  const searchParams = useSearchParams();
  const packId = propPackId ?? searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const activeCase = getActiveCase(packId, searchParams.get("scenario"), searchParams.get("ticket"));
  const { proof, loading, error, reload } = useProof(packId);
  const { packs } = useSolutionPacks();
  const activePack = packs.find((p) => p.id === packId);

  if (loading) return <WorkbenchShell topbar={<TopbarTitle title="Decision Engine" subtitle="Loading…" />}><div className="p-8"><LoadingSkeleton /></div></WorkbenchShell>;
  if (error || !proof) return <WorkbenchShell topbar={<TopbarTitle title="Decision Engine" subtitle="Error" />}><div className="p-8"><ErrorState title="Proof unavailable" message={error?.message ?? "Could not load proof"} onRetry={reload} /></div></WorkbenchShell>;

  const priority = proof.decision.priority_score;
  const trust = proof.evidence.evidence_trust;
  const confidence = proof.decision.confidence;
  const mappingConf = proof.ontology.mapping_confidence;
  const uncertainty = Math.max(0, 1 - priority - 0.16);
  const buyer = activePack?.buyer_persona ?? "operator";
  const runId_ = runId ?? proof.run_id;
  const proofShort = proof.proof_hash.slice(7, 17);

  const decisionWeights = [
    { label: "Severity score", value: Math.min(priority + 0.06, 1), weight: 0.20 },
    { label: "Business impact", value: confidence, weight: 0.20 },
    { label: "Evidence trust", value: trust, weight: 0.15 },
    { label: "Actionability", value: Math.min(priority + 0.11, 1), weight: 0.15 },
    { label: "Ontology mapping", value: mappingConf, weight: 0.10 },
    { label: "SLA exposure", value: Math.min(priority + 0.02, 1), weight: 0.10 },
    { label: "Recurrence risk", value: Math.max(priority - 0.05, 0.1), weight: 0.10 },
  ];

  const evidenceItems = proof.evidence.sources.map((source, i) => ({
    source,
    summary: `Signal from ${source.replace(/_/g, " ")}`,
    type: i % 2 === 0 ? "telemetry" : "log",
    severity: i === 0 ? "high" : i < 3 ? "medium" : "low",
  }));

  const topbarRight = (
    <>
      <Pill>{proof.decision.requires_human_review ? "Review required" : "Auto-approved"}</Pill>
      <GhostAction href={`/replay/${runId_}`}>Replay</GhostAction>
      <GhostAction href={hrefWithActiveCase("/decision-center", activeCase)}>Review approval</GhostAction>
      <PrimaryAction href={hrefWithActiveCase(`/executive-readout/${runId_}`, activeCase)}>Open readout</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={runId_}
      packName={activePack?.name ?? packId}
      topbar={<TopbarTitle title={`Decision · ${runId_.toUpperCase()}`} subtitle="review required" right={topbarRight} />}
    >
      <ProofNarrativeStrip proof={proof} packName={activePack?.name ?? packId} />
      <div className="grid grid-cols-1 grid-flow-dense gap-[18px] overflow-hidden p-6 lg:grid-cols-[1.25fr_1fr]">
        <article className="flex flex-col gap-[18px] overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Praxis priority</div>
              <div
                className="mt-[6px] font-display text-[84px] font-medium leading-none tracking-[-0.04em]"
                style={{ background: "linear-gradient(135deg, var(--praxis-bone) 0%, var(--praxis-plasma) 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
              >
                {priority.toFixed(2)}
              </div>
              <div className="mt-[6px] font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                bucket &middot; {priority >= 0.8 ? "pilot now" : priority >= 0.65 ? "demo and scope" : "discovery required"} &middot; routed to {buyer.toLowerCase()}
              </div>
            </div>
            <div className="flex gap-[22px]">
              {[
                ["Evidence trust", trust.toFixed(2), "var(--praxis-argon)"],
                ["Uncertainty", `−${uncertainty.toFixed(2)}`, "var(--praxis-crit)"],
                ["Confidence", confidence.toFixed(2), "var(--praxis-argon)"],
              ].map(([k, v, c]) => (
                <div key={k}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">{k}</div>
                  <div className="mt-1 font-display text-[30px] font-medium" style={{ color: c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
            Weighted components &middot; praxis_priority = &Sigma; w&sub;i&middot;x&sub;i &minus; uncertainty
          </div>

          <div className="flex flex-col gap-[7px]">
            {decisionWeights.map((d) => (
              <div key={d.label} className="grid items-center gap-3 font-mono text-[11px]" style={{ gridTemplateColumns: "180px 1fr 56px 40px" }}>
                <span className="truncate text-[var(--praxis-bone)]">{d.label}</span>
                <div className="h-[6px] bg-[var(--praxis-line)]">
                  <div
                    className="h-full"
                    style={{
                      width: `${d.value * 100}%`,
                      background: d.value >= 0.7 ? "var(--praxis-plasma)" : "var(--praxis-argon)",
                      boxShadow: d.value >= 0.7 ? "0 0 12px color-mix(in srgb, var(--praxis-plasma) 40%, transparent)" : "0 0 12px color-mix(in srgb, var(--praxis-argon) 40%, transparent)",
                    }}
                  />
                </div>
                <span className="text-right" style={{ color: d.value >= 0.7 ? "var(--praxis-plasma)" : "var(--praxis-argon)" }}>{d.value.toFixed(2)}</span>
                <span className="text-right text-[var(--praxis-mute)]">&times;{d.weight.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </article>

        <div className="flex min-h-0 flex-col gap-[14px] overflow-hidden">
          <article className="relative overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-[22px]">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-[180px] w-[180px]"
              style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--praxis-plasma) 35%, transparent), transparent)", filter: "blur(20px)" }}
            />
            <div className="relative">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-plasma)" }}>Recommended action</div>
              <div className="mt-3 font-display text-[24px] font-medium leading-[1.25] tracking-[-0.015em]" style={{ textWrap: "balance" }}>
                {proof.action.recommended_action.replace(/_/g, " ")}
              </div>
              <div className="mt-4 flex gap-[18px] font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                <span>mode &middot; {proof.action.mode}</span>
                <span>target &middot; {buyer}</span>
                <span style={{ color: "var(--praxis-argon)" }}>risk &middot; low</span>
              </div>
            </div>
          </article>

          <article className="flex-1 overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              Evidence trail &middot; {evidenceItems.length} sources &middot; trust {trust.toFixed(2)}
            </div>
            <div className="mt-[14px] flex flex-col gap-3">
              {evidenceItems.slice(0, 4).map((e, i) => {
                const color = e.severity === "high" ? "var(--praxis-plasma)" : e.severity === "medium" ? "var(--praxis-plasma)" : "var(--praxis-argon)";
                const score = (trust - 0.05 + (i % 3) * 0.04).toFixed(2);
                return (
                  <Link key={i} href={`/proof/${runId_}#live-proof`} className="grid items-start gap-3 transition-transform hover:translate-x-1" style={{ gridTemplateColumns: "14px 1fr 38px" }}>
                    <span className="mt-[7px] block h-[7px] w-[7px] rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                    <div>
                      <div className="text-[13px] font-medium">{e.summary}</div>
                      <div className="mt-[2px] font-mono text-[10.5px] text-[var(--praxis-mute)]">{e.source} &middot; {e.type} &middot; sev {e.severity}</div>
                    </div>
                    <span className="text-right font-mono text-[11px]" style={{ color }}>{score}</span>
                  </Link>
                );
              })}
            </div>
          </article>

          <article className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Proof object &middot; L0</div>
            <div className="mt-3 grid grid-flow-dense grid-cols-2 gap-2 font-mono text-[10px] text-[var(--praxis-mute)]">
              <div>proof_hash <span className="text-[var(--praxis-bone)]">{proofShort}&hellip;</span></div>
              <div>replay <span style={{ color: "var(--praxis-argon)" }}>{proof.replay.deterministic ? "deterministic" : "verified"}</span></div>
              <div>schema <span style={{ color: "var(--praxis-argon)" }}>valid</span></div>
              <div>sources <span className="text-[var(--praxis-bone)]">{proof.evidence.sources.length}</span></div>
            </div>
            <Link href={`/proof/${runId_}#live-proof`} className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--praxis-bone)] transition-transform hover:translate-x-1">
              Inspect proof object &rarr;
            </Link>
          </article>
        </div>
      </div>
    </WorkbenchShell>
  );
}
