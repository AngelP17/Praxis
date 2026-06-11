"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { PraxisLogo } from "./PraxisLogo";

const stats = [
  { value: "12", label: "signals ingested" },
  { value: "77%", label: "priority score" },
  { value: "$38.5K", label: "annual value" },
  { value: "L0", label: "conformance" },
];

export function ProofProtocolHero({
  packId = "manufacturing-printer-gpo",
  proof,
  onRunPipeline,
}: {
  packId?: string;
  proof?: { run_id: string; proof_hash: string } | null;
  onRunPipeline?: () => void;
}) {
  const runId = proof?.run_id ?? `fieldlab_run_${packId}`;
  const fullProofHash = proof?.proof_hash ?? "sha" + "256:loading...";

  return (
    <section className="relative isolate w-full overflow-x-hidden bg-[var(--praxis-bg)] py-20 text-[var(--praxis-bone)]">
      <div className="ppp-glow pointer-events-none absolute left-[45%] top-[12%] -z-10 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,255,0.22),transparent_60%)] blur-[1px]" />
      <div className="ppp-glow pointer-events-none absolute right-[5%] top-[25%] -z-10 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(62,255,168,0.12),transparent_60%)] blur-[1px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(rgba(241,237,223,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.5)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,black_20%,transparent_100%)]" />

      <div className="relative z-20 border-b px-5 py-2.5" style={{ borderColor: "var(--praxis-line)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-muted)" }}>
          <span>run_id &middot; <span style={{ color: "var(--praxis-bone)" }}>{runId}</span></span>
          <span className="hidden md:block">praxis proof protocol</span>
          <span className="hidden md:block">floci &middot; ready</span>
        </div>
      </div>

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 pt-6 pb-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full border px-4 py-2 text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-[1.02]"
          style={{
            borderColor: "rgba(241,237,223,0.14)",
            background: "rgba(19,18,31,0.72)",
            backdropFilter: "blur(28px) saturate(180%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <PraxisLogo className="h-7 w-7" />
          <span className="font-display text-lg font-medium tracking-normal">praxis</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/console" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]">Console</Link>
          <Link href="/dashboard" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]">Dashboard</Link>
          <Link href="/proof/diff" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]">Diff</Link>
          <div
            className="flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]"
            style={{
              borderColor: "rgba(241,237,223,0.10)",
              background: "rgba(19,18,31,0.60)",
              backdropFilter: "blur(28px) saturate(180%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {runId.substring(0, 20)}
          </div>
        </div>
      </nav>

      <div className="relative mx-auto grid min-h-[70dvh] max-w-7xl grid-cols-1 grid-flow-dense gap-10 px-5 pt-6 pb-12 lg:grid-cols-12 lg:items-center">
        <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
          <div
            className="ppp-hero-copy mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
            style={{
              borderColor: "rgba(139,92,255,0.28)",
              background: "rgba(139,92,255,0.06)",
              color: "var(--praxis-plasma)",
              backdropFilter: "blur(28px) saturate(180%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
          >
            Praxis Proof Protocol
          </div>

          <h1 className="ppp-hero-copy font-display text-[clamp(2.8rem,5.5vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.02em] text-[var(--praxis-bone)]">
            Every decision ships <br className="hidden lg:block" />
            with a <span className="relative inline-flex h-[0.72em] min-w-[2.6em] translate-y-[0.04em] items-center justify-center rounded-full bg-[linear-gradient(110deg,var(--praxis-plasma),var(--praxis-argon))] px-[0.3em] align-middle text-[0.42em] font-semibold text-[var(--praxis-obsidian)] shadow-[0_0_40px_rgba(139,92,255,0.4)]">proof</span> operators <br className="hidden lg:block" />
            can replay.
          </h1>

          <p className="ppp-hero-copy mt-6 max-w-xl text-base leading-7 text-[var(--praxis-mute)]">
            Ontology-backed decisions with deterministic proof objects and governed human actions.
          </p>

          <div className="ppp-hero-copy mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <button
              onClick={onRunPipeline}
              className="group inline-flex items-center gap-3 rounded-full bg-[var(--praxis-bone)] px-8 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--praxis-obsidian)] shadow-[0_0_30px_rgba(241,237,223,0.1)] transition-all duration-700 hover:scale-105 hover:shadow-[0_0_50px_rgba(241,237,223,0.18)]"
            >
              Run live pipeline
              <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-1" />
            </button>
            <Link
              href="/console"
              className="inline-flex items-center gap-3 rounded-full border border-[rgba(241,237,223,0.24)] px-8 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-all duration-700 hover:scale-105 hover:border-[rgba(241,237,223,0.5)]"
            >
              Open console
            </Link>
          </div>

          {/* stats strip below layout */}
          <div className="ppp-hero-copy mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-10 lg:justify-start">
            {stats.map((stat) => (
              <div key={stat.label} className="ppp-stat text-center lg:text-left">
                <div className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{stat.value}</div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--praxis-muted)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ppp-hero-copy relative hidden lg:flex lg:col-span-5 flex-col border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.88)] backdrop-blur-md p-6 shadow-2xl" style={{ minHeight: "330px" }}>
          <div className="absolute inset-0 -z-10 overflow-hidden opacity-[0.14] transition-opacity duration-700">
            <video
              src="/praxis-assets/field-operator-loop.mp4"
              poster="/praxis-assets/operator-poster.png"
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between border-b border-[var(--praxis-line)] pb-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--praxis-muted)]">Verified Proof State</span>
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-argon)] animate-pulse" style={{ boxShadow: "0 0 8px var(--praxis-argon)" }} />
          </div>

          <div className="mt-5 space-y-3.5 font-mono text-[10.5px] leading-relaxed">
            <div className="flex justify-between">
              <span className="text-[var(--praxis-muted)]">RUN ID:</span>
              <span className="text-[var(--praxis-bone)]">{runId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--praxis-muted)]">PROOF HASH:</span>
              <span className="text-[var(--praxis-argon)] font-semibold">{fullProofHash.substring(0, 20)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--praxis-muted)]">CONFORMANCE:</span>
              <span className="text-[var(--praxis-plasma)] font-semibold">L0 VERIFIED</span>
            </div>
            <div className="flex justify-between border-b border-[var(--praxis-line)] pb-3">
              <span className="text-[var(--praxis-muted)]">SUBSTRATE:</span>
              <span className="text-[var(--praxis-argon)]">floci local sandbox</span>
            </div>
          </div>

          <div className="mt-5 rounded border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.65)] p-3.5 font-mono text-[9.5px]">
            <span className="text-[var(--praxis-argon)]">$</span> <span className="text-[var(--praxis-muted)]">uvx praxis-verify artifacts/latest/praxis_proof.json --level L0</span>
            <div className="mt-2 flex items-center gap-1.5 text-[var(--praxis-argon)]">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              <span>SCHEMA VALID &middot; CANONICAL HASH MATCHED</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
