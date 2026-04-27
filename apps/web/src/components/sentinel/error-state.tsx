"use client";

import { Warning, Pulse } from "@phosphor-icons/react";

export function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <div className="mt-6 ops-card rounded-[26px] p-6">
      <div className="flex flex-col gap-4 border-b border-zinc-800/50 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mono-data text-[10px] uppercase tracking-[0.28em] text-rose-300">Command center offline</div>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">Live data did not load</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            {message || "The live API did not return a usable response for this workspace."}
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
        >
          <Pulse className="h-4 w-4" />
          Retry live sync
        </button>
      </div>
    </div>
  );
}
