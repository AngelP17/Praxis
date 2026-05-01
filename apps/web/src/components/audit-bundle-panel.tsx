"use client";

import { Download, FileText, ShieldCheck } from "@phosphor-icons/react";
import { motion } from "framer-motion";

export type AuditItem = {
  id: string;
  type: "event" | "decision" | "feedback" | "resolution";
  label: string;
  timestamp: string;
  hash: string;
};

export function AuditBundlePanel({
  items,
  onExport,
}: {
  items: AuditItem[];
  onExport?: () => void;
}) {
  const sorted = [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  function typeBadge(type: AuditItem["type"]) {
    switch (type) {
      case "event":
        return "bg-slate-500/10 text-slate-300 border-slate-500/20";
      case "decision":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "feedback":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "resolution":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    }
  }

  return (
    <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6 hover:scale-105 transition-transform duration-500">
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-300" />
          <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Audit Bundle</div>
        </div>
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-950/50 px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-amber-500/20 hover:text-amber-200 hover:scale-105 transition-transform duration-500"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        )}
      </div>

      <div className="mt-5 space-y-2 max-h-[400px] overflow-auto pr-1">
        {sorted.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02, type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3"
          >
            <FileText className="h-4 w-4 shrink-0 text-zinc-600" />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-zinc-200 truncate">{item.label}</div>
              <div className="mt-0.5 mono-data text-[10px] text-zinc-600 truncate">{item.hash}</div>
            </div>
            <span className={`mono-data shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${typeBadge(item.type)}`}>
              {item.type}
            </span>
            <span className="mono-data shrink-0 text-[10px] text-zinc-600">
              {new Date(item.timestamp).toLocaleDateString()}
            </span>
          </motion.div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-6 text-sm text-zinc-500">No audit records available.</div>
        )}
      </div>
    </div>
  );
}
