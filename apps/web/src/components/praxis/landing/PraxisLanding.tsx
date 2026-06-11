"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BracketsCurly, ChartLineUp, CheckCircle, Database, GitBranch, LockKey, ShieldCheck, UsersThree } from "@phosphor-icons/react";
import { ProofProtocolHero } from "@/components/praxis/ProofProtocolHero";
import { formatCurrency, formatPercent } from "@/lib/praxis-client";
import { useProof } from "@/lib/hooks/useProof";
import { PipelineRunnerModal } from "./PipelineRunnerModal";
import { PortfolioAnalytics } from "./PortfolioAnalytics";

function ProofPathRail({ packId, runId }: { packId: string; runId: string }) {
  const steps = [
    {
      title: "Intake",
      body: "A plant-floor signal is validated at the web boundary and routed to the backend contract.",
      icon: Database,
      href: "/event-ingestion",
    },
    {
      title: "Score",
      body: "A deterministic decision run turns evidence trust, root cause, and value into one record.",
      icon: GitBranch,
      href: "/decision",
    },
    {
      title: "Approve",
      body: "The action stays gated by a human operator before any proof object is accepted.",
      icon: ShieldCheck,
      href: `/field-workbench/${runId}`,
    },
    {
      title: "Replay",
      body: "The proof can be exported, diffed, and independently verified from the same run.",
      icon: BracketsCurly,
      href: `/proof/${runId}?pack=${packId}`,
    },
  ];

  return (
    <section className="border-y border-[var(--praxis-line)] bg-[var(--praxis-surface)] py-24">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="max-w-4xl">
          <h2 className="font-display text-[clamp(2.8rem,6vw,6.4rem)] font-semibold leading-[0.9] tracking-[-0.045em] text-[var(--praxis-bone)]">
            One workflow, every layer visible.
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[var(--praxis-mute)]">
            The flagship run is not a static demo. It shows UI state, API orchestration, backend validation, decision logic, approval, proof export, and dashboard posture.
          </p>
        </div>

        <div className="mt-14 grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.title} href={step.href} className="group min-h-[300px] bg-[var(--praxis-obsidian)] p-7 transition-transform duration-300 hover:scale-[1.01] hover:bg-[var(--praxis-surface-2)] active:scale-[0.99]">
                <div className="flex items-center justify-between">
                  <Icon className="h-7 w-7 text-[var(--praxis-plasma)]" />
                  <ArrowRight className="h-4 w-4 text-[var(--praxis-mute)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--praxis-argon)]" />
                </div>
                <div className="mt-20 font-display text-[34px] font-semibold tracking-[-0.04em] text-[var(--praxis-bone)]">{step.title}</div>
                <p className="mt-4 max-w-[28ch] text-sm leading-7 text-[var(--praxis-mute)]">{step.body}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProofArtifactSpread({
  packId,
  runId,
  proofHash,
}: {
  packId: string;
  runId: string;
  proofHash: string;
}) {
  const code = [
    "{",
    `  "run_id": "${runId}",`,
    `  "proof_hash": "${proofHash}",`,
    '  "conformance": "L0",',
    '  "action_mode": "human_approval",',
    '  "replay": { "deterministic": true }',
    "}",
  ];

  return (
    <section className="border-b border-[var(--praxis-line)] bg-[var(--praxis-bg)] py-24">
      <div className="mx-auto grid max-w-[1500px] grid-flow-dense gap-10 px-5 md:px-8 lg:grid-cols-[0.74fr_1.26fr]">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <h2 className="font-display text-[clamp(2.5rem,5.4vw,5.8rem)] font-semibold leading-[0.9] tracking-[-0.045em] text-[var(--praxis-bone)]">
              The proof is a product surface.
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-[var(--praxis-mute)]">
              Recruiters see the polished interface. Engineers can inspect the same proof object, route, and replay command underneath it.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/proof/${runId}?pack=${packId}`}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[var(--praxis-bone)] px-7 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--praxis-obsidian)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Inspect proof
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/api/proofs/${packId}`}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--praxis-line)] px-7 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Export JSON
            </Link>
          </div>
        </div>

        <div className="grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] md:grid-cols-[1.15fr_0.85fr]">
          <div className="min-h-[440px] bg-[var(--praxis-surface)] p-6">
            <div className="flex items-center justify-between border-b border-[var(--praxis-line)] pb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Canonical artifact</span>
              <CheckCircle className="h-5 w-5 text-[var(--praxis-argon)]" weight="fill" />
            </div>
            <pre className="mt-8 overflow-x-auto font-mono text-[13px] leading-8 text-[var(--praxis-mute)]">
              {code.map((line, index) => (
                <span key={line} className="block">
                  <span className="mr-5 text-[var(--praxis-faint)]">{String(index + 1).padStart(2, "0")}</span>
                  <span className={line.includes("proof_hash") || line.includes("deterministic") ? "text-[var(--praxis-argon)]" : ""}>{line}</span>
                </span>
              ))}
            </pre>
          </div>
          <div className="grid grid-flow-dense gap-px bg-[var(--praxis-line)]">
            {[
              ["Route handlers", "Next API boundaries preserve the web app contract."],
              ["Backend scoring", "FastAPI and Python services produce the decision record."],
              ["Audit trail", "Approval and proof export remain tied to the same run."],
            ].map(([title, body]) => (
              <div key={title} className="bg-[var(--praxis-obsidian)] p-6">
                <div className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--praxis-bone)]">{title}</div>
                <p className="mt-3 text-sm leading-7 text-[var(--praxis-mute)]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const simulationBranches = [
  {
    id: "vendor-delay",
    title: "Vendor delay",
    event: "Driver package approval slips 18 hours after GPO drift is detected.",
    forecast: "74%",
    confidence: "0.81",
    impact: "$52.2K",
    operator: "Shipping lead",
    response: "Pre-stage local printer mapping, hold remediation until approval, notify escalation owner.",
    proof: "timeline fork retained with deterministic replay hash",
  },
  {
    id: "policy-rollback",
    title: "Policy rollback",
    event: "Point-and-Print policy is rolled back for the affected OU only.",
    forecast: "63%",
    confidence: "0.76",
    impact: "$31.8K",
    operator: "Endpoint owner",
    response: "Approve scoped rollback, monitor recurrence, schedule root policy correction.",
    proof: "human action and rollback boundary sealed into proof object",
  },
  {
    id: "shift-surge",
    title: "Shift surge",
    event: "Second shift opens 42 more shipment labels while printer routing is degraded.",
    forecast: "82%",
    confidence: "0.84",
    impact: "$68.4K",
    operator: "Operations director",
    response: "Split label generation to backup queue, freeze noncritical print jobs, run replay diff.",
    proof: "forecast market, queue action, and replay diff linked to the run",
  },
];

function SimulationLab() {
  const [activeBranch, setActiveBranch] = useState(simulationBranches[0]);

  return (
    <section className="border-b border-[var(--praxis-line)] bg-[var(--praxis-bg)] py-24">
      <div className="mx-auto grid max-w-[1500px] grid-flow-dense gap-10 px-5 md:px-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="flex flex-col justify-between gap-10">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 border border-[var(--praxis-line)] bg-[var(--praxis-surface)] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
              <UsersThree className="h-4 w-4 text-[var(--praxis-plasma)]" />
              Scenario swarm
            </div>
            <h2 className="font-display text-[clamp(2.7rem,5.8vw,6.3rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[var(--praxis-bone)]">
              Fork the operation before it breaks.
            </h2>
            <p className="mt-6 max-w-xl text-[17px] leading-8 text-[var(--praxis-mute)]">
              Inspired by swarm simulation workflows, Praxis turns a verified incident into competing operational futures: inject an event, watch the roles react, and preserve the forecast inside the proof trail.
            </p>
          </div>
          <div className="grid grid-flow-dense gap-3">
            {simulationBranches.map((branch) => {
              const selected = branch.id === activeBranch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setActiveBranch(branch)}
                  className="grid min-h-16 grid-flow-dense grid-cols-[1fr_auto] items-center gap-4 border border-[var(--praxis-line)] px-5 text-left transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: selected ? "var(--praxis-surface-2)" : "var(--praxis-surface)",
                    color: selected ? "var(--praxis-bone)" : "var(--praxis-mute)",
                  }}
                >
                  <span className="font-display text-xl font-semibold tracking-[-0.03em]">{branch.title}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-argon)]">{branch.forecast}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] md:grid-cols-[1fr_0.85fr]">
          <div className="min-h-[520px] bg-[var(--praxis-surface)] p-7">
            <div className="flex items-center justify-between border-b border-[var(--praxis-line)] pb-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-mute)]">Director event</span>
              <ChartLineUp className="h-5 w-5 text-[var(--praxis-argon)]" />
            </div>
            <div className="mt-10 max-w-2xl font-display text-[44px] font-semibold leading-[0.95] tracking-[-0.045em] text-[var(--praxis-bone)]">
              {activeBranch.event}
            </div>
            <div className="mt-10 grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] sm:grid-cols-3">
              {[
                ["Forecast", activeBranch.forecast],
                ["Confidence", activeBranch.confidence],
                ["Value at risk", activeBranch.impact],
              ].map(([label, value_]) => (
                <div key={label} className="bg-[var(--praxis-obsidian)] p-5">
                  <div className="font-display text-[34px] font-semibold leading-none tracking-[-0.05em] text-[var(--praxis-bone)]">{value_}</div>
                  <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 border-l border-[var(--praxis-plasma)] pl-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Recommended response</div>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--praxis-bone)]">{activeBranch.response}</p>
            </div>
          </div>
          <div className="grid grid-flow-dense gap-px bg-[var(--praxis-line)]">
            {[
              ["Affected role", activeBranch.operator],
              ["Forecast artifact", "published to verified predictions"],
              ["Proof status", activeBranch.proof],
            ].map(([label, value_]) => (
              <div key={label} className="bg-[var(--praxis-obsidian)] p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">{label}</div>
                <p className="mt-5 text-[18px] leading-7 text-[var(--praxis-bone)]">{value_}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StackSignalStrip({
  events,
  priority,
  trust,
  value,
}: {
  events: number;
  priority: string;
  trust: string;
  value: string;
}) {
  const metrics = [
    ["Events", String(events)],
    ["Priority", priority],
    ["Evidence", trust],
    ["Annual value", value],
  ];

  return (
    <section className="border-b border-[var(--praxis-line)] bg-[var(--praxis-surface)] py-24">
      <div className="mx-auto max-w-[1500px] px-5 md:px-8">
        <div className="grid grid-flow-dense gap-px border border-[var(--praxis-line)] bg-[var(--praxis-line)] lg:grid-cols-[1.2fr_repeat(4,0.7fr)]">
          <div className="bg-[var(--praxis-obsidian)] p-8">
            <LockKey className="h-8 w-8 text-[var(--praxis-plasma)]" />
            <h2 className="mt-12 max-w-md font-display text-[44px] font-semibold leading-[0.92] tracking-[-0.04em] text-[var(--praxis-bone)]">
              Verification is part of the interface.
            </h2>
          </div>
          {metrics.map(([label, value_]) => (
            <div key={label} className="flex min-h-[230px] flex-col justify-end bg-[var(--praxis-obsidian)] p-8">
              <div className="font-display text-[48px] font-semibold leading-none tracking-[-0.05em] text-[var(--praxis-bone)]">{value_}</div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingSection() {
  return (
    <section className="bg-[var(--praxis-bg)] py-24">
      <div className="mx-auto grid max-w-[1500px] grid-flow-dense gap-10 px-5 md:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 className="max-w-4xl font-display text-[clamp(3rem,7vw,7.4rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[var(--praxis-bone)]">
            Built to be inspected, not just admired.
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-8 text-[var(--praxis-mute)]">
            The public demo now leads to the same workbench, proof detail, dashboard, and export paths a technical reviewer can follow.
          </p>
        </div>
        <Link
          href="https://github.com/AngelP17/Praxis"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--praxis-line)] px-7 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          Open repository
        </Link>
      </div>
    </section>
  );
}

export function PraxisLanding() {
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const { proof } = useProof(packId);
  const [modalOpen, setModalOpen] = useState(false);
  const runId = proof?.run_id ?? `fieldlab_run_${packId}`;
  const proofHash = proof?.proof_hash ?? "sha" + "256:loading";
  const events = proof?.evidence.raw_events ?? 12;
  const priority = proof ? formatPercent(proof.decision.priority_score) : "77%";
  const trust = proof ? formatPercent(proof.evidence.evidence_trust) : "83%";
  const value = proof ? formatCurrency(proof.value_case.estimated_annual_value) : "$38.5K";

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
      <ProofProtocolHero packId={packId} proof={proof} onRunPipeline={() => setModalOpen(true)} />
      <ProofPathRail packId={packId} runId={runId} />
      <ProofArtifactSpread packId={packId} runId={runId} proofHash={proofHash} />
      <SimulationLab />
      <PortfolioAnalytics initialPackId={packId} />
      <StackSignalStrip events={events} priority={priority} trust={trust} value={value} />
      <ClosingSection />
      <PipelineRunnerModal open={modalOpen} onClose={() => setModalOpen(false)} packId={packId} />
    </main>
  );
}
