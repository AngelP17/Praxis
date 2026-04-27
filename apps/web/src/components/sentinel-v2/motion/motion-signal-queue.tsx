"use client";

import { motion } from "framer-motion";

export type MotionSignalItem = {
  id: string;
  title: string;
  source: string;
  priority: number;
  confidence: number;
  tone?: "critical" | "high" | "normal";
};

function toneClass(tone: MotionSignalItem["tone"], selected: boolean) {
  if (selected) return "border-amber-400/45 bg-amber-500/10";
  if (tone === "critical") return "border-rose-400/35 bg-rose-500/8";
  if (tone === "high") return "border-amber-400/28 bg-zinc-900/85";
  return "border-zinc-700/70 bg-zinc-900/75";
}

export function MotionSignalQueue({
  items,
  selectedId,
  onSelect,
}: {
  items: MotionSignalItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <motion.ul layout className="space-y-2.5">
      {items.map((item, index) => {
        const selected = item.id === selectedId;
        return (
          <motion.li
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: index * 0.035 }}
          >
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full rounded-xl border px-3.5 py-3 text-left transition ${toneClass(item.tone, selected)}`}
              aria-pressed={selected}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="mono-data text-[12px] text-zinc-100">{item.id}</span>
                <span className="mono-data text-[11px] text-amber-200">{item.priority}</span>
              </div>
              <div className="mt-1.5 line-clamp-2 text-xs leading-5 text-zinc-200">{item.title}</div>
              <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                <span className="line-clamp-1">{item.source}</span>
                <span className="mono-data">{item.confidence.toFixed(2)}</span>
              </div>
            </button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
