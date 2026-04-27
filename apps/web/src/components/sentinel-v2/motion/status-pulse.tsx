"use client";

import { motion } from "framer-motion";

type StatusPulseProps = {
  mode: "live" | "demo" | "stale" | "offline";
  label: string;
};

function tone(mode: StatusPulseProps["mode"]) {
  if (mode === "live") return { dot: "bg-emerald-400", ring: "bg-emerald-400/30", text: "text-emerald-200" };
  if (mode === "demo") return { dot: "bg-amber-300", ring: "bg-amber-300/30", text: "text-amber-100" };
  if (mode === "stale") return { dot: "bg-amber-300", ring: "bg-amber-300/20", text: "text-amber-100" };
  return { dot: "bg-rose-400", ring: "bg-rose-400/25", text: "text-rose-100" };
}

export function StatusPulse({ mode, label }: StatusPulseProps) {
  const palette = tone(mode);
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-950/70 px-3 py-1.5 text-[11px] ${palette.text}`}>
      <div className="relative h-2.5 w-2.5">
        <motion.span
          className={`absolute inset-0 rounded-full ${palette.ring}`}
          animate={{ scale: [1, 1.9], opacity: [0.45, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeOut" }}
        />
        <span className={`absolute inset-0 rounded-full ${palette.dot}`} />
      </div>
      <span>{label}</span>
    </div>
  );
}
