"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  clearStoredSession,
  getAuthRedirectPath,
  isProtectedPath,
  readAccessToken,
  validateAccessToken,
} from "@/lib/auth";

function AuthLoadingShell() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 px-4 text-center text-sm text-zinc-400"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800 bg-black/40 px-5 py-4 shadow-2xl">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-500/25 border-t-amber-400" />
        <div>Checking session...</div>
      </div>
    </div>
  );
}

function AuthErrorShell({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 px-4 text-center"
      aria-live="polite"
    >
      <div className="max-w-md rounded-2xl border border-red-500/20 bg-black/60 px-6 py-5 shadow-2xl">
        <div className="text-xs uppercase tracking-[0.28em] text-red-300">
          Session verification failed
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/20"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  // DEMO MODE: auth bypassed for portfolio review
  return <>{children}</>;
}
