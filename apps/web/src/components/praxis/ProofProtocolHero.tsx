"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, BracketsCurly, CheckCircle, GitCommit, TerminalWindow } from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { PraxisLogo } from "./PraxisLogo";
import { useProof } from "@/lib/hooks/useProof";
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
  ["Evidence", "Twelve messy plant signals are archived, scored, and linked back to their sources."],
  ["Ontology", "Objects and relationships turn printer drift into a decision graph operators can inspect."],
  ["Action", "Human approval stays explicit before Praxis writes an audit artifact or value case."],
];

export function ProofProtocolHero({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const { proof } = useProof(packId);
  const runId = proof?.run_id ?? `fieldlab_run_${packId}`;
  const fullProofHash = proof?.proof_hash ?? "sha256:loading…";

  useGSAP(
    () => {
      gsap.fromTo(
        ".ppp-hero-copy",
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, ease: "power3.out" }
      );

      gsap.fromTo(
        ".ppp-bento-card",
        { opacity: 0, y: 28, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ".ppp-bento", start: "top 78%" },
        }
      );

      gsap.fromTo(
        ".ppp-scrub-word",
        { opacity: 0.16, y: 14 },
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
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} className="relative isolate w-full overflow-x-hidden py-32 bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(113,91,255,0.34),transparent_34%),radial-gradient(circle_at_78%_34%,rgba(62,255,168,0.14),transparent_28%),linear-gradient(180deg,#0A0A14_0%,#13121F_54%,#0A0A14_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-35 [background-image:linear-gradient(rgba(241,237,223,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.08)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_74%)]" />

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 pt-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full border border-[rgba(241,237,223,0.16)] bg-[rgba(19,18,31,0.74)] px-4 py-2 text-[var(--praxis-bone)] backdrop-blur-xl transition-transform duration-700 hover:scale-[1.02]"
        >
          <PraxisLogo className="h-7 w-7" />
          <span className="font-display text-lg font-medium tracking-normal">praxis</span>
        </Link>
        <div className="hidden items-center gap-3 rounded-full border border-[rgba(241,237,223,0.14)] bg-[rgba(19,18,31,0.66)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)] backdrop-blur-xl md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--praxis-mint)]" />
          CI green · {runId.substring(0, 24)}
        </div>
      </nav>

      <div className="mx-auto flex min-h-[92dvh] max-w-7xl flex-col items-center justify-center px-5 py-24 text-center md:py-32">
        <h1 className="ppp-hero-copy max-w-6xl font-display text-[clamp(2.75rem,6.4vw,5.75rem)] font-medium leading-[0.95] tracking-normal">
          Every decision
          <br />
          ships with a{" "}
          <span className="inline-flex h-[0.72em] min-w-[2.4em] translate-y-[0.06em] items-center justify-center rounded-full bg-[linear-gradient(110deg,var(--praxis-violet),var(--praxis-mint))] px-[0.28em] align-middle text-[0.44em] font-medium text-[var(--praxis-bg)] shadow-[0_0_44px_rgba(113,91,255,0.28)]">
            proof
          </span>
          <br />
          operators can replay.
        </h1>
        <p className="ppp-hero-copy mt-8 max-w-3xl text-lg leading-8 text-[var(--praxis-muted)] md:text-xl">
          Praxis turns customer-specific signals into ontology-backed decisions, governed human actions, deterministic proof objects, and executive value cases.
        </p>
        <div className="ppp-hero-copy mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="#live-proof"
            className="group inline-flex items-center gap-3 rounded-full bg-[var(--praxis-bone)] px-7 py-4 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-bg)] transition-transform duration-700 hover:scale-105"
          >
            Run live pipeline
            <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-1" />
          </Link>
          <Link
            href="https://github.com/AngelP17/praxis/blob/main/docs/showcase/proof-object.md"
            className="inline-flex items-center gap-3 rounded-full border border-[rgba(241,237,223,0.72)] px-7 py-4 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-105"
          >
            Read the protocol
          </Link>
        </div>
      </div>

      <div className="ppp-bento mx-auto grid max-w-7xl grid-flow-dense grid-cols-1 gap-px border-y border-[var(--praxis-line)] bg-[var(--praxis-line)] md:grid-cols-12">
        <article className="ppp-bento-card group overflow-hidden bg-[rgba(19,18,31,0.96)] p-6 transition-transform duration-700 hover:-translate-y-1 md:col-span-7 md:row-span-2 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <BracketsCurly className="h-8 w-8 text-[var(--praxis-violet)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">proof_hash</span>
          </div>
          <p className="mt-16 break-all font-mono text-xl leading-9 text-[var(--praxis-bone)] md:text-3xl">
            {fullProofHash}
          </p>
          <div className="mt-12 h-1 overflow-hidden rounded-full bg-[var(--praxis-line)]">
            <div className="h-full w-4/5 rounded-full bg-[linear-gradient(90deg,var(--praxis-violet),var(--praxis-mint))] transition-transform duration-700 group-hover:scale-x-110" />
          </div>
        </article>

        <article className="ppp-bento-card group bg-[rgba(10,10,20,0.94)] p-6 transition-transform duration-700 hover:-translate-y-1 md:col-span-5 md:p-8">
          <CheckCircle className="h-7 w-7 text-[var(--praxis-mint)]" weight="fill" />
          <h2 className="mt-10 font-display text-4xl font-medium leading-none tracking-normal">Replay deterministic</h2>
          <p className="mt-5 text-sm leading-7 text-[var(--praxis-muted)]">Same pack, same events, same proof hash. Drift becomes a failed gate.</p>
        </article>

        <article className="ppp-bento-card group bg-[rgba(10,10,20,0.94)] p-6 transition-transform duration-700 hover:-translate-y-1 md:col-span-5 md:p-8">
          <PraxisMark size={28} />
          <h2 className="mt-10 font-display text-4xl font-medium leading-none tracking-normal">Floci runtime ready</h2>
          <p className="mt-5 text-sm leading-7 text-[var(--praxis-muted)]">SQS, S3, DynamoDB and EventBridge form from local FieldLab substrate.</p>
        </article>

        <article className="ppp-bento-card group overflow-hidden bg-[rgba(28,26,46,0.94)] p-6 transition-transform duration-700 hover:-translate-y-1 md:col-span-12 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <TerminalWindow className="h-6 w-6 text-[var(--praxis-mint)]" />
              <span className="font-display text-2xl font-medium tracking-normal">Third-party verifier path</span>
            </div>
            <code className="overflow-x-auto rounded-full border border-[rgba(241,237,223,0.16)] bg-[var(--praxis-bg)] px-5 py-3 font-mono text-xs text-[var(--praxis-muted)]">
              python scripts/verify_praxis_proof.py artifacts/latest/praxis_proof.json
            </code>
          </div>
        </article>
      </div>

      <div className="mx-auto grid grid-flow-dense max-w-7xl gap-16 px-5 py-32 md:grid-cols-[0.82fr_1.18fr] md:py-48">
        <div className="ppp-desire min-h-[560px]">
          <div className="ppp-pin-copy">
            <GitCommit className="h-8 w-8 text-[var(--praxis-violet)]" />
            <h2 className="mt-8 max-w-xl font-display text-[clamp(2.5rem,5vw,5rem)] font-medium leading-[0.96] tracking-normal">
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
            {accordion.map(([title, body]) => (
              <div key={title} className="group flex min-w-0 flex-1 flex-col justify-end overflow-hidden border-r border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 transition-[flex] duration-700 hover:flex-[2.2]">
                <h3 className="font-display text-3xl font-medium tracking-normal">{title}</h3>
                <p className="mt-5 max-h-0 text-sm leading-7 text-[var(--praxis-muted)] opacity-0 transition-all duration-700 group-hover:max-h-40 group-hover:opacity-100">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-y border-[var(--praxis-line)] py-8">
        <div className="praxis-marquee flex w-max gap-12 font-mono text-xs uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          {["ontology compiler", "evidence trust", "human approval", "replay hash", "value case", "executive readout", "FieldLab"].map((item) => (
            <span key={item}>{item}</span>
          ))}
          {["ontology compiler", "evidence trust", "human approval", "replay hash", "value case", "executive readout", "FieldLab"].map((item) => (
            <span key={`${item}-repeat`}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
