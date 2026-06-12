"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, GitBranch, ShieldCheck } from "@phosphor-icons/react";
import { formatCurrency, formatPercent, type PraxisProof } from "@/lib/praxis-client";
import { PraxisLogo } from "./PraxisLogo";

const FALLBACK_HASH = "sha" + "256:loading";

export function ProofProtocolHero({
  packId = "manufacturing-printer-gpo",
  proof,
  onRunPipeline,
}: {
  packId?: string;
  proof?: PraxisProof | null;
  onRunPipeline?: () => void;
}) {
  const runId = proof?.run_id ?? `fieldlab_run_${packId}`;
  const hash = proof?.proof_hash ?? FALLBACK_HASH;
  const value = proof ? formatCurrency(proof.value_case.estimated_annual_value) : "$38.5K";
  const priority = proof ? formatPercent(proof.decision.priority_score) : "77%";
  const trust = proof ? formatPercent(proof.evidence.evidence_trust) : "83%";

  return (
    <header className="relative isolate min-h-[100dvh] overflow-hidden bg-[var(--praxis-bg)] pb-8 pt-12 text-[var(--praxis-bone)]">
      <video
        src="/praxis-assets/field-operator-loop.mp4"
        poster="/praxis-assets/operator-poster.png"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-[0.28]"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--praxis-bg)_0%,rgba(10,10,20,0.92)_38%,rgba(10,10,20,0.62)_72%,rgba(10,10,20,0.88)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[linear-gradient(0deg,var(--praxis-bg),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(241,237,223,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.42)_1px,transparent_1px)] [background-size:84px_84px]" />

      <nav className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="group inline-flex items-center gap-3 text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]">
          <span className="grid h-10 w-10 place-items-center border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.74)] backdrop-blur-xl transition-transform duration-300 group-hover:scale-[1.04]">
            <PraxisLogo className="h-6 w-6" />
          </span>
          <span className="font-display text-[18px] font-semibold tracking-[-0.02em]">praxis</span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          <Link href="/field-workbench" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)] transition-transform duration-300 hover:scale-105 hover:text-[var(--praxis-bone)]">Workbench</Link>
          <Link href="/dashboard" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)] transition-transform duration-300 hover:scale-105 hover:text-[var(--praxis-bone)]">Dashboard</Link>
          <Link href="/proof/diff" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)] transition-transform duration-300 hover:scale-105 hover:text-[var(--praxis-bone)]">Diff</Link>
          <Link href="https://github.com/AngelP17/Praxis" target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)] transition-transform duration-300 hover:scale-105 hover:text-[var(--praxis-bone)]">Repository</Link>
        </div>
      </nav>

      <div className="mx-auto grid min-h-[calc(100dvh-144px)] max-w-[1500px] grid-flow-dense grid-cols-1 gap-8 px-5 pb-4 pt-6 md:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.58fr)] lg:items-center">
        <div className="max-w-5xl">
          <div className="mb-7 max-w-[760px] border-l border-[var(--praxis-plasma)] pl-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">Forward-deployed operational intelligence</p>
          </div>
          <h1 className="max-w-[920px] font-display text-[clamp(4.2rem,8vw,8.4rem)] font-semibold leading-[0.86] tracking-[-0.05em] text-[var(--praxis-bone)]">
            Proof the full stack.
          </h1>
          <p className="mt-7 max-w-[620px] text-[17px] leading-8 text-[var(--praxis-mute)]">
            Praxis turns messy plant signals into validated API records, human-approved actions, and replayable proof objects.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onRunPipeline}
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[var(--praxis-bone)] px-7 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--praxis-obsidian)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Run proof
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <Link
              href="/field-workbench"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.54)] px-7 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Field workbench
            </Link>
          </div>
        </div>

        <aside className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.74)] backdrop-blur-xl">
          <div className="border-b border-[var(--praxis-line)] p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Active proof</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-argon)]">L0 verified</span>
            </div>
            <div className="mt-5 break-all font-mono text-[13px] leading-6 text-[var(--praxis-bone)]">{hash}</div>
          </div>
          <div className="grid grid-flow-dense grid-cols-3 border-b border-[var(--praxis-line)]">
            {[
              ["Priority", priority],
              ["Evidence", trust],
              ["Value", value],
            ].map(([label, metric]) => (
              <div key={label} className="border-r border-[var(--praxis-line)] p-5 last:border-r-0">
                <div className="font-display text-[32px] font-semibold leading-none tracking-[-0.04em]">{metric}</div>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-flow-dense gap-px bg-[var(--praxis-line)]">
            {[
              { label: "Event validated", detail: "Next route and FastAPI schema", icon: CheckCircle },
              { label: "Decision scored", detail: "Astraea deterministic run", icon: GitBranch },
              { label: "Action gated", detail: "Human approval retained", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="grid grid-flow-dense grid-cols-[44px_1fr] items-center bg-[var(--praxis-surface)] p-4">
                  <Icon className="h-5 w-5 text-[var(--praxis-argon)]" />
                  <div>
                    <div className="font-display text-[18px] font-semibold tracking-[-0.02em]">{item.label}</div>
                    <div className="mt-1 font-mono text-[10px] text-[var(--praxis-mute)]">{item.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-4 p-5 font-mono text-[10px] text-[var(--praxis-mute)]">
            <span className="truncate">{runId}</span>
            <Link href={`/proof/${runId}`} className="shrink-0 uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-105 hover:text-[var(--praxis-argon)]">Open proof</Link>
          </div>
        </aside>
      </div>
    </header>
  );
}
