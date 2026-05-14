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
    <aside className="ops-rail relative z-20 hidden border-r border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.98))] px-2 py-4 text-[var(--praxis-bone)] backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(139,92,255,0.18),transparent_70%)]" />
      <div className="mx-auto flex h-11 w-11 items-center justify-center border border-[var(--praxis-plasma)] bg-[color-mix(in_srgb,var(--praxis-plasma)_16%,transparent)] text-[var(--praxis-plasma)] shadow-[0_0_24px_rgba(139,92,255,0.18)]">
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
              className={`group relative overflow-hidden border px-4 py-3 text-sm transition-transform duration-700 hover:translate-x-1 ${
                isActive
                  ? "border-[var(--praxis-plasma)] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--praxis-plasma)_16%,transparent),rgba(19,18,31,0.74))] text-[var(--praxis-bone)]"
                  : "border-[var(--praxis-line)] bg-[rgba(19,18,31,0.42)] text-[var(--praxis-mute)] hover:border-[var(--praxis-hairline)] hover:bg-[rgba(19,18,31,0.7)] hover:text-[var(--praxis-bone)]"
              }`}
            >
              <span
                className="absolute inset-y-0 left-0 w-[2px] bg-[var(--praxis-plasma)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                style={{ opacity: isActive ? 1 : undefined }}
              />
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
          className="group flex w-full items-center gap-3 border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.42)] px-4 py-3 text-sm text-[var(--praxis-mute)] transition-transform duration-700 hover:translate-x-1 hover:border-[var(--praxis-crit)] hover:bg-[color-mix(in_srgb,var(--praxis-crit)_12%,transparent)] hover:text-[var(--praxis-bone)]"
        >
          <SignOut className="h-4 w-4 shrink-0" />
          <span className="ops-rail-label font-medium">Logout</span>
        </button>
        <div className="mx-auto mt-4 flex h-10 w-10 items-center justify-center border border-[var(--praxis-plasma)] bg-[linear-gradient(135deg,var(--praxis-plasma),var(--praxis-argon))] text-xs font-bold text-[var(--praxis-obsidian)]">
          AP
        </div>
      </div>
    </aside>
  );
}
