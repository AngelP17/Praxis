"use client";

import { TreeStructure, Link as LinkIcon, Lightning, Globe, Users, Factory, HardDrives, ShieldCheck } from "@phosphor-icons/react";
import { getWorkflowRun } from "@/lib/praxis-workflow";

interface OntologyNode {
  type: string;
  key: string;
  links: number;
  icon: typeof TreeStructure;
}

const iconByType: Record<string, typeof TreeStructure> = {
  Action: Lightning,
  Asset: HardDrives,
  BusinessProcess: LinkIcon,
  ERPModule: Factory,
  GitOpsBranch: TreeStructure,
  IdentityProvider: ShieldCheck,
  Incident: Lightning,
  IngressRule: LinkIcon,
  Region: Globe,
  Runbook: TreeStructure,
  Service: HardDrives,
  Site: Globe,
  SLO: ShieldCheck,
  Stakeholder: Users,
  Ticket: ShieldCheck,
  UserGroup: Users,
  Vendor: Factory,
};

export function OntologyMap({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const run = getWorkflowRun(packId);
  const nodes: OntologyNode[] = run.ontologyObjects.map((node) => ({
    ...node,
    icon: iconByType[node.type] ?? TreeStructure,
  }));

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Object graph</div>
        <div className="mt-8 grid grid-flow-dense grid-cols-2 gap-4">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div
                key={node.key}
                className="group min-h-28 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 transition-transform duration-700 hover:scale-105"
              >
                <Icon className="h-6 w-6 text-[var(--praxis-mint)]" />
                <div className="mt-5 font-display text-2xl">{node.type === "BusinessProcess" ? "Process" : node.type}</div>
                <div className="mt-2 break-words font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                  {node.links} links · {node.key}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-mint)]" />
            {nodes.length} types
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-violet)]" />
            {run.pack.linksCreated} links
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-bone)]" />
            {Math.max(4, Math.round(run.pack.objectsCreated / 2))} actions
          </div>
        </div>
      </article>
      <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Mapping confidence</div>
        <div className="mt-5 font-display text-7xl text-[var(--praxis-mint)]">{run.pack.mappingConfidence.toFixed(2)}</div>
        <div className="mt-8 space-y-4">
          {run.mappingFactors.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex justify-between font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-2 bg-[var(--praxis-line)]">
                <div className="h-full bg-[var(--praxis-violet)]" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
