"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BracketsCurly, CheckCircle, Database, GitBranch, ShieldCheck } from "@phosphor-icons/react";
import { ProofProtocolHero } from "@/components/praxis/ProofProtocolHero";
import { useProof } from "@/lib/hooks/useProof";
import { PipelineRunnerModal } from "./PipelineRunnerModal";
import { TweaksPanel } from "./TweaksPanel";

// ── Outcomes section ────────────────────────────────────────────────────────
function MiniSpark({ color }: { color: string }) {
  return (
    <svg width="42" height="14" className="inline-block ml-3.5 opacity-[0.76]" aria-hidden="true">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        points="0,8 8,3 16,11 24,5 32,9 42,2"
      />
    </svg>
  );
}

function OutcomesSection() {
  const metrics = [
    { value: "7 min", label: "Signal to readout" },
    { value: "0.82",  label: "Evidence trust",     accent: "var(--praxis-argon)" },
    { value: "$38.4K", label: "Annual value recovered" },
    { value: "−50%",  label: "Ticket recurrence",  accent: "var(--praxis-plasma)" },
  ];

  return (
    <section className="border-y py-20" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-14 font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-muted)" }}>
          Outcomes
        </div>
        <div className="grid grid-flow-dense gap-px border bg-[var(--praxis-line)] md:grid-cols-4" style={{ borderColor: "var(--praxis-line)" }}>
          {metrics.map((m) => (
            <div key={m.label} className="p-8 flex flex-col justify-between" style={{ background: "var(--praxis-obsidian)" }}>
              <div>
                <div
                  className="font-display text-[clamp(2.4rem,4vw,4rem)] font-semibold leading-none tracking-tight flex items-baseline"
                  style={{ color: m.accent ?? "var(--praxis-bone)" }}
                >
                  {m.value}
                  <MiniSpark color={m.accent ?? "var(--praxis-muted)"} />
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-muted)" }}>
                  {m.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FullStackProofPath({ onRunPipeline }: { onRunPipeline: () => void }) {
  const steps = [
    { title: "Event intake", body: "Operator signal enters a Next route handler and demo API contract.", icon: Database },
    { title: "Decision run", body: "The deterministic pack produces priority, evidence trust, and action mode.", icon: GitBranch },
    { title: "Approval", body: "The action is captured as a governed human step before proof export.", icon: ShieldCheck },
    { title: "Proof export", body: "The proof object, readout, dashboard, and verifier command use the same run.", icon: BracketsCurly },
  ];

  return (
    <section className="border-b py-20" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-obsidian)" }}>
      <div className="mx-auto grid max-w-7xl grid-flow-dense gap-8 px-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <h2 className="font-display text-[clamp(2rem,4.2vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.025em]" style={{ color: "var(--praxis-bone)" }}>
              Full stack proof path
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7" style={{ color: "var(--praxis-muted)" }}>
              Printer GPO drift moves from intake to decision, approval, proof object, dashboard, and audit export.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onRunPipeline}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-[var(--praxis-bone)] px-6 py-3.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--praxis-obsidian)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Run path
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/field-workbench"
              className="inline-flex items-center justify-center rounded-full border border-[var(--praxis-line)] px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Workbench
            </Link>
          </div>
        </div>
        <div className="grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] sm:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="min-h-[190px] bg-[var(--praxis-surface)] p-6">
                <div className="flex items-center justify-between gap-4">
                  <Icon className="h-6 w-6 text-[var(--praxis-plasma)]" />
                  <CheckCircle className="h-5 w-5 text-[var(--praxis-argon)]" weight="fill" />
                </div>
                <h3 className="mt-8 font-display text-2xl font-semibold tracking-[-0.02em] text-[var(--praxis-bone)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--praxis-muted)]">{step.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Logo wall ────────────────────────────────────────────────────────────────
function LogoWall() {
  const logos = [
    { name: "GitHub", slug: "github" },
    { name: "Docker", slug: "docker" },
    { name: "Kubernetes", slug: "kubernetes" },
    { name: "Terraform", slug: "terraform" },
    { name: "Grafana", slug: "grafana" },
    { name: "Ansible", slug: "ansible" },
  ];

  return (
    <section className="border-b py-20" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo) => (
            <img
              key={logo.slug}
              src={`https://cdn.simpleicons.org/${logo.slug}/86819F`}
              alt={logo.name}
              className="h-8 w-8 opacity-60 transition-opacity duration-500 hover:opacity-100 md:h-10 md:w-10"
            />
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
    { prompt: "$", text: "make praxis-proof", color: "var(--praxis-bone)" },
    { prompt: "",  text: "  running signal ingestion…",                      color: "var(--praxis-muted)" },
    { prompt: "",  text: "  running ontology compilation…",                  color: "var(--praxis-muted)" },
    { prompt: "",  text: "  running decision scoring…",                      color: "var(--praxis-muted)" },
    { prompt: "",  text: "  proof sealed · sha256:b4f9…c1a2",               color: "var(--praxis-amber)" },
    { prompt: "$", text: "uvx praxis-verify artifacts/latest/praxis_proof.json", color: "var(--praxis-bone)" },
    { prompt: "",  text: "  proof verified · all 6 checks passed · 231ms",  color: "var(--praxis-argon)" },
  ];

  return (
    <section className="border-b py-20" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-surface)" }}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid grid-flow-dense gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="flex flex-col justify-center">
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
    <section className="border-b py-20 text-center md:py-24" style={{ borderColor: "var(--praxis-line)", background: "var(--praxis-obsidian)" }}>
      <div className="mx-auto max-w-5xl px-5">
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

      <FullStackProofPath onRunPipeline={() => setModalOpen(true)} />

      <FieldLabTerminalSection />

      <OutcomesSection />

      <LogoWall />

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
