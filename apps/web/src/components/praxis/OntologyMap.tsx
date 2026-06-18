"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  TreeStructure, Lightning, Globe, Users, Factory, HardDrives,
} from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { WorkbenchShell, TopbarTitle, Pill } from "./workbench/WorkbenchShell";

const iconByType: Record<string, typeof TreeStructure> = {
  Asset: HardDrives,
  Service: Globe,
  Action: Lightning,
  ERP: Factory,
  Identity: Users,
  Ticketing: TreeStructure,
  SLO: Globe,
  Stakeholder: Users,
  Network: Globe,
};

function renderIcon(Icon: typeof TreeStructure) {
  return <Icon className="h-5 w-5" style={{ color: "var(--praxis-violet)" }} />;
}

const SOURCE_TYPE_MAP: Record<string, string> = {
  active_directory: "Identity",
  erp_shipping: "ERP",
  helpdesk: "Ticketing",
  identity_provider: "Identity",
  kubernetes: "Service",
  msp_ticketing: "Ticketing",
  network_monitor: "Network",
  observability: "SLO",
  operator_note: "Stakeholder",
  praxis: "Action",
  print_server: "Asset",
};

const TYPE_COLOR: Record<string, string> = {
  Asset: "var(--praxis-argon)",
  Service: "var(--praxis-plasma)",
  Action: "color-mix(in srgb, var(--praxis-plasma) 72%, var(--praxis-bone))",
  ERP: "var(--praxis-amber)",
  Identity: "color-mix(in srgb, var(--praxis-argon) 72%, var(--praxis-bone))",
  Ticketing: "var(--praxis-crit)",
  SLO: "var(--praxis-argon)",
  Stakeholder: "var(--praxis-bone)",
  Network: "color-mix(in srgb, var(--praxis-plasma) 62%, var(--praxis-argon))",
  default: "var(--praxis-mute)",
};

function typeColor(type: string) {
  return TYPE_COLOR[type] ?? TYPE_COLOR.default;
}

function TopologyGraph({
  sources,
  linksCreated,
  mappingConf,
  evidenceTrust,
}: {
  sources: string[];
  linksCreated: number;
  mappingConf: number;
  evidenceTrust: number;
}) {
  const W = 560;
  const H = 390;
  const CX = W / 2;
  const CY = H / 2;
  const R = sources.length <= 3 ? 120 : sources.length <= 5 ? 140 : 155;
  const NR = 26;

  const nodes = sources.map((src, i) => {
    const total = sources.length;
    const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const type = SOURCE_TYPE_MAP[src] ?? "Service";
    return {
      id: src,
      type,
      color: typeColor(type),
      label: src.replace(/_/g, "-"),
      x: CX + R * Math.cos(angle),
      y: CY + R * Math.sin(angle),
    };
  });

  // Generate edges following circular + skip-one patterns
  const edges: { a: typeof nodes[0]; b: typeof nodes[0]; conf: number }[] = [];
  let count = 0;
  // Adjacent links
  for (let i = 0; i < nodes.length && count < linksCreated; i++) {
    const j = (i + 1) % nodes.length;
    edges.push({ a: nodes[i], b: nodes[j], conf: Math.max(0.66, evidenceTrust - count * 0.04) });
    count++;
  }
  // Skip-one links
  for (let i = 0; i < nodes.length && count < linksCreated; i++) {
    const j = (i + 2) % nodes.length;
    if (i !== j && !edges.find(e => (e.a.id === nodes[i].id && e.b.id === nodes[j].id))) {
      edges.push({ a: nodes[i], b: nodes[j], conf: Math.max(0.55, evidenceTrust - 0.15) });
      count++;
    }
  }

  return (
    <div className="relative w-full select-none overflow-hidden">
      <style>{`
        @keyframes dash-in { to { stroke-dashoffset: 0; } }
        @keyframes orb-pulse { 0%,100%{opacity:.18;r:${NR + 12}px}50%{opacity:.38;r:${NR + 18}px} }
        .topo-edge { stroke-dasharray:700; stroke-dashoffset:700; animation:dash-in 1.1s cubic-bezier(.4,0,.2,1) forwards; }
        .topo-edge:nth-of-type(2){animation-delay:.18s}
        .topo-edge:nth-of-type(3){animation-delay:.34s}
        .topo-edge:nth-of-type(4){animation-delay:.48s}
        .topo-edge:nth-of-type(5){animation-delay:.6s}
        .topo-orb { animation: orb-pulse 3.2s ease-in-out infinite; }
        .topo-orb:nth-of-type(2){animation-delay:1.1s}
        .topo-orb:nth-of-type(3){animation-delay:2.2s}
      `}</style>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 390 }}
        aria-label="Ontology topology graph"
      >
        <defs>
          <pattern id="ontology-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M44 0L0 0 0 44" fill="none" stroke="rgba(241,237,223,.04)" strokeWidth="1" />
          </pattern>
          <marker id="arrow-violet" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0,7 3.5,0 7" fill="rgba(139,92,255,.55)" />
          </marker>
          <marker id="arrow-argon" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0,7 3.5,0 7" fill="rgba(62,255,168,.45)" />
          </marker>
          <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(139,92,255,.15)" />
            <stop offset="100%" stopColor="rgba(139,92,255,0)" />
          </radialGradient>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* background grid */}
        <rect width={W} height={H} fill="url(#ontology-grid)" />

        {/* center ambient glow */}
        <circle cx={CX} cy={CY} r={R + 40} fill="url(#center-glow)" />
        <circle cx={CX} cy={CY} r={R - 20} fill="none" stroke="rgba(139,92,255,.06)" strokeWidth="1" strokeDasharray="5 5" />
        <circle cx={CX} cy={CY} r={R + 10} fill="none" stroke="rgba(139,92,255,.04)" strokeWidth="1" strokeDasharray="5 5" />

        {/* hub center dot */}
        <circle cx={CX} cy={CY} r="5" fill="rgba(139,92,255,.7)" filter="url(#node-glow)" />

        {/* hub spokes (faint) */}
        {nodes.map(n => (
          <line key={`spoke-${n.id}`} x1={CX} y1={CY} x2={n.x} y2={n.y}
            stroke="rgba(241,237,223,.04)" strokeWidth="1" strokeDasharray="4 4" />
        ))}

        {/* edges */}
        {edges.map((e, i) => {
          const dx = e.b.x - e.a.x;
          const dy = e.b.y - e.a.y;
          const len = Math.hypot(dx, dy);
          const ox = dx / len, oy = dy / len;
          const x1 = e.a.x + ox * (NR + 2);
          const y1 = e.a.y + oy * (NR + 2);
          const x2 = e.b.x - ox * (NR + 6);
          const y2 = e.b.y - oy * (NR + 6);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const highConf = e.conf > 0.78;
          return (
            <g key={`edge-${i}`}>
              <line
                className={`topo-edge`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={highConf ? "rgba(139,92,255,.5)" : "rgba(62,255,168,.35)"}
                strokeWidth={highConf ? "1.8" : "1.2"}
                markerEnd={highConf ? "url(#arrow-violet)" : "url(#arrow-argon)"}
              />
              <text x={mx} y={my - 7} textAnchor="middle"
                fontSize="8.5" fontFamily="monospace"
                fill={highConf ? "rgba(139,92,255,.6)" : "rgba(62,255,168,.5)"}
                letterSpacing="0.08em">
                {e.conf.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* node glow orbs */}
        {nodes.map((n, i) => (
          <circle
            key={`orb-${n.id}`}
            cx={n.x} cy={n.y} r={NR + 12}
            fill={n.color}
            fillOpacity="0"
            className="topo-orb"
            style={{
              animationDelay: `${i * 1.05}s`,
              transformOrigin: `${n.x}px ${n.y}px`,
            }}
          />
        ))}

        {/* nodes */}
        {nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.1, type: "spring", stiffness: 220, damping: 18 }}
            style={{ originX: `${n.x}px`, originY: `${n.y}px` } as any}
          >
            {/* outer ring */}
            <circle cx={n.x} cy={n.y} r={NR + 4}
              fill="none" stroke={n.color} strokeWidth="1" strokeOpacity="0.18" />
            {/* fill */}
            <circle cx={n.x} cy={n.y} r={NR}
              fill={`${n.color}18`}
              stroke={n.color}
              strokeWidth="1.5"
              filter="url(#node-glow)"
            />
            {/* center */}
            <circle cx={n.x} cy={n.y} r="5" fill={n.color} fillOpacity="0.85" />

            {/* type badge */}
            <text
              x={n.x} y={n.y - NR - 10}
              textAnchor="middle" fontSize="8.5"
              fontFamily="monospace"
              fill={n.color}
              letterSpacing="0.12em"
            >
              {n.type.toUpperCase()}
            </text>

            {/* source label */}
            <text
              x={n.x} y={n.y + NR + 16}
              textAnchor="middle" fontSize="9"
              fontFamily="monospace"
              fill="rgba(241,237,223,.45)"
              letterSpacing="0.06em"
            >
              {n.label.length > 16 ? `${n.label.slice(0, 15)}…` : n.label}
            </text>
          </motion.g>
        ))}

        {/* center confidence */}
        <text x={CX} y={CY - 10} textAnchor="middle" fontSize="9" fontFamily="monospace"
          fill="rgba(241,237,223,.3)" letterSpacing="0.16em">CONFIDENCE</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fontSize="20" fontFamily="sans-serif"
          fontWeight="600" fill="rgba(139,92,255,.85)">{mappingConf.toFixed(2)}</text>
      </svg>
    </div>
  );
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
      <WorkbenchShell topbar={<TopbarTitle title="Ontology" subtitle="Loading graph…" />}>
        <div className="p-8"><LoadingSkeleton /></div>
      </WorkbenchShell>
    );
  }

  const nodes = snapshot.objects.map((object, i) => {
    const type = object.object_type ?? SOURCE_TYPE_MAP[object.object_key] ?? "Service";
    const Icon = iconByType[type] ?? TreeStructure;
    const linksPerObject = Math.max(1, Math.round(snapshot.links.length / Math.max(snapshot.objects.length, 1)));
    return { key: object.object_key, label: object.display_name, type, Icon, links: linksPerObject + (i % 3) * 4 };
  });

  const sources = proof.evidence.sources.slice(0, proof.ontology.objects_created);
  const mappingConf = proof.ontology.mapping_confidence;
  const objectCount = snapshot.objects.length;
  const linkCount = snapshot.links.length;
  const actionCount = snapshot.actions.length;

  const metrics = [
    { label: "Mapping conf", value: mappingConf.toFixed(2), pct: Math.round(mappingConf * 100), color: "var(--praxis-plasma)" },
    { label: "Evidence trust", value: proof.evidence.evidence_trust.toFixed(2), pct: Math.round(proof.evidence.evidence_trust * 100), color: "var(--praxis-argon)" },
    { label: "Objects", value: String(objectCount), pct: Math.min(100, Math.round((objectCount / 20) * 100)), color: "var(--praxis-violet)" },
    { label: "Links", value: String(linkCount), pct: Math.min(100, Math.round((linkCount / 20) * 100)), color: "rgba(139,92,255,.6)" },
  ];

  const topbarRight = (
    <>
      <Pill tone="argon">{objectCount} objects</Pill>
      <Pill>{linkCount} links</Pill>
      <Pill tone="default">{actionCount} actions</Pill>
    </>
  );

  return (
    <WorkbenchShell
      topbar={<TopbarTitle title="Ontology" subtitle={`${objectCount} objects · ${linkCount} links · conf ${mappingConf.toFixed(2)}`} right={topbarRight} />}
    >
      <div className="grid grid-flow-dense gap-4 p-6 lg:grid-cols-12">
        <article className="lg:col-span-8 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Object graph · topology</div>
          <div className="mt-4">
            <TopologyGraph
              sources={sources}
              linksCreated={proof.ontology.links_created}
              mappingConf={mappingConf}
              evidenceTrust={proof.evidence.evidence_trust}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--praxis-mint)]" />
              {objectCount} objects
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--praxis-violet)]" />
              {linkCount} links
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
              <span className="h-2 w-2 rounded-full bg-[var(--praxis-bone)]" />
              {actionCount} actions
            </div>
          </div>
          <div className="mt-6 grid grid-flow-dense grid-cols-2 gap-3 md:grid-cols-3">
            {nodes.map((node) => (
              <div key={node.key} className="group border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4 transition-transform duration-700 hover:scale-105">
                {renderIcon(node.Icon)}
                <div className="mt-3 font-display text-xl">{node.type === "BusinessProcess" ? "Process" : node.type}</div>
                <div className="mt-1 break-words font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                  {node.links} links · {node.label}
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="flex flex-col gap-px lg:col-span-4 border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,.98),rgba(10,10,20,.96))]">
          <div className="p-6 border-b border-[var(--praxis-line)]">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">Mapping confidence</div>
            <motion.div
              className="mt-3 font-display text-[72px] font-semibold leading-none tracking-tight"
              style={{ color: "var(--praxis-plasma)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {mappingConf.toFixed(2)}
            </motion.div>
            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
              evidence trust · {proof.evidence.evidence_trust.toFixed(2)}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-px">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                className="flex flex-col justify-center bg-[linear-gradient(180deg,rgba(19,18,31,.96),rgba(10,10,20,.94))] p-5"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">{m.label}</span>
                  <span className="font-display text-2xl font-medium" style={{ color: m.color }}>{m.value}</span>
                </div>
                <div className="mt-3 h-[3px] w-full bg-[var(--praxis-line)]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: m.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="mt-1.5 font-mono text-[9px] text-right text-[var(--praxis-mute)]">{m.pct}%</div>
              </motion.div>
            ))}
          </div>

          <div className="p-5 border-t border-[var(--praxis-line)] bg-[rgba(10,10,20,0.86)]">
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Proof hash</div>
            <div className="mt-2 break-all font-mono text-[9.5px] leading-4" style={{ color: "var(--praxis-argon)" }}>
              {proof.proof_hash}
            </div>
          </div>
        </aside>
      </div>
    </WorkbenchShell>
  );
}
