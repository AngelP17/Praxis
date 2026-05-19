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
  Graph,
  CurrencyDollar,
  ArrowsClockwise,
  Package,
  MapTrifold,
  Terminal,
  MagnifyingGlass,
} from "@phosphor-icons/react";

import { DEMO_TICKETS } from "@/lib/demo-scenario";
import { clearStoredSession } from "@/lib/auth";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge, group: "main" },
  { label: "Platform", href: "/platform", icon: Lightning, group: "main" },
  { label: "Command", href: "/command-center", icon: Scan, group: "main" },
  { label: "Decisions", href: "/decision-center", icon: Brain, group: "ops" },
  { label: "Recommendations", href: "/recommendations", icon: Sparkle, group: "ops" },
  { label: "Ingestion", href: "/event-ingestion", icon: Pulse, group: "ops" },
  { label: "Incidents", href: "/incidents", icon: Shield, group: "ops" },
  { label: "Board", href: "/board", icon: SquaresFour, group: "ops" },
  { label: "Replay", href: `/replay/${DEMO_TICKETS[0].ticket_id}`, icon: ArrowsClockwise, group: "ops" },
  { label: "Assets", href: "/assets", icon: HardDrives, group: "data" },
  { label: "Ontology", href: "/ontology", icon: Graph, group: "data" },
  { label: "Discovery", href: "/discovery", icon: MagnifyingGlass, group: "data" },
  { label: "Solution Packs", href: "/solution-packs", icon: Package, group: "data" },
  { label: "Value Case", href: "/value-case", icon: CurrencyDollar, group: "output" },
  { label: "Expansion", href: "/expansion-map", icon: MapTrifold, group: "output" },
  { label: "Reports", href: "/reports", icon: Table, group: "output" },
  { label: "Audit", href: "/audit", icon: FileText, group: "output" },
  { label: "Console", href: "/console", icon: Terminal, group: "output" },
  { label: "Tickets", href: "/tickets/new", icon: Ticket, group: "output" },
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

      <nav className="mt-4 flex flex-1 flex-col overflow-y-auto gap-0.5 pb-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeLabel === item.label;
          const showDivider = idx > 0 && navItems[idx - 1].group !== item.group;
          return (
            <div key={item.label}>
              {showDivider && (
                <div className="mx-3 my-1.5 border-t border-[var(--praxis-line)] opacity-40" />
              )}
              <Link
                href={item.href}
                className={`group relative flex items-center gap-2.5 overflow-hidden border px-3 py-2 text-[13px] transition-transform duration-700 hover:translate-x-1 ${
                  isActive
                    ? "border-[var(--praxis-plasma)] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--praxis-plasma)_16%,transparent),rgba(19,18,31,0.74))] text-[var(--praxis-bone)]"
                    : "border-[var(--praxis-line)] bg-[rgba(19,18,31,0.42)] text-[var(--praxis-mute)] hover:border-[var(--praxis-hairline)] hover:bg-[rgba(19,18,31,0.7)] hover:text-[var(--praxis-bone)]"
                }`}
              >
                <span
                  className="absolute inset-y-0 left-0 w-[2px] bg-[var(--praxis-plasma)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{ opacity: isActive ? 1 : undefined }}
                />
                <Icon className="h-3.5 w-3.5 shrink-0" weight={isActive ? "fill" : "regular"} />
                <span className="ops-rail-label font-medium">{item.label}</span>
              </Link>
            </div>
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
