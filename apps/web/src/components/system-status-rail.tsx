"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain,
  FileText,
  Gauge,
  HardDrives,
  Pulse,
  Scan,
  Sparkle,
  Ticket,
  SquaresFour,
  Table,
  Shield,
  SignOut,
  Lightning,
} from "@phosphor-icons/react";

import { clearStoredSession } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Platform", href: "/platform", icon: Lightning },
  { label: "Command", href: "/command-center", icon: Scan },
  { label: "Decisions", href: "/decision-center", icon: Brain },
  { label: "Recommendations", href: "/recommendations", icon: Sparkle },
  { label: "Ingestion", href: "/event-ingestion", icon: Pulse },
  { label: "Board", href: "/board", icon: SquaresFour },
  { label: "Incidents", href: "/incidents", icon: Shield },
  { label: "Assets", href: "/assets", icon: HardDrives },
  { label: "Tickets", href: "/tickets/new", icon: Ticket },
  { label: "Reports", href: "/reports", icon: Table },
  { label: "Audit", href: "/audit", icon: FileText },
];

export function SystemStatusRail({ activeLabel }: { activeLabel?: string }) {
  const router = useRouter();

  const handleLogout = () => {
    clearStoredSession();
    router.replace("/login");
  };

  return (
    <aside className="ops-rail ops-shell z-20 hidden border-r border-zinc-800/50 px-2 py-4 lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-amber-300">
        <Lightning weight="fill" className="h-5 w-5" />
      </div>

      <nav className="mt-6 flex flex-1 flex-col justify-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeLabel === item.label;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                isActive
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
                  : "border-transparent text-zinc-500 hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:text-zinc-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" weight={isActive ? "fill" : "regular"} />
              <span className="ops-rail-label font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-2 pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-sm text-zinc-500 transition hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-200"
        >
          <SignOut className="h-4 w-4 shrink-0" />
          <span className="ops-rail-label font-medium">Logout</span>
        </button>
        <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-xs font-bold text-black">
          AP
        </div>
      </div>
    </aside>
  );
}
