"use client";

import { motion } from "framer-motion";

export function SignalMarquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const line = [...items, ...items];
  return (
    <div className={`overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-950/70 ${className}`}>
      <motion.div
        className="flex min-w-max items-center gap-8 px-4 py-2.5"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      >
        {line.map((label, index) => (
          <div key={`${label}-${index}`} className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            {label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
