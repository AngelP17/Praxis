"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BracketsCurly, ChartLineUp, CheckCircle, Database, GitBranch, LockKey, ShieldCheck, UsersThree } from "@phosphor-icons/react";
import { ProofProtocolHero } from "@/components/praxis/ProofProtocolHero";
import { DemoBanner } from "@/components/praxis/DemoBanner";
import { formatCurrency, formatPercent } from "@/lib/praxis-client";
import { useProof } from "@/lib/hooks/useProof";
import { getPackIdForScenario, SCENARIOS } from "@/lib/scenarios";
import { getDemoProof } from "@/lib/praxis-demo-data";
import { getActiveCase, hrefWithActiveCase } from "@/lib/active-case";
import { ProofDownloadButton } from "@/components/praxis/ProofDownloadButton";
import { PipelineRunnerModal } from "./PipelineRunnerModal";
import { PortfolioAnalytics } from "./PortfolioAnalytics";

function ProofPathRail({ packId, runId }: { packId: string; runId: string }) {
  const activeCase = getActiveCase(packId);
  const steps = [
    {
      title: "Intake",
      body: "A plant-floor signal is shaped into the same contract used by the local FieldLab path.",
      icon: Database,
      href: hrefWithActiveCase("/event-ingestion", activeCase),
    },
    {
      title: "Score",
      body: "A deterministic decision run turns evidence trust, root cause, and value into one record.",
      icon: GitBranch,
      href: hrefWithActiveCase("/decision", activeCase),
    },
    {
      title: "Approve",
      body: "The action stays gated by a human operator before any proof object is accepted.",
      icon: ShieldCheck,
      href: hrefWithActiveCase("/decision-center", activeCase),
    },
    {
      title: "Replay",
      body: "The proof can be downloaded, diffed, and checked with the verifier command.",
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
            One selected case carries through intake, score, approval, proof, and readout without changing identities.
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
              Reviewers inspect the same proof object, route, and verifier command underneath the interface.
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
            <ProofDownloadButton packId={packId} />
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
              ["Demo contract", "Next API fallbacks preserve the web app contract."],
              ["FieldLab path", "Local FastAPI and Python services can produce the proof record."],
              ["Audit trail", "Approval and proof export stay tied to the same selected case."],
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

const simulationBranches = SCENARIOS.map((scenario) => {
  const packId = getPackIdForScenario(scenario.id);
  const proof = getDemoProof(packId);
  return {
    id: scenario.id,
    packId,
    runId: proof.run_id,
    title: scenario.label,
    event: scenario.title,
    forecast: `${scenario.priorityScore}%`,
    confidence: scenario.confidenceScore.toFixed(2),
    impact: formatCurrency(scenario.estimatedValueUsd),
    operator: scenario.ownerTeam,
    response: scenario.recommendation,
    proof: `${proof.evidence.raw_events} events · ${proof.proof_hash.slice(7, 19)} · L0 verifiable`,
    workbenchHref: `/field-workbench?pack=${packId}`,
    proofHref: `/proof/${proof.run_id}?pack=${packId}`,
  };
});

function SimulationLab() {
  const router = useRouter();
  const [activeBranch, setActiveBranch] = useState(simulationBranches[0]);
  function selectBranch(branch: typeof simulationBranches[number]) {
    setActiveBranch(branch);
    router.replace(`/?pack=${branch.packId}&scenario=${branch.id}`);
  }

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
              Praxis uses the generated scenario registry to show four different operational failures, each tied to its matching FieldLab proof artifact.
            </p>
          </div>
          <div className="grid grid-flow-dense gap-3">
            {simulationBranches.map((branch) => {
              const selected = branch.id === activeBranch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => selectBranch(branch)}
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
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={activeBranch.workbenchHref}
                className="inline-flex min-h-11 items-center justify-center border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Open scenario
              </Link>
              <Link
                href={activeBranch.proofHref}
                className="inline-flex min-h-11 items-center justify-center border border-[var(--praxis-line)] px-5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Inspect proof
              </Link>
            </div>
          </div>
          <div className="grid grid-flow-dense gap-px bg-[var(--praxis-line)]">
            {[
              ["Affected role", activeBranch.operator],
              ["Scenario source", `${activeBranch.id} · generated registry`],
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
            The public demo is honest about its mode: deterministic web demo, local FieldLab proof, and a separate production-hardening track.
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
  const activeCase = getActiveCase(searchParams.get("pack"), searchParams.get("scenario"), searchParams.get("ticket"));
  const packId = activeCase.packId;
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
      <DemoBanner />
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
