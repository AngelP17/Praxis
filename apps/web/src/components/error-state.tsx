"use client";

import { Warning } from "@phosphor-icons/react";

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="sentinel-v2-panel flex flex-col items-center justify-center rounded-[1.4rem] border border-rose-500/15 bg-rose-500/[0.05] px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/25 bg-rose-500/12">
        <Warning className="h-5 w-5 text-rose-300" />
      </div>
      <div className="mono-data mt-4 text-[11px] uppercase tracking-[0.28em] text-rose-300">{title}</div>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-300">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
