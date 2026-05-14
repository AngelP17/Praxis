"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type React from "react";
import {
  ArrowRight,
  CheckCircle,
  Database,
  GitBranch,
  Play,
  Stack,
} from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActionApprovalPanel } from "@/components/praxis/ActionApprovalPanel";
import { DemoBanner } from "@/components/praxis/DemoBanner";
import { PackSwitcher } from "@/components/praxis/PackSwitcher";
import { PraxisMark } from "@/components/praxis/PraxisMark";
import { ProofObjectViewer } from "@/components/praxis/ProofObjectViewer";
import { ErrorState } from "@/components/error-state";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { useFieldLabRun } from "@/lib/hooks/useFieldLabRun";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { formatCurrency, formatPercent, questionText, type PraxisProof } from "@/lib/praxis-client";

export type PraxisScreenId =
  | "overview"
  | "solution-packs"
  | "fieldlab"
  | "ontology"
  | "decision"
  | "discovery"
  | "value-case"
  | "expansion"
  | "readout";

const nav: Array<[PraxisScreenId, string, string]> = [
  ["overview", "Overview", "/field-workbench"],
  ["solution-packs", "Packs", "/solution-packs"],
  ["fieldlab", "FieldLab", "/fieldlab"],
  ["ontology", "Ontology", "/ontology"],
  ["decision", "Decision", "/decision"],
  ["value-case", "Value", "/value-case"],
  ["expansion", "Expansion", "/expansion-map"],
  ["readout", "Readout", "/executive-readout"],
];

function metricData(proof: PraxisProof | null) {
  if (!proof) return [];
  return [
    { name: "Priority", value: proof.decision.priority_score },
    { name: "Evidence", value: proof.evidence.evidence_trust },
    { name: "Confidence", value: proof.decision.confidence },
    { name: "Mapping", value: proof.ontology.mapping_confidence },
  ];
}

function proofValue(proof: PraxisProof | null) {
  return proof?.value_case.estimated_annual_value ?? 0;
}

export function PraxisExperience({ initialScreen = "overview" }: { initialScreen?: PraxisScreenId }) {
  const searchParams = useSearchParams();
  const queryPack = searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const { packs, loading: packsLoading, error: packsError, reload } = useSolutionPacks();
  const { proof, verification, loading: proofLoading, error: proofError } = useProof(queryPack);
  const fieldlab = useFieldLabRun(queryPack);
  const activeProof = fieldlab.result?.proof ?? proof;
  const activePack = packs.find((pack) => pack.id === queryPack);
  const chart = metricData(activeProof);

  if (packsLoading || proofLoading) return <main className="min-h-[100dvh] bg-[var(--praxis-bg)] p-6 pt-28 text-[var(--praxis-bone)]"><LoadingSkeleton /></main>;
  if (packsError || proofError) {
    return (
      <main className="min-h-[100dvh] bg-[var(--praxis-bg)] p-6 pt-28 text-[var(--praxis-bone)]">
        <ErrorState title="Praxis API unavailable" message={(packsError ?? proofError)?.message ?? "Could not load live Praxis data."} onRetry={reload} />
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[var(--praxis-bg)] text-[var(--praxis-bone)]">
      <DemoBanner />
      <nav className="fixed left-1/2 top-5 z-50 flex w-[min(1180px,calc(100%-32px))] -translate-x-1/2 items-center justify-between border border-[var(--praxis-line)] bg-[color-mix(in_srgb,var(--praxis-bg)_82%,transparent)] px-4 py-3 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105" style={{ color: "var(--praxis-bone)" }}>
          <PraxisMark size={22} />
          <span className="font-display text-xl font-medium">Praxis</span>
        </Link>
        <div className="hidden items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)] md:flex">
          {nav.map(([id, label, href]) => (
            <Link
              key={id}
              href={href}
              className={`transition-transform hover:scale-105 ${id === initialScreen ? "text-[var(--praxis-bone)]" : "hover:text-[var(--praxis-bone)]"}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <PackSwitcher activePackId={queryPack} variant="nav" />
      </nav>

      <section className="mx-auto grid grid-flow-dense w-[min(1180px,calc(100%-32px))] gap-8 py-32 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--praxis-violet)]">
            Live FieldLab proof system
          </div>
          <h1 className="mt-5 max-w-5xl font-display text-6xl font-medium leading-none md:text-7xl">
            Messy field signals to verified proof.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--praxis-muted)]">
            This surface is wired to the FastAPI FieldLab runtime. The displayed priority,
            ontology, action, value case, and proof hash come from the backend builder and
            verifier, not browser-generated fixtures.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={fieldlab.loading}
              onClick={() => fieldlab.runFieldLab(queryPack)}
              className="inline-flex min-h-12 items-center gap-2 bg-[var(--praxis-violet)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bg)] transition hover:scale-105 disabled:cursor-wait disabled:opacity-70"
            >
              <Play className="h-4 w-4" />
              {fieldlab.loading ? "Running FieldLab" : "Run FieldLab"}
            </button>
            <Link
              href={`/proof/${activeProof?.proof_id ?? "manufacturing-printer-gpo"}?pack=${queryPack}`}
              className="inline-flex min-h-12 items-center gap-2 border border-[var(--praxis-line)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)] transition hover:scale-105 hover:text-[var(--praxis-bone)]"
            >
              View proof
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {fieldlab.error ? <p className="mt-4 text-sm text-[var(--praxis-crit)]">{fieldlab.error.message}</p> : null}
        </div>

        <div className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--praxis-muted)]">
            Current proof hash
          </div>
          <div className="mt-4 break-all font-mono text-sm text-[var(--praxis-mint)]">
            {activeProof?.proof_hash}
          </div>
          <div className="mt-5 grid grid-flow-dense grid-cols-2 gap-3">
            <Metric label="Priority" value={formatPercent(activeProof?.decision.priority_score ?? 0)} />
            <Metric label="Evidence" value={formatPercent(activeProof?.evidence.evidence_trust ?? 0)} />
            <Metric label="Value" value={formatCurrency(proofValue(activeProof))} />
            <Metric label="Verifier" value={verification?.valid ? "PASS" : "PENDING"} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid grid-flow-dense w-[min(1180px,calc(100%-32px))] gap-5 py-24 lg:grid-cols-3">
        <Panel title="Solution Pack" icon={<Stack className="h-4 w-4" />}>
          <h2 className="text-2xl font-medium">{activePack?.name ?? queryPack}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--praxis-muted)]">{activePack?.primary_pain}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(activePack?.sources ?? activeProof?.evidence.sources ?? []).map((source) => (
              <span key={source} className="border border-[var(--praxis-line)] px-2 py-1 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">{source}</span>
            ))}
          </div>
        </Panel>

        <Panel title="Decision Engine" icon={<GitBranch className="h-4 w-4" />}>
          <h2 className="text-2xl font-medium">{activeProof?.decision.root_cause_hypothesis.replace(/_/g, " ")}</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chart}>
              <CartesianGrid stroke="var(--praxis-line)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--praxis-muted)" tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, 1]} />
              <Tooltip cursor={{ fill: "var(--praxis-panel)" }} />
              <Bar dataKey="value" fill="var(--praxis-violet)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Floci Runtime" icon={<Database className="h-4 w-4" />}>
          <div className="space-y-3">
            {(fieldlab.timeline?.events ?? [
              { event_type: "ProofBuilt", status: "verified", actor: "api", proof_impact: activeProof?.proof_hash ?? "" },
            ]).map((event) => (
              <div key={event.event_type} className="border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em]">{event.event_type}</span>
                  <CheckCircle className="h-4 w-4 text-[var(--praxis-mint)]" />
                </div>
                <div className="mt-2 truncate font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                  {event.actor} · {event.status}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mx-auto grid grid-flow-dense w-[min(1180px,calc(100%-32px))] gap-5 py-24 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <ActionApprovalPanel proof={activeProof} disabled={fieldlab.loading || !fieldlab.run} onAction={fieldlab.captureAction} />
          <Panel title="Value And Expansion" icon={<ArrowRight className="h-4 w-4" />}>
            <div className="text-4xl font-medium">{formatCurrency(proofValue(activeProof))}</div>
            <p className="mt-2 text-sm text-[var(--praxis-muted)]">{activeProof?.value_case.primary_value_driver}</p>
            <div className="mt-5 space-y-2">
              {(activeProof?.expansion ?? []).map((item) => (
                <div key={item.name} className="flex items-center justify-between border border-[var(--praxis-line)] px-3 py-2 font-mono text-[10px] uppercase">
                  <span>{item.name}</span>
                  <span className="text-[var(--praxis-mint)]">{formatPercent(item.expansion_score)}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Next Best Questions" icon={<PraxisMark size={16} />}>
            <ol className="space-y-2">
              {(activeProof?.decision.next_best_questions ?? []).map((question, index) => (
                <li key={`${questionText(question)}-${index}`} className="border border-[var(--praxis-line)] p-3 text-sm text-[var(--praxis-muted)]">
                  {questionText(question)}
                </li>
              ))}
            </ol>
          </Panel>
        </div>
        <ProofObjectViewer packId={queryPack} proof={activeProof} verification={verification} />
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">{label}</div>
      <div className="mt-2 text-2xl font-medium">{value}</div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
      <div className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
        <span className="text-[var(--praxis-violet)]">{icon}</span>
        {title}
      </div>
      {children}
    </article>
  );
}
