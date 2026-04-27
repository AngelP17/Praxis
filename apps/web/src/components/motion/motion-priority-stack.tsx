"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ComponentType } from "react";

export type PriorityItem = {
  label: string;
  value: number;
  note: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
};

export function MotionPriorityStack({ items }: { items: PriorityItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="contents">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 24, delay: index * 0.08 }}
            className="ops-card rounded-[1.25rem] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="mono-data text-[11px] uppercase tracking-[0.28em] text-zinc-500">{item.label}</div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/5 bg-black/20" style={{ color: item.color }}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <motion.div
              className="mono-data mt-4 text-4xl font-bold tracking-tight text-white"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 300, damping: 24, delay: index * 0.08 + 0.1 }}
            >
              {item.value}
            </motion.div>
            <div className="mt-3 text-xs leading-6 text-zinc-500">{item.note}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
