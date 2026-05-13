"use client";

import Link from "next/link";
import { getWorkflowRun } from "@/lib/praxis-workflow";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction, GhostAction } from "./WorkbenchShell";

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

export function ReadoutBoard({ packId, runId }: { packId: string; runId?: string }) {
  const run = getWorkflowRun(packId);
  const annualLabel = `${run.pack.annualValue}/yr`;
  const trust = run.pack.evidenceTrust.toFixed(2);

  const topbarRight = (
    <>
      <GhostAction href={`/readout/${run.runId}/print`}>PDF</GhostAction>
      <GhostAction href={`/readout/${run.runId}/print?format=deck`}>Deck</GhostAction>
      <PrimaryAction href={`/proof/${run.runId}`}>Send to CFO</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={runId ?? run.runId}
      packName={run.pack.name}
      topbar={<TopbarTitle title="Executive Readout · Q2" subtitle={run.pack.name} right={topbarRight} />}
    >
      <div
        className="flex h-full justify-center overflow-hidden p-[30px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--praxis-surface-2) 0%, var(--praxis-obsidian) 60%)",
        }}
      >
        <article
          className="relative w-full max-w-[780px] overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-11"
          style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">
            Executive readout &middot; {run.runId.toUpperCase()} &middot; {run.site}
          </div>
          <h1
            className="mt-[14px] max-w-[640px] font-display text-[42px] font-medium leading-[1.08] tracking-[-0.025em]"
            style={{ textWrap: "balance" }}
          >
            {run.pack.rootCause}{" "}
            <span
              style={{
                background:
                  "linear-gradient(110deg, var(--praxis-plasma) 30%, var(--praxis-argon) 95%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {annualLabel}
            </span>{" "}
            in {run.pack.buyer.toLowerCase()} cost at {run.site}.
          </h1>

          <div className="mt-9 grid grid-cols-2 grid-flow-dense gap-5 md:grid-cols-4">
            {[
              ["Primary impact", run.businessProcess],
              ["Root cause", run.pack.rootCause],
              ["Evidence trust", trust, "var(--praxis-argon)"],
              ["Annual value", annualLabel, "var(--praxis-plasma)"],
            ].map(([k, v, c]) => (
              <div key={k}>
                <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
                  {k}
                </div>
                <div
                  className="mt-[6px] font-display text-[26px] font-medium tracking-[-0.015em]"
                  style={{ color: (c as string) ?? "var(--praxis-bone)" }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 grid-flow-dense gap-7 border-t border-[var(--praxis-line)] pt-6 md:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="mb-[10px] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
                Recommended action &middot; human approval
              </div>
              <p className="text-[14.5px] leading-[1.6] text-[var(--praxis-bone)]">
                {run.pack.recommendedAction}. No production mutation &mdash; communication-only path through{" "}
                <span className="font-mono" style={{ color: "var(--praxis-plasma)" }}>
                  {run.pack.buyer}
                </span>{" "}
                ticketing.
              </p>
              <div className="mb-[10px] mt-[22px] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
                Next 30 days
              </div>
              <ol className="m-0 list-decimal pl-[18px] text-[13.5px] leading-[1.75] text-[var(--praxis-bone)]">
                {run.timeline.slice(-3).map((s) => (
                  <li key={s.label}>
                    {s.label} &middot; <span className="text-[var(--praxis-mute)]">{s.detail}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border border-[var(--praxis-line)] bg-[var(--praxis-surface-2)] p-[18px]">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
                Trend &middot; incidents / week
              </div>
              <Spark data={[8, 9, 11, 12, 10, 9, 7, 6, 5, 4]} color="var(--praxis-plasma)" />
              <div className="mt-[14px] flex justify-between font-mono text-[10px] text-[var(--praxis-mute)]">
                <span>Last 10 weeks</span>
                <span style={{ color: "var(--praxis-argon)" }}>&minus;50%</span>
              </div>
              <div className="mt-[22px]">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
                  Expansion path
                </div>
                <div className="mt-2 flex flex-col gap-[6px]">
                  {run.expansion.slice(0, 3).map((e) => (
                    <Link
                      key={e.label}
                      href={`/expansion-map?focus=${encodeURIComponent(e.label)}`}
                      className="flex justify-between font-mono text-[11px] transition-transform hover:translate-x-1"
                    >
                      <span className="text-[var(--praxis-bone)]">{e.label}</span>
                      <span style={{ color: "var(--praxis-plasma)" }}>{e.score}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-9 flex justify-between border-t border-[var(--praxis-line)] pt-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
            <span>Praxis &middot; run {run.runId}</span>
            <span>v1.0 &middot; auto-generated &middot; audit {run.proofHashPreview.slice(0, 8)}&hellip;</span>
          </div>
        </article>
      </div>
    </WorkbenchShell>
  );
}
