"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, BracketsCurly, CheckCircle, GitCommit, Shield, TerminalWindow } from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PraxisLogo } from "./PraxisLogo";
import { PraxisMark } from "./PraxisMark";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const proofWords = [
  "Raw",
  "events",
  "become",
  "ontology",
  "links,",
  "evidence",
  "scores,",
  "human",
  "approval,",
  "audit",
  "hashes,",
  "and",
  "a",
  "business",
  "case",
  "that",
  "can",
  "be",
  "replayed.",
];

const accordion = [
  ["Evidence", "Twelve messy plant signals are archived, scored, and linked back to their sources.", Shield],
  ["Ontology", "Objects and relationships turn printer drift into a decision graph operators can inspect.", GitCommit],
  ["Action", "Human approval stays explicit before Praxis writes an audit artifact or value case.", CheckCircle],
] as const;

const stats = [
  { value: "12", label: "signals ingested" },
  { value: "77%", label: "priority score" },
  { value: "$38.5K", label: "annual value" },
  { value: "L1", label: "conformance" },
];

export function ProofProtocolHero({ packId = "manufacturing-printer-gpo", proof }: { packId?: string; proof?: { run_id: string; proof_hash: string } | null }) {
  const rootRef = useRef<HTMLElement>(null);
  const runId = proof?.run_id ?? `fieldlab_run_${packId}`;
  const fullProofHash = proof?.proof_hash ?? "sha256:loading...";

  useGSAP(
    () => {
      gsap.fromTo(
        ".ppp-bento-card",
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".ppp-bento", start: "top 82%" },
        }
      );

      gsap.fromTo(
        ".ppp-scrub-word",
        { opacity: 0.12, y: 14 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          ease: "none",
          scrollTrigger: {
            trigger: ".ppp-desire",
            start: "top 68%",
            end: "bottom 42%",
            scrub: true,
          },
        }
      );

      ScrollTrigger.create({
        trigger: ".ppp-desire",
        start: "top 12%",
        end: "bottom 62%",
        pin: ".ppp-pin-copy",
        pinSpacing: false,
        anticipatePin: 1,
      });

      gsap.to(".ppp-glow", {
        scale: 1.15,
        opacity: 0.7,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="relative isolate w-full overflow-x-hidden bg-[var(--praxis-bg)] py-20 md:py-24 text-[var(--praxis-bone)]">
      {/* ambient glow orbs */}
      <div className="ppp-glow pointer-events-none absolute left-1/2 top-[18%] -z-10 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,255,0.28),transparent_60%)] blur-[1px]" />
      <div className="ppp-glow pointer-events-none absolute right-[10%] top-[32%] -z-10 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(62,255,168,0.14),transparent_60%)] blur-[1px]" />
      {/* grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(rgba(241,237,223,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.5)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,black_20%,transparent_100%)]" />

      {/* nav */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 pt-8 pb-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full border border-[rgba(241,237,223,0.16)] bg-[rgba(19,18,31,0.74)] px-4 py-2 text-[var(--praxis-bone)] backdrop-blur-xl transition-transform duration-700 hover:scale-[1.02]"
        >
          <PraxisLogo className="h-7 w-7" />
          <span className="font-display text-lg font-medium tracking-normal">praxis</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/console" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]">Console</Link>
          <Link href="/dashboard" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]">Dashboard</Link>
          <Link href="/proof/diff" className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)] transition-transform duration-700 hover:scale-105 hover:text-[var(--praxis-bone)]">Diff</Link>
          <div className="flex items-center gap-2 rounded-full border border-[rgba(241,237,223,0.14)] bg-[rgba(19,18,31,0.66)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)] backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--praxis-mint)] shadow-[0_0_6px_rgba(62,255,168,0.6)]" />
            CI green · {runId.substring(0, 20)}
          </div>
        </div>
      </nav>

      {/* hero — split screen, left-aligned */}
      <div className="relative mx-auto grid grid-flow-dense min-h-[88dvh] max-w-7xl grid-cols-1 items-center gap-12 px-5 pt-20 pb-20 md:grid-cols-[1fr_420px] md:gap-16">
        {/* left: copy */}
        <div>
          <div className="ppp-hero-copy mb-7 inline-flex items-center gap-2 rounded-full border border-[rgba(139,92,255,0.3)] bg-[rgba(139,92,255,0.08)] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-violet)]">
            <span className="h-1 w-1 rounded-full bg-[var(--praxis-violet)] shadow-[0_0_6px_rgba(139,92,255,0.8)]" />
            Praxis Proof Protocol v0.1
          </div>

          <h1 className="ppp-hero-copy font-display text-[clamp(2.6rem,6vw,5.6rem)] font-semibold leading-[0.93] tracking-[-0.025em]">
            Every decision
            <br />
            ships with a{" "}
            <span className="relative inline-flex h-[0.72em] min-w-[2.6em] translate-y-[0.04em] items-center justify-center rounded-full bg-[linear-gradient(110deg,var(--praxis-violet),var(--praxis-mint))] px-[0.3em] align-middle text-[0.42em] font-semibold text-[var(--praxis-bg)] shadow-[0_0_60px_rgba(113,91,255,0.4),0_0_120px_rgba(62,255,168,0.15)]">
              proof
            </span>
            <br />
            operators
            <br />
            can replay.
          </h1>

          <p className="ppp-hero-copy mt-7 max-w-[46ch] text-lg leading-8 text-[rgba(241,237,223,0.58)]">
            Messy customer signals become ontology-backed decisions, governed human actions, deterministic proof objects, and executive value cases — all cryptographically verifiable.
          </p>

          <div className="ppp-hero-copy mt-10 flex flex-wrap gap-4">
            <a
              href="#live-proof"
              onClick={(e) => { e.preventDefault(); document.getElementById("live-proof")?.scrollIntoView({ behavior: "smooth" }); }}
              className="group inline-flex items-center gap-3 rounded-full bg-[var(--praxis-bone)] px-7 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--praxis-bg)] shadow-[0_0_40px_rgba(241,237,223,0.12)] transition-all duration-700 hover:scale-105 hover:shadow-[0_0_60px_rgba(241,237,223,0.2)]"
            >
              Run live pipeline
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-700 group-hover:translate-x-1" />
            </a>
            <Link
              href="/console"
              className="inline-flex items-center gap-3 rounded-full border border-[rgba(241,237,223,0.22)] px-7 py-3.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-all duration-700 hover:scale-105 hover:border-[rgba(241,237,223,0.5)]"
            >
              Open console
            </Link>
          </div>
        </div>

        {/* right: stats card */}
        <div className="ppp-hero-copy hidden md:block">
          <div className="overflow-hidden border border-[rgba(241,237,223,0.1)] bg-[rgba(19,18,31,0.7)] backdrop-blur-xl">
            <div className="border-b border-[rgba(241,237,223,0.07)] px-6 py-4">
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--praxis-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--praxis-mint)] shadow-[0_0_6px_rgba(62,255,168,0.6)]" />
                Live proof metrics
              </div>
            </div>
            <div className="grid grid-flow-dense grid-cols-2 divide-x divide-y divide-[rgba(241,237,223,0.07)]">
              {stats.map((stat) => (
                <div key={stat.label} className="ppp-stat px-6 py-6">
                  <div className="font-display text-4xl font-semibold tracking-tight">{stat.value}</div>
                  <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--praxis-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-[rgba(241,237,223,0.07)] px-6 py-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">Run ID</div>
              <div className="mt-1 truncate font-mono text-[10.5px] text-[var(--praxis-mint)]">{runId}</div>
            </div>
          </div>
        </div>
      </div>

      {/* bento grid */}
      <div className="ppp-bento mx-auto grid max-w-7xl grid-flow-dense grid-cols-1 gap-px border-y border-[var(--praxis-line)] bg-[var(--praxis-line)] md:grid-cols-12">
        <article className="ppp-bento-card group relative overflow-hidden bg-[rgba(19,18,31,0.96)] p-6 transition-transform duration-700 hover:-translate-y-1 md:col-span-7 md:row-span-2 md:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(139,92,255,0.12),transparent_70%)]" />
          <div className="flex items-center justify-between gap-4">
            <BracketsCurly className="h-8 w-8 text-[var(--praxis-violet)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">proof_hash</span>
          </div>
          <p className="mt-14 break-all font-mono text-xl leading-9 text-[var(--praxis-bone)] md:text-3xl">
            {fullProofHash}
          </p>
          <div className="mt-10 h-1.5 overflow-hidden rounded-full bg-[var(--praxis-line)]">
            <div className="h-full w-4/5 rounded-full bg-[linear-gradient(90deg,var(--praxis-violet),var(--praxis-mint))] shadow-[0_0_12px_rgba(139,92,255,0.4)] transition-transform duration-700 group-hover:scale-x-110" />
          </div>
        </article>

        <article className="ppp-bento-card group relative overflow-hidden bg-[rgba(10,10,20,0.94)] p-6 transition-transform duration-700 hover:-translate-y-1 md:col-span-5 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(62,255,168,0.08),transparent_70%)]" />
          <CheckCircle className="h-7 w-7 text-[var(--praxis-mint)]" weight="fill" />
          <h2 className="mt-8 font-display text-3xl font-semibold leading-none tracking-normal md:text-4xl">Replay deterministic</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--praxis-muted)]">Same pack, same events, same proof hash. Drift becomes a failed CI gate.</p>
        </article>

        <article className="ppp-bento-card group relative overflow-hidden bg-[rgba(10,10,20,0.94)] p-6 transition-transform duration-700 hover:-translate-y-1 md:col-span-5 md:p-8">
          <PraxisMark size={28} />
          <h2 className="mt-8 font-display text-3xl font-semibold leading-none tracking-normal md:text-4xl">Floci runtime ready</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--praxis-muted)]">SQS, S3, DynamoDB and EventBridge — the full proof pipeline from local FieldLab substrate.</p>
        </article>

        <article className="ppp-bento-card group overflow-hidden bg-[rgba(28,26,46,0.94)] p-6 transition-transform duration-700 hover:-translate-y-1 md:col-span-12 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <TerminalWindow className="h-6 w-6 text-[var(--praxis-mint)]" />
              <span className="font-display text-2xl font-semibold tracking-normal">Third-party verifier path</span>
            </div>
            <code className="overflow-x-auto rounded-full border border-[rgba(241,237,223,0.16)] bg-[var(--praxis-bg)] px-5 py-3 font-mono text-xs text-[var(--praxis-muted)]">
              uvx praxis-verify artifacts/latest/praxis_proof.json
            </code>
          </div>
        </article>
      </div>

      {/* scrub text + pin split + accordion */}
      <div className="mx-auto grid grid-flow-dense max-w-7xl gap-16 px-5 py-32 md:grid-cols-[0.82fr_1.18fr] md:py-48">
        <div className="ppp-desire min-h-[560px]">
          <div className="ppp-pin-copy">
            <GitCommit className="h-8 w-8 text-[var(--praxis-violet)]" />
            <h2 className="mt-8 max-w-xl font-display text-[clamp(2.5rem,5vw,5rem)] font-semibold leading-[0.96] tracking-normal">
              Proof is the product surface.
            </h2>
          </div>
        </div>
        <div className="space-y-12">
          <p className="text-3xl leading-tight text-[var(--praxis-bone)] md:text-5xl">
            {proofWords.map((word) => (
              <span key={word} className="ppp-scrub-word mr-3 inline-block">
                {word}
              </span>
            ))}
          </p>
          <div className="flex h-[420px] overflow-hidden border border-[var(--praxis-line)]">
            {accordion.map(([title, body, Icon]) => (
              <div key={title} className="group flex min-w-0 flex-1 flex-col justify-end overflow-hidden border-r border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 transition-[flex] duration-700 hover:flex-[2.4]">
                <Icon className="mb-3 h-5 w-5 text-[var(--praxis-violet)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" weight="fill" />
                <h3 className="font-display text-3xl font-semibold tracking-normal">{title}</h3>
                <p className="mt-4 max-h-0 text-sm leading-7 text-[var(--praxis-muted)] opacity-0 transition-all duration-700 group-hover:max-h-40 group-hover:opacity-100">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* marquee */}
      <div className="overflow-hidden border-y border-[var(--praxis-line)] py-8">
        <div className="praxis-marquee flex w-max gap-16 font-mono text-xs uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
          {["ontology compiler", "evidence trust", "human approval", "replay hash", "value case", "executive readout", "FieldLab", "Ed25519 signing", "deterministic proof"].map((item) => (
            <span key={item} className="flex items-center gap-3">
              <span className="h-1 w-1 rounded-full bg-[var(--praxis-violet)]" />
              {item}
            </span>
          ))}
          {["ontology compiler", "evidence trust", "human approval", "replay hash", "value case", "executive readout", "FieldLab", "Ed25519 signing", "deterministic proof"].map((item) => (
            <span key={`${item}-dup`} className="flex items-center gap-3">
              <span className="h-1 w-1 rounded-full bg-[var(--praxis-violet)]" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
