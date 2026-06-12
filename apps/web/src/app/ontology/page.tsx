"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowsOut, MagnifyingGlass } from "@phosphor-icons/react";

import { ScenarioPicker } from "@/components/praxis/ScenarioPicker";
import { Pill, TopbarTitle, WorkbenchShell } from "@/components/praxis/workbench/WorkbenchShell";
import { useToast } from "@/components/notifications";
import { useScenarios } from "@/lib/hooks/useScenarios";
import { type Scenario } from "@/lib/scenarios";

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

const CRIT_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  critical: { fill: "color-mix(in srgb, var(--praxis-crit) 16%, transparent)", stroke: "var(--praxis-crit)", text: "var(--praxis-crit)" },
  high: { fill: "color-mix(in srgb, var(--praxis-plasma) 16%, transparent)", stroke: "var(--praxis-plasma)", text: "var(--praxis-plasma)" },
  medium: { fill: "color-mix(in srgb, var(--praxis-plasma) 12%, transparent)", stroke: "var(--praxis-plasma)", text: "var(--praxis-bone)" },
  low: { fill: "color-mix(in srgb, var(--praxis-argon) 12%, transparent)", stroke: "var(--praxis-argon)", text: "var(--praxis-argon)" },
};

const EDGE_OPACITY: Record<string, number> = {
  strong: 0.8,
  medium: 0.45,
  weak: 0.2,
};

export default function OntologyPage() {
  const toast = useToast();
  const { scenarios } = useScenarios();
  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [nodes, setNodes] = useState<OntologyNode[]>([]);
  const [edges, setEdges] = useState<OntologyEdge[]>([]);
  const [ontologyStatus, setOntologyStatus] = useState<"loading" | "ready" | "error">("loading");

  const fetchOntology = useCallback(async (scenario: Scenario) => {
    setOntologyStatus("loading");
    try {
      const res = await fetch(`/api/scenarios/${scenario.id}/ontology`);
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes ?? []);
        setEdges(data.edges ?? []);
        setOntologyStatus("ready");
        return;
      }
    } catch {
      // fall through to error
    }
    setOntologyStatus("error");
  }, []);

  useEffect(() => {
    void fetchOntology(activeScenario);
  }, [activeScenario, fetchOntology]);

  useEffect(() => {
    const updated = scenarios.find((scenario) => scenario.id === activeScenario.id);
    if (updated) {
      setActiveScenario(updated);
    }
  }, [activeScenario.id, scenarios]);

  function handleScenarioChange(scenario: Scenario) {
    setActiveScenario(scenario);
    setSelected(null);
  }

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

  const topbarRight = (
    <>
      <Pill tone={ontologyStatus === "ready" ? "argon" : ontologyStatus === "error" ? "crit" : "plasma"}>{ontologyStatus}</Pill>
      <Pill>{nodes.length} nodes</Pill>
      <Pill>{edges.length} edges</Pill>
    </>
  );

  return (
    <WorkbenchShell
      packName={activeScenario.label}
      topbar={
        <TopbarTitle
          title="Ontology"
          subtitle={`${activeScenario.site} · ${activeScenario.category}`}
          right={topbarRight}
        />
      }
    >
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1480px] space-y-6">

          <section className="border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] px-6 py-20 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Operational Ontology</div>
                <h1 className="mt-4 font-display font-semibold tracking-[-0.03em] text-[var(--praxis-bone)]" style={{ fontSize: "clamp(2rem, 3.5vw, 3.2rem)", lineHeight: "1.1" }}>
                  Dependency Graph
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--praxis-mute)]">
                  Operational objects, inferred links, and blast-radius relationships compiled from signals and asset data. Click a node to inspect.
                </p>
              </div>
              <ScenarioPicker activeId={activeScenario.id} onChange={handleScenarioChange} />
            </div>
          </section>

          <div className="grid grid-cols-12 gap-5 grid-flow-dense">
            {/* Graph */}
            <div className="col-span-12 xl:col-span-8">
              <div className="h-full min-h-[480px] border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
                    {activeScenario.label} · {nodes.length} nodes · {edges.length} edges
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center gap-1.5 border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)] transition-transform duration-200 hover:scale-[1.01] hover:text-[var(--praxis-bone)]"
                  >
                    <ArrowsOut size={10} />
                    Reset
                  </button>
                </div>

                {/* SVG graph */}
                <div className="relative h-[400px] overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)]">
                  {ontologyStatus === "loading" ? (
                    <div className="flex h-full items-center justify-center text-sm text-[var(--praxis-mute)]">
                      Loading ontology from backend…
                    </div>
                  ) : ontologyStatus === "error" ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-[var(--praxis-mute)]">
                      <span>Backend unavailable</span>
                      <button
                        onClick={() => void fetchOntology(activeScenario)}
                        className="border border-[var(--praxis-line)] bg-[var(--praxis-surface)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bone)] transition-transform hover:scale-[1.01]"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                  <svg viewBox="0 0 100 100" className="h-full w-full" style={{ fontFamily: "monospace" }}>
                    <defs>
                      <pattern id="ontology-dot-grid" width="6" height="6" patternUnits="userSpaceOnUse">
                        <circle cx="3" cy="3" r="0.18" fill="rgba(241,237,223,0.07)" />
                      </pattern>
                      <radialGradient id="ontology-vignette" cx="50%" cy="42%" r="68%">
                        <stop offset="0%" stopColor="rgba(139,92,255,0.07)" />
                        <stop offset="100%" stopColor="rgba(10,10,20,0)" />
                      </radialGradient>
                      <filter id="ontology-node-glow" x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur stdDeviation="1.1" />
                      </filter>
                    </defs>
                    <rect x="0" y="0" width="100" height="100" fill="url(#ontology-dot-grid)" />
                    <rect x="0" y="0" width="100" height="100" fill="url(#ontology-vignette)" />

                    {/* Edges */}
                    {edges.map((edge, idx) => {
                      const fromNode = nodes.find((n) => n.id === edge.from);
                      const toNode = nodes.find((n) => n.id === edge.to);
                      if (!fromNode || !toNode) return null;
                      const mx = (fromNode.x + toNode.x) / 2;
                      const my = (fromNode.y + toNode.y) / 2;
                      // Bow each edge slightly perpendicular to its direction for an organic read.
                      const dx = toNode.x - fromNode.x;
                      const dy = toNode.y - fromNode.y;
                      const len = Math.max(Math.hypot(dx, dy), 0.001);
                      const bow = Math.min(len * 0.12, 4);
                      const cx = mx - (dy / len) * bow;
                      const cy = my + (dx / len) * bow;
                      const isHighlighted = selected === edge.from || selected === edge.to;
                      return (
                        <g key={`edge-${idx}`} opacity={isHighlighted ? 1 : EDGE_OPACITY[edge.strength]}>
                          <path
                            d={`M ${fromNode.x} ${fromNode.y} Q ${cx} ${cy} ${toNode.x} ${toNode.y}`}
                            fill="none"
                            stroke="var(--praxis-plasma)"
                            strokeWidth={isHighlighted ? "0.55" : "0.28"}
                            strokeLinecap="round"
                            strokeDasharray={edge.strength === "weak" ? "1 1.2" : undefined}
                          />
                          <text
                            x={(mx + cx) / 2}
                            y={(my + cy) / 2 - 0.8}
                            textAnchor="middle"
                            fill="var(--praxis-mute)"
                            fontSize="2.2"
                            stroke="var(--praxis-obsidian)"
                            strokeWidth="0.7"
                            paintOrder="stroke"
                            letterSpacing="0.12"
                          >
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
                          {/* soft halo */}
                          <circle
                            r={node.id === "asset" ? 7.5 : 5.8}
                            fill={c.stroke}
                            opacity={isSelected ? 0.28 : 0.14}
                            filter="url(#ontology-node-glow)"
                          />
                          {/* outer ring */}
                          <circle
                            r={node.id === "asset" ? 6 : 4.5}
                            fill="var(--praxis-obsidian)"
                            stroke={c.stroke}
                            strokeWidth={isSelected ? "0.9" : "0.5"}
                          />
                          {/* inner disc */}
                          <circle r={node.id === "asset" ? 3.6 : 2.6} fill={c.fill} stroke={c.stroke} strokeWidth="0.25" />
                          <circle r="0.8" fill={c.stroke} />
                          {isSelected && (
                            <circle r={node.id === "asset" ? 8 : 6.5} fill="none" stroke={c.stroke} strokeWidth="0.4" opacity="0.4">
                              <animate attributeName="r" values={`${node.id === "asset" ? 7 : 5.5};${node.id === "asset" ? 9 : 7.5};${node.id === "asset" ? 7 : 5.5}`} dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )}
                          <text
                            textAnchor="middle"
                            dy={node.id === "asset" ? "9.4" : "7.4"}
                            fill={c.text}
                            fontSize="2.8"
                            fontWeight={isSelected ? "bold" : "normal"}
                            stroke="var(--praxis-obsidian)"
                            strokeWidth="0.7"
                            paintOrder="stroke"
                          >
                            {node.label.length > 14 ? node.label.slice(0, 12) + "…" : node.label}
                          </text>
                          <text
                            textAnchor="middle"
                            dy={node.id === "asset" ? "12.2" : "10.2"}
                            fill="var(--praxis-mute)"
                            fontSize="2"
                            letterSpacing="0.14"
                            stroke="var(--praxis-obsidian)"
                            strokeWidth="0.5"
                            paintOrder="stroke"
                          >
                            {node.type}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  )}

                  {/* Legend */}
                  {(ontologyStatus === "ready") && (
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                    {Object.entries(CRIT_COLORS).map(([crit, colors]) => (
                      <div key={crit} className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full" style={{ background: colors.stroke }} />
                        <span className="font-mono text-[9px] uppercase text-[var(--praxis-mute)]">{crit}</span>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-span-12 xl:col-span-4 flex flex-col gap-5">
              {/* Search */}
              <div className="border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
                <div className="relative">
                  <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--praxis-mute)]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search nodes…"
                    className="w-full border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] py-2 pl-8 pr-3 text-sm text-[var(--praxis-bone)] outline-none transition focus:border-[var(--praxis-plasma)]"
                  />
                </div>
              </div>

              {/* Selected node detail */}
              {selectedNode ? (
                <div className="border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
                  <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Node detail</div>
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
                      <div key={row.label} className="border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-3 py-2.5">
                        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{row.label}</div>
                        <div className="mt-1 text-sm font-medium text-[var(--praxis-bone)]">{row.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Connected edges</div>
                    <div className="space-y-1">
                      {edges.filter((e) => e.from === selectedNode.id || e.to === selectedNode.id).map((e, i) => {
                        const other = nodes.find((n) => n.id === (e.from === selectedNode.id ? e.to : e.from));
                        return (
                          <div key={i} className="flex items-center gap-2 border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-2.5 py-1.5">
                            <span className="font-mono text-[10px] text-[var(--praxis-plasma)]">{e.label}</span>
                            <span className="font-mono text-[10px] text-[var(--praxis-mute)]">→</span>
                            <span className="font-mono text-[10px] text-[var(--praxis-bone)]">{other?.label ?? "?"}</span>
                            <span className="ml-auto font-mono text-[9px] text-[var(--praxis-mute)]">{e.strength}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
                  <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Node list</div>
                  <div className="space-y-2">
                    {filteredNodes.map((node) => {
                      const c = CRIT_COLORS[node.criticality];
                      return (
                        <button
                          key={node.id}
                          onClick={() => handleNodeClick(node.id)}
                          className="w-full border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-3 py-2.5 text-left transition-transform duration-200 hover:scale-[1.01] hover:border-[var(--praxis-plasma)]"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 flex-shrink-0" style={{ background: c.stroke }} />
                            <span className="text-sm font-medium text-[var(--praxis-bone)]">{node.label}</span>
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-[var(--praxis-mute)]">{node.type} · {node.criticality}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-5">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">Graph stats</div>
                <div className="grid grid-flow-dense grid-cols-2 gap-2">
                  {[
                    { label: "Nodes", value: nodes.length },
                    { label: "Edges", value: edges.length },
                    { label: "Critical", value: nodes.filter((n) => n.criticality === "critical").length },
                    { label: "High", value: nodes.filter((n) => n.criticality === "high").length },
                  ].map((stat) => (
                    <div key={stat.label} className="border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-3 py-3">
                      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{stat.label}</div>
                      <div className="mt-1 font-mono text-base font-semibold text-[var(--praxis-bone)]">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkbenchShell>
  );
}
