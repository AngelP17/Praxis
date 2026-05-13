"use client";

import Link from "next/link";
import { getWorkflowRun } from "@/lib/praxis-workflow";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction, GhostAction } from "./WorkbenchShell";

export function DecisionBoard({ packId, runId }: { packId: string; runId?: string }) {
  const run = getWorkflowRun(packId);
  const priority = run.pack.priorityScore;
  const trust = run.pack.evidenceTrust;
  const uncertainty = Math.max(0, 1 - priority - 0.16);

  const topbarRight = (
    <>
      <GhostAction href={`/replay/${run.runId}`}>Replay</GhostAction>
      <GhostAction href={`/proof/${run.runId}?source=approve`}>Approve</GhostAction>
      <PrimaryAction href={`/executive-readout/${run.runId}`}>Route action</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={runId ?? run.runId}
      packName={run.pack.name}
      topbar={
        <TopbarTitle
          title={`Decision · ${run.runId.toUpperCase()}`}
          subtitle="review required"
          right={topbarRight}
        />
      }
    >
      <div className="grid grid-cols-1 grid-flow-dense gap-[18px] overflow-hidden p-6 lg:grid-cols-[1.25fr_1fr]">
        {/* score panel */}
        <article className="flex flex-col gap-[18px] border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
                Praxis priority
              </div>
              <div
                className="mt-[6px] font-display text-[84px] font-medium leading-none tracking-[-0.04em]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--praxis-bone) 0%, var(--praxis-plasma) 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {priority.toFixed(2)}
              </div>
              <div className="mt-[6px] font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                bucket &middot; demo and scope &middot; routed to {run.pack.buyer.toLowerCase()}
              </div>
            </div>
            <div className="flex gap-[22px]">
              {[
                ["Evidence trust", trust.toFixed(2), "var(--praxis-argon)"],
                ["Uncertainty", `−${uncertainty.toFixed(2)}`, "var(--praxis-crit)"],
                ["Confidence", (priority + 0.1).toFixed(2), "var(--praxis-argon)"],
              ].map(([k, v, c]) => (
                <div key={k}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                    {k}
                  </div>
                  <div className="mt-1 font-display text-[30px] font-medium" style={{ color: c }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
            Weighted components &middot; praxis_priority = &Sigma; w&sub;i&middot;x&sub;i &minus; uncertainty
          </div>

          <div className="flex flex-col gap-[7px]">
            {run.decisionWeights.map((d) => (
              <div
                key={d.label}
                className="grid items-center gap-3 font-mono text-[11px]"
                style={{ gridTemplateColumns: "180px 1fr 56px 40px" }}
              >
                <span className="truncate text-[var(--praxis-bone)]">{d.label}</span>
                <div className="h-[6px] bg-[var(--praxis-line)]">
                  <div
                    className="h-full"
                    style={{
                      width: `${d.value * 100}%`,
                      background: d.value >= 0.7 ? "var(--praxis-plasma)" : "var(--praxis-argon)",
                      boxShadow:
                        d.value >= 0.7
                          ? "0 0 12px color-mix(in srgb, var(--praxis-plasma) 40%, transparent)"
                          : "0 0 12px color-mix(in srgb, var(--praxis-argon) 40%, transparent)",
                    }}
                  />
                </div>
                <span
                  className="text-right"
                  style={{ color: d.value >= 0.7 ? "var(--praxis-plasma)" : "var(--praxis-argon)" }}
                >
                  {d.value.toFixed(2)}
                </span>
                <span className="text-right text-[var(--praxis-mute)]">&times;{d.weight.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </article>

        {/* right column */}
        <div className="flex min-h-0 flex-col gap-[14px] overflow-hidden">
          <article className="relative overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-[22px]">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-[180px] w-[180px]"
              style={{
                background:
                  "radial-gradient(closest-side, color-mix(in srgb, var(--praxis-plasma) 35%, transparent), transparent)",
                filter: "blur(20px)",
              }}
            />
            <div className="relative">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-plasma)" }}>
                Recommended action
              </div>
              <div className="mt-3 font-display text-[24px] font-medium leading-[1.25] tracking-[-0.015em]" style={{ textWrap: "balance" }}>
                {run.pack.recommendedAction}
              </div>
              <div className="mt-4 flex gap-[18px] font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
                <span>mode &middot; assisted</span>
                <span>target &middot; {run.pack.buyer}</span>
                <span style={{ color: "var(--praxis-argon)" }}>risk &middot; low</span>
              </div>
            </div>
          </article>

          <article className="flex-1 overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              Evidence trail &middot; {run.events.length} items &middot; trust {trust.toFixed(2)}
            </div>
            <div className="mt-[14px] flex flex-col gap-3">
              {run.events.slice(0, 4).map((e, i) => {
                const color =
                  e.severity === "high"
                    ? "var(--praxis-plasma)"
                    : e.severity === "medium"
                    ? "var(--praxis-plasma)"
                    : "var(--praxis-argon)";
                const score = 0.7 + (i % 3) * 0.07;
                return (
                  <Link
                    key={i}
                    href={`/proof/${run.runId}#live-proof`}
                    className="grid items-start gap-3 transition-transform hover:translate-x-1"
                    style={{ gridTemplateColumns: "14px 1fr 38px" }}
                  >
                    <span
                      className="mt-[7px] block h-[7px] w-[7px] rounded-full"
                      style={{ background: color, boxShadow: `0 0 10px ${color}` }}
                    />
                    <div>
                      <div className="text-[13px] font-medium">{e.summary}</div>
                      <div className="mt-[2px] font-mono text-[10.5px] text-[var(--praxis-mute)]">
                        {e.source} &middot; {e.type} &middot; sev {e.severity}
                      </div>
                    </div>
                    <span className="text-right font-mono text-[11px]" style={{ color }}>
                      {score.toFixed(2)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </article>

          <article className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              Proof object &middot; signed
            </div>
            <div className="mt-3 grid grid-flow-dense grid-cols-2 gap-2 font-mono text-[10px] text-[var(--praxis-mute)]">
              <div>
                proof_hash <span className="text-[var(--praxis-bone)]">{run.proofHashPreview.slice(0, 10)}&hellip;</span>
              </div>
              <div>
                replay <span style={{ color: "var(--praxis-argon)" }}>deterministic</span>
              </div>
              <div>
                signature <span style={{ color: "var(--praxis-argon)" }}>ed25519</span>
              </div>
              <div>
                sources <span className="text-[var(--praxis-bone)]">{run.pack.sources.length}</span>
              </div>
            </div>
            <Link
              href={`/proof/${run.runId}#live-proof`}
              className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--praxis-bone)] transition-transform hover:translate-x-1"
            >
              Inspect signed proof &rarr;
            </Link>
          </article>
        </div>
      </div>
    </WorkbenchShell>
  );
}
