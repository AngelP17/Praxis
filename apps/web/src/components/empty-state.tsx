"use client";

import { FolderOpen } from "@phosphor-icons/react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="praxis-v2-panel flex flex-col items-center justify-center rounded-[1.4rem] border-dashed px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center border border-zinc-700/70 bg-zinc-900/70">
        <FolderOpen className="h-5 w-5 text-zinc-600" />
      </div>
      <div className="mono-data mt-4 text-[11px] uppercase tracking-[0.28em] text-zinc-400">{title}</div>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">{message}</p>
    </div>
  );
}
