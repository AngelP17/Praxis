"use client";

import { TreeStructure, Link as LinkIcon, Lightning, Globe, Users, Factory, HardDrives, ShieldCheck } from "@phosphor-icons/react";

interface OntologyNode {
  type: string;
  key: string;
  links: number;
  icon: typeof TreeStructure;
}

const nodes: OntologyNode[] = [
  { type: "Site", key: "georgia-plant", links: 4, icon: Globe },
  { type: "Asset", key: "printer-fleet", links: 5, icon: HardDrives },
  { type: "Incident", key: "gpo-drift-042", links: 6, icon: Lightning },
  { type: "Ticket", key: "MSP-8812", links: 3, icon: ShieldCheck },
  { type: "Vendor", key: "managed-print", links: 2, icon: Factory },
  { type: "Runbook", key: "printer-deploy", links: 3, icon: TreeStructure },
  { type: "Stakeholder", key: "ops-director", links: 4, icon: Users },
  { type: "BusinessProcess", key: "shipping-docs", links: 5, icon: LinkIcon },
];

export function OntologyMap() {
  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Object graph</div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <div
                key={node.key}
                className="group min-h-28 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 transition-transform duration-700 hover:scale-105"
              >
                <Icon className="h-6 w-6 text-[var(--praxis-mint)]" />
                <div className="mt-5 font-display text-2xl">{node.type}</div>
                <div className="mt-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                  {node.links} links · {node.key}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-mint)]" />
            8 types
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-violet)]" />
            14 links
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-bone)]" />
            5 actions
          </div>
        </div>
      </article>
      <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Mapping confidence</div>
        <div className="mt-5 font-display text-7xl text-[var(--praxis-mint)]">0.78</div>
        <div className="mt-8 space-y-4">
          {[
            { label: "schema coverage", value: 86 },
            { label: "field consistency", value: 79 },
            { label: "relationship density", value: 72 },
            { label: "source reliability", value: 65 },
            { label: "semantic match", value: 58 },
          ].map((item) => (
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
