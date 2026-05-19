"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  Brain,
  BracketsCurly,
  CirclesThreePlus,
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

import { PraxisMark } from "@/components/praxis/PraxisMark";
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
    <aside className="ops-rail relative z-20 hidden border-r border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.98))] text-[var(--praxis-bone)] backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(139,92,255,0.18),transparent_70%)]" />
      <Link href="/" className="relative flex items-center gap-[10px] px-5 py-5 transition-transform duration-700 hover:scale-[1.02]" style={{ color: "var(--praxis-bone)" }}>
        <PraxisMark size={22} />
        <span className="font-display text-[18px] font-semibold tracking-[-0.02em]">Praxis</span>
      </Link>

      <div className="px-5">
        <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.66)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">
              Workbench
            </div>
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--praxis-argon)] shadow-[0_0_14px_rgba(62,255,168,0.55)]" />
          </div>
          <div className="mt-4 font-display text-[22px] font-medium leading-[1.05] tracking-[-0.02em]">
            Field operations, proofs, and runtime posture in one rail.
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
            <BracketsCurly className="h-3.5 w-3.5 text-[var(--praxis-violet)]" />
            Verified system surfaces
          </div>
        </div>
      </div>

      <nav className="mt-5 flex flex-1 flex-col overflow-y-auto px-3 pb-2">
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
                className={`group relative mb-1 overflow-hidden border px-4 py-[12px] text-[12.5px] transition-transform duration-700 hover:translate-x-1 ${
                  isActive
                    ? "border-[var(--praxis-plasma)] bg-[linear-gradient(90deg,color-mix(in_srgb,var(--praxis-plasma)_16%,transparent),rgba(19,18,31,0.74))] text-[var(--praxis-bone)]"
                    : "border-[var(--praxis-line)] bg-[rgba(19,18,31,0.42)] text-[var(--praxis-mute)] hover:border-[var(--praxis-hairline)] hover:bg-[rgba(19,18,31,0.7)] hover:text-[var(--praxis-bone)]"
                }`}
              >
                <span
                  className="absolute inset-y-0 left-0 w-[2px] bg-[var(--praxis-plasma)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{ opacity: isActive ? 1 : undefined }}
                />
                <span className="relative flex w-full items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 shrink-0" weight={isActive ? "fill" : "regular"} />
                    <span className="ops-rail-label font-medium">{item.label}</span>
                  </span>
                  <ArrowSquareOut className={`h-3.5 w-3.5 transition-transform duration-700 ${isActive ? "text-[var(--praxis-bone)]" : "text-[var(--praxis-muted)] group-hover:translate-x-0.5 group-hover:text-[var(--praxis-bone)]"}`} />
                </span>
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto p-4 font-mono text-[10px] text-[var(--praxis-mute)]">
        <div className="border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.7)] p-4">
          <div className="flex items-center gap-[10px]">
            <span
              className="inline-block h-[26px] w-[26px] rounded-full"
              style={{ background: "linear-gradient(135deg, var(--praxis-plasma), var(--praxis-argon))" }}
            />
            <div>
              <div className="font-sans text-[12px] text-[var(--praxis-bone)]">Field Agent</div>
              <div className="tracking-[0.06em]">Forward-deployed</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
            <CirclesThreePlus className="h-3.5 w-3.5 text-[var(--praxis-argon)]" />
            Unified Praxis shell
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="group mt-4 flex w-full items-center gap-3 border border-[var(--praxis-line)] bg-[rgba(19,18,31,0.42)] px-4 py-3 text-sm text-[var(--praxis-mute)] transition-transform duration-700 hover:translate-x-1 hover:border-[var(--praxis-crit)] hover:bg-[color-mix(in_srgb,var(--praxis-crit)_12%,transparent)] hover:text-[var(--praxis-bone)]"
        >
          <SignOut className="h-4 w-4 shrink-0" />
          <span className="ops-rail-label font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
