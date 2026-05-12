"use client";

import { motion } from "framer-motion";

export type ReplayNode = {
  id: string;
  label: string;
  state: "complete" | "active" | "pending";
};

function nodeTone(state: ReplayNode["state"]) {
  if (state === "complete") return "border-emerald-400/45 bg-emerald-500/15 text-emerald-100";
  if (state === "active") return "border-violet-400/45 bg-violet-500/15 text-violet-100";
  return "border-zinc-700/80 bg-zinc-900/75 text-zinc-300";
}

export function MotionReplayRail({ nodes }: { nodes: ReplayNode[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4">
      <div className="relative">
        <motion.div
          className="absolute left-0 right-0 top-[18px] h-px origin-left bg-violet-300/40"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        />
        <div className="relative grid grid-flow-dense grid-cols-5 gap-2">
          {nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 9 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.08 + index * 0.06 }}
              className={`rounded-xl border px-2.5 py-2.5 text-center ${nodeTone(node.state)}`}
            >
              <div className="mono-data text-[10px]">{String(index + 1).padStart(2, "0")}</div>
              <div className="mt-1 text-[11px]">{node.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
