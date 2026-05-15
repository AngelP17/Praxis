"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { ProofProtocolHero } from "@/components/praxis/ProofProtocolHero";
import { useProof } from "@/lib/hooks/useProof";
import { ProofAnatomySection } from "./ProofAnatomySection";
import { HiFiStickyTour } from "./HiFiStickyTour";
import { PipelineRunnerModal } from "./PipelineRunnerModal";
import { TweaksPanel } from "./TweaksPanel";

// ── Outcomes section ────────────────────────────────────────────────────────
function OutcomesSection() {
  const metrics = [
    { value: "7 min", label: "Signal to readout" },
    { value: "0.82",  label: "Evidence trust",     accent: "var(--praxis-argon)" },
    { value: "$38.4K", label: "Annual value recovered" },
    { value: "−50%",  label: "Ticket recurrence",  accent: "var(--praxis-plasma)" },
  ];

  return (
    <section className="border-y py-24 md:py-36" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-14 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-muted)" }}>
          Outcomes
        </div>
        <div className="grid gap-px border" style={{ borderColor: "var(--praxis-line)", gridTemplateColumns: "repeat(4,1fr)" }}>
          {metrics.map((m) => (
            <div key={m.label} className="border-r p-8 last:border-r-0" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-obsidian)" }}>
              <div
                className="font-display text-[clamp(2.4rem,4vw,4rem)] font-semibold leading-none tracking-tight"
                style={{ color: m.accent ?? "var(--praxis-bone)" }}
              >
                {m.value}
              </div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-muted)" }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Trust / provenance block ─────────────────────────────────────────────────
function TrustSection() {
  const cards = [
    { title: "SOC 2 Type II",       body: "Audit controls mapped to every proof step.",           accent: "var(--praxis-argon)" },
    { title: "Air-gapped mode",     body: "Run the full pipeline with zero egress.",              accent: "var(--praxis-bone)" },
    { title: "Sigstore / Rekor",    body: "Ed25519 signatures anchored to public transparency log.", accent: "var(--praxis-amber)" },
    { title: "Deterministic",       body: "Same inputs always produce the same proof hash.",      accent: "var(--praxis-argon)" },
    { title: "Replayable",          body: "Any auditor can re-run the proof from archived events.", accent: "var(--praxis-plasma)" },
    { title: "Open spec",           body: "Proof schema published under Apache 2 license.",       accent: "var(--praxis-bone)" },
  ];

  return (
    <section className="border-b py-24 md:py-36" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-obsidian)" }}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-muted)" }}>
          Provenance guarantees
        </div>
        <h2 className="mb-16 font-display text-[clamp(2rem,4.5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.02em]" style={{ color: "var(--praxis-bone)" }}>
          Trust built into<br />the protocol.
        </h2>
        <div className="grid gap-px border" style={{ borderColor: "var(--praxis-line)", gridTemplateColumns: "repeat(3,1fr)" }}>
          {cards.map((card) => (
            <div
              key={card.title}
              className="border-r p-8 last:border-r-0 transition-all duration-700 hover:-translate-y-0.5"
              style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}
            >
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: card.accent }}>
                verified
              </div>
              <div className="font-display text-xl font-semibold" style={{ color: "var(--praxis-bone)" }}>
                {card.title}
              </div>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--praxis-muted)" }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FieldLab terminal section ────────────────────────────────────────────────
function FieldLabTerminalSection() {
  const lines = [
    { prompt: "$", text: "make praxis-fieldlab-up", color: "var(--praxis-bone)" },
    { prompt: "",  text: "  → SQS   ready · endpoint http://localhost:4566", color: "var(--praxis-argon)" },
    { prompt: "",  text: "  → S3    ready · bucket praxis-artifacts-dev",    color: "var(--praxis-argon)" },
    { prompt: "",  text: "  → DDB   ready · table praxis-proof-ledger",      color: "var(--praxis-argon)" },
    { prompt: "",  text: "  → floci ready · 3 services healthy",             color: "var(--praxis-argon)" },
    { prompt: "$", text: "make praxis-proof PACK=manufacturing-printer-gpo", color: "var(--praxis-bone)" },
    { prompt: "",  text: "  running signal ingestion…",                      color: "var(--praxis-muted)" },
    { prompt: "",  text: "  running ontology compilation…",                  color: "var(--praxis-muted)" },
    { prompt: "",  text: "  running decision scoring…",                      color: "var(--praxis-muted)" },
    { prompt: "",  text: "  proof sealed · sha256:b4f9…c1a2",               color: "var(--praxis-amber)" },
    { prompt: "$", text: "uvx praxis-verify artifacts/latest/praxis_proof.json", color: "var(--praxis-bone)" },
    { prompt: "",  text: "  proof verified · all 6 checks passed · 231ms",  color: "var(--praxis-argon)" },
  ];

  return (
    <section className="border-b py-24 md:py-36" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col justify-center">
            <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-muted)" }}>
              Local proof workflow
            </div>
            <h2 className="font-display text-[clamp(2rem,4.5vw,4rem)] font-semibold leading-[0.96] tracking-[-0.02em]" style={{ color: "var(--praxis-bone)" }}>
              Runs on your machine.<br />
              <span style={{ color: "var(--praxis-muted)" }}>No cloud required.</span>
            </h2>
            <p className="mt-6 text-base leading-8" style={{ color: "var(--praxis-muted)" }}>
              FieldLab spins up SQS, S3, DynamoDB and EventBridge locally via Floci. Run the full proof pipeline from your terminal, then verify the artifact independently with <code className="font-mono text-sm" style={{ color: "var(--praxis-amber)" }}>uvx praxis-verify</code>.
            </p>
          </div>
          <div className="overflow-hidden border" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-obsidian)" }}>
            <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--praxis-line)" }}>
              {["var(--praxis-crit)", "var(--praxis-amber)", "var(--praxis-argon)"].map((c, i) => (
                <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-2 font-mono text-[10px]" style={{ color: "var(--praxis-faint)" }}>terminal</span>
            </div>
            <div className="p-5 font-mono text-[11px] leading-[1.9]">
              {lines.map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ color: "var(--praxis-plasma)", opacity: line.prompt ? 1 : 0 }}>
                    {line.prompt || "$"}
                  </span>
                  <span style={{ color: line.color }}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA section ──────────────────────────────────────────────────────────────
function CTASection({ onRunPipeline }: { onRunPipeline: () => void }) {
  return (
    <section className="border-b py-32 text-center md:py-48" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-obsidian)" }}>
      <div className="mx-auto max-w-5xl px-5">
        <div className="mb-8 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-muted)" }}>
          run_id &middot; pxs_GA-PRINT-GPO-042 &middot; proof_hash &middot; sha256:b4f9&hellip;c1a2
        </div>
        <h2
          className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.94] tracking-[-0.025em]"
          style={{
            background: "linear-gradient(120deg, var(--praxis-bone) 40%, var(--praxis-plasma) 70%, var(--praxis-amber) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Every decision ships with a proof operators can replay.
        </h2>
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={onRunPipeline}
            className="group inline-flex items-center gap-3 rounded-full bg-[var(--praxis-bone)] px-8 py-4 font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--praxis-bg)] shadow-[0_0_40px_rgba(241,237,223,0.12)] transition-all duration-700 hover:scale-105 hover:shadow-[0_0_60px_rgba(241,237,223,0.2)]"
          >
            Run live pipeline
            <ArrowRight className="h-4 w-4 transition-transform duration-700 group-hover:translate-x-1" />
          </button>
          <a
            href="https://github.com/AngelP17/Praxis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full border px-8 py-4 font-mono text-xs uppercase tracking-[0.12em] transition-all duration-700 hover:scale-105"
            style={{ borderColor: "rgba(241,237,223,0.3)", color: "var(--praxis-bone)" }}
          >
            Open spec
          </a>
        </div>
        <div className="mt-14 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-faint)" }}>
          Apache 2.0 &middot; sigstore anchored &middot; deterministic replay &middot; open spec
        </div>
      </div>
    </section>
  );
}

// ── Root component ────────────────────────────────────────────────────────────
export function PraxisLanding() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const { proof } = useProof(packId);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
      <ProofProtocolHero
        packId={packId}
        proof={proof}
        onRunPipeline={() => setModalOpen(true)}
      />

      <ProofAnatomySection />

      <HiFiStickyTour />

      <FieldLabTerminalSection />

      <OutcomesSection />

      <TrustSection />

      <CTASection onRunPipeline={() => setModalOpen(true)} />

      <PipelineRunnerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        packId={packId}
      />

      <TweaksPanel />
    </main>
  );
}
