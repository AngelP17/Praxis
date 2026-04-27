"use client";

import { FolderOpen } from "@phosphor-icons/react";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <FolderOpen className="h-5 w-5 text-zinc-600" />
      </div>
      <div className="mono-data mt-4 text-[11px] uppercase tracking-[0.28em] text-zinc-500">{title}</div>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">{message}</p>
    </div>
  );
}
