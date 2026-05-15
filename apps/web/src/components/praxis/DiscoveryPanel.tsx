"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Binoculars, GitBranch, Question, Sparkle } from "@phosphor-icons/react";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { questionText } from "@/lib/praxis-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { WorkbenchShell, TopbarTitle, Pill } from "./workbench/WorkbenchShell";

const LINK_TYPES = ["EMITS_TO", "PERSISTS_TO", "CORRELATES_WITH", "ROUTES_TO", "TRIGGERS"];
const CONF_LABELS = [0.90, 0.86, 0.78, 0.71, 0.65];

function LinkFlowDiagram({
  sources,
  linksCreated,
  evidenceTrust,
}: {
  sources: string[];
  linksCreated: number;
  evidenceTrust: number;
}) {
  const W = 440;
  const H = 280;
  const nodeCount = Math.min(sources.length, 4);
  const nodeH = 46;
  const nodeW = 160;
  const gap = (H - nodeCount * nodeH) / (nodeCount + 1);

  const nodes = sources.slice(0, nodeCount).map((src, i) => ({
    id: src,
    label: src.replace(/_/g, "-"),
    y: gap + i * (nodeH + gap) + nodeH / 2,
    x: i % 2 === 0 ? 28 : W - nodeW - 28,
    side: i % 2 === 0 ? "left" : "right" as "left" | "right",
  }));

  const links: { from: typeof nodes[0]; to: typeof nodes[0]; type: string; conf: number }[] = [];
  for (let i = 0; i < nodes.length - 1 && links.length < linksCreated; i++) {
    links.push({
      from: nodes[i],
      to: nodes[i + 1],
      type: LINK_TYPES[i % LINK_TYPES.length],
      conf: Math.max(0.62, CONF_LABELS[i] ?? evidenceTrust - i * 0.04),
    });
  }

  return (
    <div className="relative w-full overflow-hidden">
      <style>{`
        @keyframes link-draw { to { stroke-dashoffset: 0; } }
        .discovery-link {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: link-draw .9s cubic-bezier(.4,0,.2,1) forwards;
        }
        .discovery-link:nth-of-type(2){animation-delay:.2s}
        .discovery-link:nth-of-type(3){animation-delay:.38s}
        .discovery-link:nth-of-type(4){animation-delay:.54s}
      `}</style>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: H }}>
        <defs>
          <marker id="disc-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <polygon points="0 0,7 3.5,0 7" fill="rgba(62,255,168,.55)" />
          </marker>
          <filter id="disc-glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* links */}
        {links.map((lk, i) => {
          const fx = lk.from.side === "left" ? lk.from.x + nodeW : lk.from.x;
          const fy = lk.from.y;
          const tx = lk.to.side === "left" ? lk.to.x : lk.to.x + nodeW;
          const ty = lk.to.y;
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2;
          const highConf = lk.conf > 0.8;
          return (
            <g key={`lk-${i}`}>
              <path
                className="discovery-link"
                d={`M${fx},${fy} C${mx},${fy} ${mx},${ty} ${tx},${ty}`}
                fill="none"
                stroke={highConf ? "rgba(62,255,168,.5)" : "rgba(139,92,255,.45)"}
                strokeWidth="1.5"
                markerEnd="url(#disc-arrow)"
              />
              <text x={mx} y={my - 8} textAnchor="middle"
                fontSize="7.5" fontFamily="monospace"
                fill={highConf ? "rgba(62,255,168,.55)" : "rgba(139,92,255,.55)"}
                letterSpacing="0.12em">
                {lk.type}
              </text>
              <text x={mx} y={my + 4} textAnchor="middle"
                fontSize="7" fontFamily="monospace"
                fill="rgba(241,237,223,.3)"
                letterSpacing="0.08em">
                conf {lk.conf.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0, x: n.side === "left" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <rect x={n.x} y={n.y - nodeH / 2} width={nodeW} height={nodeH}
              rx="3"
              fill="rgba(19,18,31,.94)"
              stroke="rgba(241,237,223,.1)"
              strokeWidth="1"
            />
            <circle cx={n.side === "left" ? n.x + nodeW : n.x} cy={n.y} r="4"
              fill="rgba(62,255,168,.7)" filter="url(#disc-glow)" />
            <text x={n.x + nodeW / 2} y={n.y - 5} textAnchor="middle"
              fontSize="10" fontFamily="monospace"
              fill="rgba(241,237,223,.85)" letterSpacing="0.06em">
              {n.label.length > 18 ? `${n.label.slice(0, 17)}…` : n.label}
            </text>
            <text x={n.x + nodeW / 2} y={n.y + 10} textAnchor="middle"
              fontSize="7.5" fontFamily="monospace"
              fill="rgba(241,237,223,.35)" letterSpacing="0.1em" textTransform="uppercase">
              OBJECT · {String(i + 1).padStart(2, "0")}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

export function DiscoveryPanel({ packId: propPackId }: { packId?: string }) {
  const searchParams = useSearchParams();
  const packId = searchParams.get("pack") ?? propPackId ?? "manufacturing-printer-gpo";
  const { proof, loading } = useProof(packId);
  const { packs } = useSolutionPacks();
  const activePack = packs.find(p => p.id === packId);

  if (loading) {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Discovery" subtitle="Loading…" />}>
        <div className="p-8"><LoadingSkeleton /></div>
      </WorkbenchShell>
    );
  }

  if (!proof) {
    return (
      <WorkbenchShell topbar={<TopbarTitle title="Discovery" subtitle="No proof data" />}>
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <Binoculars className="h-12 w-12 text-[var(--praxis-mute)]" weight="duotone" />
          <div className="font-display text-2xl font-medium">No discovery data</div>
          <p className="max-w-sm text-sm text-[var(--praxis-mute)]">Run FieldLab to discover candidate objects, inferred links, and next best questions.</p>
        </div>
      </WorkbenchShell>
    );
  }

  const sources = proof.evidence.sources;
  const linksCreated = proof.ontology.links_created;
  const questions = proof.decision.next_best_questions ?? [];
  const mappingConf = proof.ontology.mapping_confidence;
  const evidenceTrust = proof.evidence.evidence_trust;

  // Derive inferred links from sources
  const inferredLinks = sources.slice(0, Math.min(linksCreated, 4)).map((src, i) => {
    const next = sources[(i + 1) % sources.length];
    return {
      from: src.replace(/_/g, "-"),
      to: next.replace(/_/g, "-"),
      type: LINK_TYPES[i % LINK_TYPES.length],
      conf: Math.max(0.62, evidenceTrust - i * 0.04),
    };
  });

  const topbarRight = (
    <>
      <Pill tone="argon">conf {mappingConf.toFixed(2)}</Pill>
      <Pill>{proof.ontology.objects_created} objects</Pill>
    </>
  );

  return (
    <WorkbenchShell
      packName={activePack?.name ?? packId}
      topbar={<TopbarTitle title="Discovery" subtitle={`${proof.ontology.objects_created} discovered objects · ${packId}`} right={topbarRight} />}
    >
      <div className="grid h-full min-h-0 grid-rows-[1fr] overflow-auto p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_320px]">

          {/* pack summary */}
          <motion.article
            className="flex flex-col gap-5 overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,.98),rgba(10,10,20,.96))] p-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--praxis-mute)]">Recommended solution pack</div>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
                  {activePack?.name ?? packId}
                </h2>
              </div>
              <Binoculars className="h-8 w-8 shrink-0" style={{ color: "var(--praxis-plasma)" }} weight="duotone" />
            </div>

            <p className="text-sm leading-6 text-[var(--praxis-mute)]">
              Mapping confidence {mappingConf.toFixed(2)} across {proof.ontology.objects_created} discovered objects.
            </p>

            <div className="mt-auto space-y-2">
              {[
                { label: "Objects discovered", value: proof.ontology.objects_created, color: "var(--praxis-argon)" },
                { label: "Inferred links", value: linksCreated, color: "var(--praxis-plasma)" },
                { label: "Available actions", value: proof.ontology.actions_available, color: "rgba(192,132,252,1)" },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between border-t border-[var(--praxis-line)] pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">{m.label}</span>
                  <span className="font-display text-xl font-medium" style={{ color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </motion.article>

          {/* link flow diagram */}
          <motion.article
            className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,.98),rgba(10,10,20,.96))] p-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <div className="mb-4 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
              <GitBranch className="h-3.5 w-3.5" style={{ color: "var(--praxis-plasma)" }} />
              Inferred links
            </div>
            <LinkFlowDiagram sources={sources} linksCreated={linksCreated} evidenceTrust={evidenceTrust} />

            <div className="mt-4 space-y-2">
              {inferredLinks.map((lk, i) => (
                <motion.div
                  key={i}
                  className="grid items-center gap-3 border border-[var(--praxis-line)] bg-[rgba(10,10,20,.54)] px-4 py-3"
                  style={{ gridTemplateColumns: "1fr auto 1fr auto" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                >
                  <span className="truncate font-mono text-[10px] text-[var(--praxis-bone)]">{lk.from}</span>
                  <ArrowRight className="h-3 w-3 text-[var(--praxis-mute)]" />
                  <span className="truncate font-mono text-[10px] text-[var(--praxis-bone)]">{lk.to}</span>
                  <span className="font-mono text-[9.5px]" style={{ color: lk.conf > 0.8 ? "var(--praxis-argon)" : "var(--praxis-plasma)" }}>
                    {lk.conf.toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.article>

          {/* next best questions */}
          <motion.article
            className="overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,.98),rgba(10,10,20,.96))] p-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <div className="mb-4 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)]">
              <Question className="h-3.5 w-3.5" style={{ color: "rgba(192,132,252,1)" }} />
              Next best questions
            </div>

            <div className="space-y-2">
              {questions.length > 0
                ? questions.map((q, i) => (
                    <motion.div
                      key={i}
                      className="group relative overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,.54)] p-4 transition-colors hover:border-[rgba(139,92,255,.4)]"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.07 }}
                    >
                      <div className="absolute inset-y-0 left-0 w-[2px] bg-[rgba(192,132,252,.5)] opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "rgba(192,132,252,.6)" }}>
                        #{String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="mt-1.5 text-sm leading-5">{questionText(q)}</div>
                    </motion.div>
                  ))
                : (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                      <Sparkle className="h-8 w-8 text-[var(--praxis-mute)]" />
                      <span className="text-sm text-[var(--praxis-mute)]">Questions generated after FieldLab run</span>
                    </div>
                  )}
            </div>
          </motion.article>
        </div>
      </div>
    </WorkbenchShell>
  );
}
