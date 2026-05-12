"use client";

import { MapTrifold, GitBranch, ArrowRight } from "@phosphor-icons/react";
import { getPackById } from "@/lib/praxis-api";

interface ExpansionMapProps {
  packId?: string;
}

interface AdjacentCase {
  label: string;
  score: number;
  rationale: string;
}

function getAdjacentCases(packId: string): AdjacentCase[] {
  const packs: Record<string, AdjacentCase[]> = {
    "manufacturing-printer-gpo": [
      { label: "asset inventory accuracy", score: 0.82, rationale: "Shared printer fleet data" },
      { label: "vendor SLA tracking", score: 0.78, rationale: "Managed print vendor overlap" },
      { label: "ticket routing", score: 0.73, rationale: "MSP ticketing integration" },
      { label: "ERP access incidents", score: 0.68, rationale: "Cross-system user impact" },
      { label: "plant downtime reporting", score: 0.66, rationale: "Operational visibility" },
      { label: "security quarantine workflow", score: 0.61, rationale: "Endpoint policy overlap" },
    ],
    "erp-access-disruption": [
      { label: "identity lifecycle management", score: 0.85, rationale: "Same IdP infrastructure" },
      { label: "role-based access reviews", score: 0.79, rationale: "Compliance automation" },
      { label: "warehouse workflow optimization", score: 0.74, rationale: "Shared fulfillment process" },
      { label: "SOX access controls", score: 0.71, rationale: "Audit trail requirements" },
      { label: "vendor onboarding", score: 0.67, rationale: "External user provisioning" },
      { label: "helpdesk automation", score: 0.63, rationale: "Ticket reduction" },
    ],
    "k8s-ingress-degradation": [
      { label: "canary deployment validation", score: 0.84, rationale: "Deployment safety" },
      { label: "cost optimization", score: 0.80, rationale: "Resource right-sizing" },
      { label: "multi-cluster routing", score: 0.76, rationale: "Global traffic management" },
      { label: "SRE runbook automation", score: 0.72, rationale: "Incident response" },
      { label: "security policy enforcement", score: 0.69, rationale: "WAF and DLP" },
      { label: "developer self-service", score: 0.65, rationale: "Platform engineering" },
    ],
  };
  return packs[packId] || packs["manufacturing-printer-gpo"];
}

export function ExpansionMap({ packId = "manufacturing-printer-gpo" }: ExpansionMapProps) {
  const pack = getPackById(packId);
  const adjacentCases = getAdjacentCases(packId);

  if (!pack) return null;

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      <article className="lg:col-span-5 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <MapTrifold className="h-10 w-10 text-[var(--praxis-violet)]" weight="duotone" />
        <h4 className="mt-10 font-display text-5xl font-medium leading-none">{pack.name}</h4>
        <p className="mt-5 text-sm leading-6 text-[var(--praxis-muted)]">
          Initial proof path for {pack.buyer.toLowerCase()} operations, {pack.technicalPersona.toLowerCase()} management, and executive value narrative.
        </p>
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Current value</span>
            <span className="font-display text-2xl text-[var(--praxis-mint)]">{pack.annualValue}</span>
          </div>
          <div className="flex items-center justify-between border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4">
            <span className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Expansion potential</span>
            <span className="font-display text-2xl text-[var(--praxis-violet)]">
              {adjacentCases.length} cases
            </span>
          </div>
        </div>
      </article>
      <article className="lg:col-span-7 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <GitBranch className="h-4 w-4" />
          Adjacent use cases
        </div>
        <div className="mt-6 space-y-3">
          {adjacentCases.map((item, index) => (
            <div
              key={item.label}
              className="group grid grid-cols-[1fr_auto] gap-4 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 transition-colors hover:border-[var(--praxis-violet)]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-[var(--praxis-violet)]">
                    #{String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="mt-1 text-xs text-[var(--praxis-muted)]">{item.rationale}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl text-[var(--praxis-mint)]">{item.score.toFixed(2)}</span>
                <ArrowRight className="h-4 w-4 text-[var(--praxis-muted)] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
