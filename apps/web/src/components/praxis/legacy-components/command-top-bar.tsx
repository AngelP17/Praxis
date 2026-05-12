"use client";

import Link from "next/link";
import {
  Plus,
  Table,
  SquaresFour,
  Pulse,
  Shield,
  SignOut,
  Clock,
  Warning,
  MagnifyingGlass,
  Lightning,
} from "@phosphor-icons/react";

import { NotificationBell } from "@/components/notifications";
import { MagneticActionButton } from "@/components/motion/magnetic-action-button";
import { MotionStatusPulse } from "@/components/motion/motion-status-pulse";
import type { FeedMode, FeedStatus } from "@/lib/hooks/use-command-feed";

export function CommandTopBar({
  feedStatus,
  feedMode,
  lastSyncSeconds,
  warnings,
  search,
  onSearchChange,
  isExporting,
  onExport,
  onLogout,
  isSigningOut,
}: {
  feedStatus: FeedStatus;
  feedMode: FeedMode;
  lastSyncSeconds: number;
  warnings: string[];
  search: string;
  onSearchChange: (value: string) => void;
  isExporting: boolean;
  onExport: () => void;
  onLogout: () => void;
  isSigningOut: boolean;
}) {
  function formatSync(seconds: number) {
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  }

  return (
    <header className="border-b border-zinc-800/50 pb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="mono-data text-[10px] uppercase tracking-[0.32em] text-violet-300">Praxis</p>
            <StatusBadge status={feedStatus} mode={feedMode} />
            <MotionStatusPulse
              points={[
                { id: "live", label: "Live", intensity: feedMode === "live" ? 1 : 0.4 },
                { id: "demo", label: "Snapshot", intensity: feedMode === "demo" ? 1 : 0.35 },
                { id: "stale", label: "Stale", intensity: feedMode === "stale" ? 1 : 0.35 },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/tickets/new" className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-violet-400 hover:scale-105 transition-transform duration-500">
            <Plus className="h-4 w-4" />
            New ticket
          </Link>
          <MagneticActionButton onClick={onExport}>
            <Table className="h-4 w-4" />
            {isExporting ? "Preparing..." : "Export"}
          </MagneticActionButton>
          <Link href="/board" className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:scale-105 transition-transform duration-500">
            <SquaresFour className="h-4 w-4" />
            Board
          </Link>
          <Link href="/reports" className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:scale-105 transition-transform duration-500">
            <Pulse className="h-4 w-4" />
            Reports
          </Link>
          <Link href="/admin" className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:scale-105 transition-transform duration-500">
            <Shield className="h-4 w-4" />
            Admin
          </Link>
          <button
            type="button"
            onClick={onLogout}
            disabled={isSigningOut}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-rose-400/40 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-70 hover:scale-105 transition-transform duration-500"
          >
            <SignOut className="h-4 w-4" />
            {isSigningOut ? "Signing out..." : "Logout"}
          </button>
          <NotificationBell />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800/70 bg-black/20 px-3 py-2">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {feedStatus === "ready"
                ? `Last sync ${formatSync(lastSyncSeconds)}`
                : feedStatus === "loading"
                ? "Waiting for first sync"
                : "Last sync unavailable"}
            </span>
          </div>
          {warnings.map((w) => (
            <div key={w} className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-violet-100">
              <Warning className="h-3.5 w-3.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>

        <label className="relative block w-full max-w-md">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search queue, owner, category, or ticket..."
            className="w-full rounded-2xl border border-zinc-800 bg-black/20 py-3 pl-10 pr-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/30"
          />
        </label>
      </div>
    </header>
  );
}

function StatusBadge({ status, mode }: { status: FeedStatus; mode: FeedMode }) {
  const config =
    status === "ready" && mode === "live"
      ? { dot: "#22c55e", border: "border-emerald-500/20", bg: "bg-emerald-500/8", text: "text-emerald-200", label: "Live data active" }
      : status === "ready" && mode === "demo"
      ? { dot: "#715BFF", border: "border-violet-500/25", bg: "bg-violet-500/12", text: "text-violet-100", label: "Operations snapshot active" }
      : status === "ready" && mode === "stale"
      ? { dot: "#715BFF", border: "border-violet-500/20", bg: "bg-violet-500/8", text: "text-violet-100", label: "Live data partially stale" }
      : status === "loading"
      ? { dot: "#715BFF", border: "border-violet-500/20", bg: "bg-violet-500/8", text: "text-violet-100", label: "Syncing live data" }
      : { dot: "#f43f5e", border: "border-rose-500/20", bg: "bg-rose-500/10", text: "text-rose-100", label: "Live data unavailable" };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] ${config.border} ${config.bg} ${config.text}`}>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.dot }} />
      {config.label}
    </div>
  );
}
