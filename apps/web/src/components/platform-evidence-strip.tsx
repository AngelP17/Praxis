"use client";

import { FileText, Image as ImageIcon, Link as LinkIcon, Database } from "@phosphor-icons/react";

export type EvidenceItem = {
  id: string;
  type: "log" | "screenshot" | "metric" | "document" | "link";
  label: string;
  source: string;
  timestamp: string;
  url?: string;
};

export function PlatformEvidenceStrip({ items }: { items: EvidenceItem[] }) {
  function typeIcon(type: EvidenceItem["type"]) {
    switch (type) {
      case "log": return <FileText className="h-3.5 w-3.5 text-slate-400" />;
      case "screenshot": return <ImageIcon className="h-3.5 w-3.5 text-amber-400" />;
      case "metric": return <Database className="h-3.5 w-3.5 text-emerald-400" />;
      case "document": return <FileText className="h-3.5 w-3.5 text-zinc-400" />;
      case "link": return <LinkIcon className="h-3.5 w-3.5 text-amber-400" />;
    }
  }

  function typeBorder(type: EvidenceItem["type"]) {
    switch (type) {
      case "log": return "border-slate-500/15 bg-slate-500/[0.04]";
      case "screenshot": return "border-amber-500/15 bg-amber-500/[0.04]";
      case "metric": return "border-emerald-500/15 bg-emerald-500/[0.04]";
      case "document": return "border-zinc-700/40 bg-zinc-950/40";
      case "link": return "border-amber-500/15 bg-amber-500/[0.04]";
    }
  }

  return (
    <div className="legacy-card rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-zinc-800/70 pb-4">
        <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-zinc-500">Platform Evidence</div>
        <div className="mono-data text-[11px] text-zinc-600">{items.length} artifacts</div>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url || "#"}
            target={item.url ? "_blank" : undefined}
            rel={item.url ? "noopener noreferrer" : undefined}
            className={`flex min-w-[200px] flex-col gap-2 rounded-xl border p-3.5 transition hover:brightness-110 ${typeBorder(item.type)}`}
          >
            <div className="flex items-center gap-2">
              {typeIcon(item.type)}
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">{item.type}</span>
            </div>
            <div className="text-sm font-medium text-zinc-200 truncate">{item.label}</div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span className="truncate max-w-[100px]">{item.source}</span>
              <span className="mono-data shrink-0">{new Date(item.timestamp).toLocaleDateString()}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
