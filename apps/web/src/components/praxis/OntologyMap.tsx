"use client";

import {
  TreeStructure, Link as LinkIcon, Lightning, Globe, Users, Factory, HardDrives,
} from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import { PraxisMark } from "./PraxisMark";

const iconByType: Record<string, any> = {
  Action: Lightning,
  Asset: HardDrives,
  BusinessProcess: LinkIcon,
  ERPModule: Factory,
  GitOpsBranch: TreeStructure,
  IdentityProvider: PraxisMark,
  Incident: Lightning,
  IngressRule: LinkIcon,
  Region: Globe,
  Runbook: TreeStructure,
  Service: HardDrives,
  Site: Globe,
  SLO: PraxisMark,
  Stakeholder: Users,
  Ticket: PraxisMark,
  UserGroup: Users,
  Vendor: Factory,
};

const SOURCE_TYPE_MAP: Record<string, string> = {
  active_directory: "IdentityProvider",
  erp_shipping: "ERPModule",
  helpdesk: "Ticket",
  identity_provider: "IdentityProvider",
  kubernetes: "Service",
  msp_ticketing: "Ticket",
  network_monitor: "Service",
  observability: "SLO",
  operator_note: "Stakeholder",
  praxis: "Action",
  print_server: "Asset",
};

function renderIcon(Icon: any) {
  if (Icon === PraxisMark) {
    return <PraxisMark size={24} />;
  }
  return <Icon className="h-6 w-6 text-[var(--praxis-mint)]" />;
}

export function OntologyMap({ packId = "manufacturing-printer-gpo" }: { packId?: string }) {
  const { proof } = useProof(packId);

  if (!proof) {
    return (
      <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
        <article className="h-64 animate-pulse border border-[var(--praxis-line)] bg-[var(--praxis-panel)] lg:col-span-8" />
        <article className="h-64 animate-pulse border border-[var(--praxis-line)] bg-[var(--praxis-panel)] lg:col-span-4" />
      </div>
    );
  }

  const nodes = proof.evidence.sources.slice(0, proof.ontology.objects_created).map((source, i) => {
    const type = SOURCE_TYPE_MAP[source] ?? "Service";
    const Icon = iconByType[type] ?? TreeStructure;
    const linksPerObject = Math.round(proof.ontology.links_created / proof.ontology.objects_created);
    return { key: source, type, Icon, links: linksPerObject + (i % 3) * 4 };
  });

  const mappingConf = proof.ontology.mapping_confidence;
  const mappingFactors = [
    { label: "Objects", value: Math.round(mappingConf * 100) },
    { label: "Links", value: Math.min(100, Math.round((proof.ontology.links_created / 200) * 100)) },
    { label: "Actions", value: Math.round((proof.ontology.actions_available / 10) * 100) },
  ];

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Object graph</div>
        <div className="mt-8 grid grid-flow-dense grid-cols-2 gap-4">
          {nodes.map((node) => {
            return (
              <div key={node.key} className="group min-h-28 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 transition-transform duration-700 hover:scale-105">
                {renderIcon(node.Icon)}
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
            {proof.ontology.objects_created} objects
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-violet)]" />
            {proof.ontology.links_created} links
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-bone)]" />
            {proof.ontology.actions_available} actions
          </div>
        </div>
      </article>
      <article className="lg:col-span-4 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Mapping confidence</div>
        <div className="mt-5 font-display text-7xl text-[var(--praxis-mint)]">{mappingConf.toFixed(2)}</div>
        <div className="mt-8 space-y-4">
          {mappingFactors.map((item) => (
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
