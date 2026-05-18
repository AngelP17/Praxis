"use client";

import { useState } from "react";
import { Graph, ArrowsOut, MagnifyingGlass } from "@phosphor-icons/react";

import { CommandShell } from "@/components/command-shell";
import { SystemStatusRail } from "@/components/system-status-rail";
import { ScenarioPicker } from "@/components/praxis/ScenarioPicker";
import { useToast } from "@/components/notifications";
import { SCENARIOS, type Scenario } from "@/lib/scenarios";

type OntologyNode = {
  id: string;
  label: string;
  type: string;
  criticality: "critical" | "high" | "medium" | "low";
  owner: string;
  x: number;
  y: number;
};

type OntologyEdge = {
  from: string;
  to: string;
  label: string;
  strength: "strong" | "medium" | "weak";
};

function buildGraph(scenario: Scenario): { nodes: OntologyNode[]; edges: OntologyEdge[] } {
  const asset: OntologyNode = {
    id: "asset",
    label: scenario.assetId.split(".").pop() ?? scenario.assetId,
    type: scenario.assetType.replace(/_/g, " "),
    criticality: scenario.severity === "critical" ? "critical" : scenario.severity === "high" ? "high" : "medium",
    owner: scenario.ownerTeam,
    x: 50,
    y: 50,
  };

  const nodes: OntologyNode[] = [asset];
  const edges: OntologyEdge[] = [];

  const positions = [
    { x: 20, y: 20 }, { x: 80, y: 20 }, { x: 15, y: 75 },
    { x: 85, y: 75 }, { x: 50, y: 88 },
  ];

  scenario.impactedSystems.slice(0, 5).forEach((sys, idx) => {
    const nodeId = `dep-${idx}`;
    nodes.push({
      id: nodeId,
      label: sys,
      type: "dependency",
      criticality: idx === 0 ? "critical" : idx === 1 ? "high" : "medium",
      owner: scenario.ownerTeam,
      x: positions[idx].x,
      y: positions[idx].y,
    });
    edges.push({
      from: "asset",
      to: nodeId,
      label: idx === 0 ? "supports" : idx === 1 ? "feeds" : "depends_on",
      strength: idx === 0 ? "strong" : idx <= 2 ? "medium" : "weak",
    });
  });

  return { nodes, edges };
}

const CRIT_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  critical: { fill: "rgba(239,68,68,0.12)", stroke: "rgba(239,68,68,0.5)", text: "#fca5a5" },
  high: { fill: "rgba(245,158,11,0.12)", stroke: "rgba(245,158,11,0.5)", text: "#fcd34d" },
  medium: { fill: "rgba(139,92,255,0.12)", stroke: "rgba(139,92,255,0.5)", text: "#c4b5fd" },
  low: { fill: "rgba(62,255,168,0.10)", stroke: "rgba(62,255,168,0.4)", text: "#6ee7b7" },
};

const EDGE_OPACITY: Record<string, number> = {
  strong: 0.8,
  medium: 0.45,
  weak: 0.2,
};

export default function OntologyPage() {
  const toast = useToast();
  const [activeScenario, setActiveScenario] = useState<Scenario>(SCENARIOS[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { nodes, edges } = buildGraph(activeScenario);

  const filteredNodes = search.trim()
    ? nodes.filter((n) => n.label.toLowerCase().includes(search.toLowerCase()) || n.type.toLowerCase().includes(search.toLowerCase()))
    : nodes;

  function handleNodeClick(nodeId: string) {
    setSelected(selected === nodeId ? null : nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      toast.info(`${node.label}`, `type: ${node.type} · criticality: ${node.criticality} · owner: ${node.owner}`);
    }
  }

  const selectedNode = nodes.find((n) => n.id === selected);

  return (
    <CommandShell>
      <SystemStatusRail activeLabel="Ontology" />
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">

          {/* Header */}
          <section className="praxis-v2-panel-enhanced p-8 sm:p-10 py-20 sm:py-24">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex-1">
                <div className="praxis-v2-eyebrow-enhanced">Operational Ontology</div>
                <h1 className="mt-4 font-semibold tracking-tight text-zinc-50" style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)", lineHeight: "1.1" }}>
                  Dependency Graph
                </h1>
                <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Operational objects, inferred links, and blast-radius relationships compiled from signals and asset data. Click a node to inspect.
                </p>
              </div>
              <ScenarioPicker activeId={activeScenario.id} onChange={(s) => { setActiveScenario(s); setSelected(null); }} />
            </div>
          </section>

          <div className="grid grid-cols-12 gap-5 grid-flow-dense">
            {/* Graph */}
            <div className="col-span-12 xl:col-span-8">
              <div className="praxis-v2-panel-enhanced h-full min-h-[480px] p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="praxis-v2-eyebrow-enhanced">
                    {activeScenario.icon} {activeScenario.label} · {nodes.length} nodes · {edges.length} edges
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-800/50 px-3 py-1.5 font-mono text-[10px] text-zinc-500 hover:text-zinc-300 transition-all duration-200"
                  >
                    <ArrowsOut size={10} />
                    Reset
                  </button>
                </div>

                {/* SVG graph */}
                <div className="relative h-[400px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50">
                  <svg viewBox="0 0 100 100" className="h-full w-full" style={{ fontFamily: "monospace" }}>
                    {/* Edges */}
                    {edges.map((edge, idx) => {
                      const fromNode = nodes.find((n) => n.id === edge.from);
                      const toNode = nodes.find((n) => n.id === edge.to);
                      if (!fromNode || !toNode) return null;
                      const mx = (fromNode.x + toNode.x) / 2;
                      const my = (fromNode.y + toNode.y) / 2;
                      const isHighlighted = selected === edge.from || selected === edge.to;
                      return (
                        <g key={`edge-${idx}`} opacity={isHighlighted ? 1 : EDGE_OPACITY[edge.strength]}>
                          <line
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke="#8B5CFF"
                            strokeWidth={isHighlighted ? "0.6" : "0.3"}
                            strokeDasharray={edge.strength === "weak" ? "1 1" : undefined}
                          />
                          <text x={mx} y={my - 1} textAnchor="middle" fill="#86819F" fontSize="2.5">
                            {edge.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {nodes.map((node) => {
                      const c = CRIT_COLORS[node.criticality];
                      const isSelected = selected === node.id;
                      const isFiltered = filteredNodes.some((n) => n.id === node.id);
                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x},${node.y})`}
                          onClick={() => handleNodeClick(node.id)}
                          style={{ cursor: "pointer" }}
                          opacity={search && !isFiltered ? 0.2 : 1}
                        >
                          <circle
                            r={node.id === "asset" ? 6 : 4.5}
                            fill={c.fill}
                            stroke={c.stroke}
                            strokeWidth={isSelected ? "1.2" : "0.6"}
                          />
                          {isSelected && (
                            <circle r={node.id === "asset" ? 8 : 6.5} fill="none" stroke={c.stroke} strokeWidth="0.4" opacity="0.4">
                              <animate attributeName="r" values={`${node.id === "asset" ? 7 : 5.5};${node.id === "asset" ? 9 : 7.5};${node.id === "asset" ? 7 : 5.5}`} dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <text
                            textAnchor="middle"
                            dy={node.id === "asset" ? "9" : "7"}
                            fill={c.text}
                            fontSize="2.8"
                            fontWeight={isSelected ? "bold" : "normal"}
                          >
                            {node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label}
                          </text>
                          <text
                            textAnchor="middle"
                            dy={node.id === "asset" ? "12" : "10"}
                            fill="#48455A"
                            fontSize="2"
                          >
                            {node.type}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Legend */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    {Object.entries(CRIT_COLORS).map(([crit, colors]) => (
                      <div key={crit} className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full" style={{ background: colors.stroke }} />
                        <span className="font-mono text-[9px] uppercase text-zinc-600">{crit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-5">
              {/* Search */}
              <div className="praxis-v2-panel-enhanced p-5">
                <div className="relative">
                  <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search nodes…"
                    className="w-full rounded-xl border border-zinc-700/70 bg-zinc-950/80 py-2 pl-8 pr-3 text-sm text-zinc-100 outline-none transition focus:border-violet-400/45"
                  />
                </div>
              </div>

              {/* Selected node detail */}
              {selectedNode ? (
                <div className="praxis-v2-panel-enhanced p-5">
                  <div className="praxis-v2-eyebrow-enhanced mb-4">Node detail</div>
                  <div className="space-y-3">
                    {[
                      { label: "Name", value: selectedNode.label },
                      { label: "Type", value: selectedNode.type },
                      { label: "Criticality", value: selectedNode.criticality },
                      { label: "Owner", value: selectedNode.owner },
                      {
                        label: "Connections",
                        value: `${edges.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id).length} edges`,
                      },
                    ].map((row) => (
                      <div key={row.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5">
                        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">{row.label}</div>
                        <div className="mt-1 text-sm font-medium text-zinc-100">{row.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600 mb-2">Connected edges</div>
                    <div className="space-y-1">
                      {edges.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id).map((e, i) => {
                        const other = nodes.find((n) => n.id === (e.from === selectedNode.id ? e.to : e.from));
                        return (
                          <div key={i} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-2.5 py-1.5">
                            <span className="font-mono text-[10px] text-violet-400">{e.label}</span>
                            <span className="font-mono text-[10px] text-zinc-500">→</span>
                            <span className="font-mono text-[10px] text-zinc-300">{other?.label ?? "?"}</span>
                            <span className={`ml-auto font-mono text-[9px] text-zinc-600`}>{e.strength}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="praxis-v2-panel-enhanced p-5">
                  <div className="praxis-v2-eyebrow-enhanced mb-4">Node list</div>
                  <div className="space-y-2">
                    {filteredNodes.map((node) => {
                      const c = CRIT_COLORS[node.criticality];
                      return (
                        <button
                          key={node.id}
                          onClick={() => handleNodeClick(node.id)}
                          className="w-full rounded-xl border border-zinc-700/60 bg-zinc-800/40 px-3 py-2.5 text-left transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/60"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: c.stroke }} />
                            <span className="text-sm font-medium text-zinc-100">{node.label}</span>
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-zinc-600">{node.type} · {node.criticality}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="praxis-v2-panel-enhanced p-5">
                <div className="praxis-v2-eyebrow-enhanced mb-3">Graph stats</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Nodes", value: nodes.length },
                    { label: "Edges", value: edges.length },
                    { label: "Critical", value: nodes.filter((n) => n.criticality === "critical").length },
                    { label: "High", value: nodes.filter((n) => n.criticality === "high").length },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">{stat.label}</div>
                      <div className="mono-data mt-1 text-base font-semibold text-zinc-100">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommandShell>
  );
}
