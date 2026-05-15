"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const resolvedPackId = searchParams.get("pack") ?? packId;
  const { proof } = useProof(resolvedPackId);
  const [snapshot, setSnapshot] = useState<{
    objects: Array<{ object_key: string; object_type: string; display_name: string; confidence?: number }>;
    links: Array<{ source: string; target: string; relation?: string }>;
    actions: Array<{ action_type: string; display_name?: string }>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [objectsRes, linksRes, actionsRes] = await Promise.all([
          fetch("/api/ontology/objects", { cache: "no-store" }),
          fetch("/api/ontology/links", { cache: "no-store" }),
          fetch("/api/ontology/actions", { cache: "no-store" }),
        ]);
        if (!objectsRes.ok || !linksRes.ok || !actionsRes.ok) {
          throw new Error("Ontology endpoints unavailable");
        }
        const [objectsData, linksData, actionsData] = await Promise.all([
          objectsRes.json(),
          linksRes.json(),
          actionsRes.json(),
        ]);
        if (!cancelled) {
          setSnapshot({
            objects: objectsData.objects ?? [],
            links: linksData.links ?? [],
            actions: actionsData.actions ?? [],
          });
        }
      } catch {
        if (!cancelled && proof) {
          setSnapshot({
            objects: proof.evidence.sources.slice(0, proof.ontology.objects_created).map((source, index) => ({
              object_key: `${source}-${index}`,
              object_type: SOURCE_TYPE_MAP[source] ?? "Service",
              display_name: source.replace(/_/g, " "),
              confidence: proof.ontology.mapping_confidence,
            })),
            links: Array.from({ length: proof.ontology.links_created }).slice(0, 3).map((_, index) => ({
              source: `source-${index}`,
              target: `target-${index}`,
              relation: "correlates_with",
            })),
            actions: Array.from({ length: Math.min(proof.ontology.actions_available, 3) }).map((_, index) => ({
              action_type: `action_${index + 1}`,
              display_name: ["Route to mechanical", "Capture evidence", "Escalate owner"][index] ?? `Action ${index + 1}`,
            })),
          });
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [proof]);

  if (!proof || !snapshot) {
    return (
      <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
        <article className="h-64 animate-pulse border border-[var(--praxis-line)] bg-[var(--praxis-panel)] lg:col-span-8" />
        <article className="h-64 animate-pulse border border-[var(--praxis-line)] bg-[var(--praxis-panel)] lg:col-span-4" />
      </div>
    );
  }

  const nodes = snapshot.objects.map((object, i) => {
    const type = object.object_type ?? SOURCE_TYPE_MAP[object.object_key] ?? "Service";
    const Icon = iconByType[type] ?? TreeStructure;
    const linksPerObject = Math.max(1, Math.round(snapshot.links.length / Math.max(snapshot.objects.length, 1)));
    return { key: object.object_key, label: object.display_name, type, Icon, links: linksPerObject + (i % 3) * 4 };
  });

  const mappingConf = proof.ontology.mapping_confidence;
  const mappingFactors = [
    { label: "Objects", value: Math.round(mappingConf * 100) },
    { label: "Links", value: Math.min(100, Math.round((snapshot.links.length / 20) * 100)) },
    { label: "Actions", value: Math.round((snapshot.actions.length / 10) * 100) },
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
                  {node.links} links · {node.label}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex gap-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-mint)]" />
            {snapshot.objects.length} objects
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-violet)]" />
            {snapshot.links.length} links
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--praxis-bone)]" />
            {snapshot.actions.length} actions
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
