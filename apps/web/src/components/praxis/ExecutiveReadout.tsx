"use client";

import { FileText, CheckCircle, ArrowRight, ShieldCheck, GitBranch, Rocket } from "@phosphor-icons/react";
import { getPackById } from "@/lib/praxis-api";

interface ExecutiveReadoutProps {
  packId?: string;
}

export function ExecutiveReadout({ packId = "manufacturing-printer-gpo" }: ExecutiveReadoutProps) {
  const pack = getPackById(packId);
  if (!pack) return null;

  const readoutSections = [
    {
      title: "Problem",
      icon: FileText,
      content: `Recurring ${pack.rootCause.replace(/_/g, " ")} is causing operational delays across ${pack.eventCount} detected events. Multiple systems are involved including ${pack.sources.slice(0, 3).join(", ")}.`,
    },
    {
      title: "Operational Impact",
      icon: ShieldCheck,
      content: `Evidence trust score of ${pack.evidenceTrust.toFixed(2)} with ${pack.sources.length} corroborating sources. Priority score ${pack.priorityScore.toFixed(2)} indicates high business criticality requiring human review.`,
    },
    {
      title: "What Praxis Found",
      icon: CheckCircle,
      content: `Compiled ${pack.objectsCreated} ontology objects and ${pack.linksCreated} causal links from messy operational signals. Mapping confidence: ${pack.mappingConfidence.toFixed(2)}.`,
    },
    {
      title: "Recommended Action",
      icon: Rocket,
      content: `${pack.recommendedAction.replace(/_/g, " ")} via human approval gate. Mode: HUMAN_APPROVAL. Actor: operator. Safe for FieldLab simulation before production deployment.`,
    },
    {
      title: "Expected Value",
      icon: GitBranch,
      content: `${pack.annualValue} annualized value with ${(pack.valueConfidence * 100).toFixed(0)}% confidence. Primary driver: ${pack.primaryValueDriver}.`,
    },
  ];

  return (
    <div className="grid min-h-[640px] gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">Executive readout</div>
        <h3 className="mt-8 max-w-3xl font-display text-5xl font-medium leading-[0.96] tracking-normal lg:text-6xl">
          {pack.name} costs <span className="text-[var(--praxis-mint)]">{pack.annualValue}</span> per year.
        </h3>
        <p className="mt-8 max-w-xl text-base leading-7 text-[var(--praxis-muted)]">
          Praxis found {pack.rootCause.replace(/_/g, " ")}, linked it to operational delays, and produced an approval-safe remediation path with replayable evidence.
        </p>
        <div className="mt-10 grid grid-flow-dense gap-3 md:grid-cols-3">
          {[
            `Evidence trust ${pack.evidenceTrust.toFixed(2)}`,
            `Priority ${pack.priorityScore.toFixed(2)}`,
            "Human approval required",
          ].map((item) => (
            <div key={item} className="border border-[var(--praxis-line)] p-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">
              {item}
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-6">
          {readoutSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="border-l-2 border-[var(--praxis-violet)] pl-5">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[var(--praxis-violet)]" />
                  <span className="font-display text-xl font-medium">{section.title}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--praxis-muted)]">{section.content}</p>
              </div>
            );
          })}
        </div>
      </article>

      <aside className="space-y-4">
        {[
          {
            title: "Action",
            copy: `${pack.recommendedAction.replace(/_/g, " ")}. Gated by human approval with full audit trail and replay verification.`,
          },
          {
            title: "Expansion",
            copy: `Adjacent use cases include asset governance, vendor SLA tracking, and ${pack.id === "manufacturing-printer-gpo" ? "endpoint configuration drift" : pack.id === "erp-access-disruption" ? "identity lifecycle management" : "canary deployment validation"}.`,
          },
          {
            title: "Deployment",
            copy: "Start read-only, prove in FieldLab, then enable assisted action with approval. Production writeback requires customer security review.",
          },
        ].map((item) => (
          <article key={item.title} className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-[var(--praxis-violet)]" />
              <div className="font-display text-2xl font-medium">{item.title}</div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--praxis-muted)]">{item.copy}</p>
          </article>
        ))}
      </aside>
    </div>
  );
}
