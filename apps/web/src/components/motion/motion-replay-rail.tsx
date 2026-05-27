"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

export type RailNode = {
  id: string;
  label: string;
  href: string;
  status: "complete" | "active" | "pending";
};

export function MotionReplayRail({ nodes }: { nodes: RailNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <div ref={ref} className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
      <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500 mb-5">Replay Navigation</div>
      <div className="relative flex items-center gap-2">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-zinc-800 -translate-y-1/2" />
        {nodes.map((node, index) => {
          const isComplete = node.status === "complete";
          const isActive = node.status === "active";
          return (
            <div key={node.id} className="relative flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.1 }}
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 z-10 relative"
                style={{
                  borderColor: isComplete ? "#22c55e" : isActive ? "#715BFF" : "#3f3f46",
                  backgroundColor: isComplete ? "rgba(34,197,94,0.15)" : isActive ? "rgba(245,158,11,0.15)" : "rgba(9,9,11,0.8)",
                }}
              >
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isComplete ? "#22c55e" : isActive ? "#715BFF" : "#3f3f46" }} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 + 0.05, type: "spring", stiffness: 100, damping: 20 }}
                className="mt-3 text-center"
              >
                <Link href={node.href} className={`inline-flex items-center gap-1 text-[11px] font-medium transition hover:scale-105 transition-transform duration-500 ${isActive ? "text-violet-300" : "text-zinc-500 hover:text-zinc-300"}`}>
                  {node.label}
                  {isActive && <ArrowRight className="h-3 w-3" />}
                </Link>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
