"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowSquareOut, BracketsCurly, Stack } from "@phosphor-icons/react";
import { PraxisMark } from "@/components/praxis/PraxisMark";
import { getActiveCase, hrefWithActiveCase } from "@/lib/active-case";
import { getPackIdForScenario, SCENARIOS } from "@/lib/scenarios";

type NavLink = [label: string, href: string, match: RegExp, packAware?: boolean];

const NAV_GROUPS: Array<[group: string, links: NavLink[]]> = [
  [
    "Core Journey",
    [
      ["Overview", "/field-workbench", /^\/field-workbench/, true],
      ["Decision", "/decision-center", /^\/decision-center/, true],
      ["Proof", "/decision", /^\/decision(?!-center)/, true],
      ["Readout", "/executive-readout", /^\/executive-readout/, true],
    ],
  ],
  [
    "Portfolio",
    [
      ["Solution Packs", "/solution-packs", /^\/solution-packs/, true],
      ["Value Case", "/value-case", /^\/value-case/, true],
      ["Expansion", "/expansion-map", /^\/expansion-map/, true],
      ["Command", "/command-center", /^\/command-center/, true],
    ],
  ],
  [
    "Reference",
    [
      ["Ontology", "/ontology", /^\/ontology/, true],
      ["Ingestion", "/event-ingestion", /^\/event-ingestion/, true],
      ["Reports", "/reports", /^\/reports/],
      ["Admin", "/admin", /^\/admin/],
    ],
  ],
];

const MOBILE_DOCK: NavLink[] = [
  ["Overview", "/field-workbench", /^\/field-workbench/, true],
  ["Packs", "/solution-packs", /^\/solution-packs/, true],
  ["Decision", "/decision-center", /^\/decision-center/, true],
  ["Readout", "/executive-readout", /^\/executive-readout/, true],
];

export function WorkbenchShell({
  topbar,
  children,
  runId,
  packName,
}: {
  topbar: ReactNode;
  children: ReactNode;
  runId?: string;
  packName?: string;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCase = getActiveCase(searchParams.get("pack"), searchParams.get("scenario"), searchParams.get("ticket"));
  const switchCase = (scenarioId: string) => {
    const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? activeCase.scenario;
    const packId = getPackIdForScenario(scenario.id);
    router.push(`${pathname}?pack=${packId}&scenario=${scenario.id}&ticket=${scenario.ticketId}`);
  };
  return (
    <div className="relative grid min-h-[100dvh] grid-cols-1 grid-flow-dense overflow-hidden bg-[var(--praxis-obsidian)] text-[var(--praxis-bone)] md:grid-cols-[252px_1fr]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(139,92,255,0.14),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(62,255,168,0.08),transparent_20%),linear-gradient(180deg,rgba(19,18,31,0.18),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(241,237,223,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />

      <aside className="relative hidden h-[100dvh] min-h-0 flex-col border-r border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.98))] md:flex">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(139,92,255,0.18),transparent_70%)]" />
        <Link href="/" className="relative flex items-center gap-[10px] px-5 py-4 transition-transform duration-300 hover:scale-[1.02]" style={{ color: "var(--praxis-bone)" }}>
          <PraxisMark size={22} />
          <span className="font-display text-[18px] font-semibold tracking-[-0.02em]">Praxis</span>
        </Link>
        <div className="px-4">
          <div className="overflow-hidden border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.66)] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">
                Workbench
              </div>
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--praxis-argon)] shadow-[0_0_14px_rgba(62,255,168,0.55)]" />
            </div>
            <div className="mt-3 font-display text-[17px] font-medium leading-[1.08] tracking-[-0.02em]">
              {activeCase.scenario.label}
            </div>
            <div className="mt-3 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
              <BracketsCurly className="h-3.5 w-3.5 text-[var(--praxis-violet)]" />
              {activeCase.ticketId} / {activeCase.scenario.site}
            </div>
            <label className="mt-3 flex items-center gap-2 border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-2 py-2">
              <Stack className="h-3.5 w-3.5 text-[var(--praxis-plasma)]" />
              <select
                value={activeCase.scenarioId}
                onChange={(event) => switchCase(event.target.value)}
                className="min-w-0 flex-1 bg-transparent font-mono text-[9.5px] uppercase tracking-[0.08em] text-[var(--praxis-bone)] outline-none"
              >
                {SCENARIOS.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <nav className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-3">
          {NAV_GROUPS.map(([group, links]) => (
            <div key={group} className="flex flex-col gap-1">
              <div className="px-1 pb-1 pt-3 font-mono text-[8.5px] uppercase tracking-[0.18em] text-[var(--praxis-faint)]">
                {group}
              </div>
              {links.map(([label, href, match, packAware]) => {
                const active = match.test(pathname);
                return (
                  <Link
                    key={href}
                    href={packAware ? hrefWithActiveCase(href, activeCase) : href}
                    className="group relative flex min-h-[32px] w-full items-center overflow-hidden border px-3 py-[6px] text-[11.5px] leading-none transition-transform duration-300 hover:translate-x-1"
                    style={{
                      borderColor: active ? "var(--praxis-plasma)" : "var(--praxis-line)",
                      color: active ? "var(--praxis-bone)" : "var(--praxis-mute)",
                      background: active
                        ? "linear-gradient(90deg, color-mix(in srgb, var(--praxis-plasma) 16%, transparent), rgba(19,18,31,0.74))"
                        : "rgba(19,18,31,0.42)",
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    <span className="absolute inset-y-0 left-0 w-[2px] bg-[var(--praxis-plasma)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ opacity: active ? 1 : undefined }} />
                    <span className="relative flex items-center justify-between gap-3">
                      <span>{label}</span>
                      <ArrowSquareOut className={`h-3.5 w-3.5 transition-transform duration-700 ${active ? "text-[var(--praxis-bone)]" : "text-[var(--praxis-muted)] group-hover:translate-x-0.5 group-hover:text-[var(--praxis-bone)]"}`} />
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="shrink-0 p-3 font-mono text-[9.5px] text-[var(--praxis-mute)]">
          <div className="border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.7)] p-3">
            <div className="flex items-center gap-[10px]">
              <span
                className="inline-block h-[22px] w-[22px] rounded-full"
                style={{ background: "linear-gradient(135deg, var(--praxis-plasma), var(--praxis-argon))" }}
              />
              <div>
                <div className="font-sans text-[11.5px] text-[var(--praxis-bone)]">Demo Operator</div>
                <div className="tracking-[0.06em]">Case-linked mode</div>
              </div>
            </div>
            {(runId || packName) && (
              <div className="mt-3 border-t border-[var(--praxis-line)] pt-3">
                {runId && (
                  <div className="truncate">
                    <span className="opacity-60">run </span>
                    <span className="text-[var(--praxis-bone)]">{runId}</span>
                  </div>
                )}
                {packName && <div className="mt-1 truncate text-[var(--praxis-bone)]">{packName}</div>}
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--praxis-muted)]">
              <Stack className="h-3.5 w-3.5 text-[var(--praxis-argon)]" />
              Active case spine
            </div>
          </div>
        </div>
      </aside>

      <div className="relative flex flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b border-[var(--praxis-line)] bg-[color-mix(in_srgb,var(--praxis-surface)_78%,transparent)] px-6 backdrop-blur-xl">
          {topbar}
        </div>
        <main className="relative flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Floating Mobile Bottom Dock Nav */}
      <div className="fixed bottom-5 left-1/2 z-50 w-[92%] -translate-x-1/2 md:hidden">
        <nav
          className="ops-mobile-nav flex items-center justify-around border rounded-full px-2.5 py-2 shadow-2xl backdrop-blur-xl transition-all duration-300"
          style={{
            borderColor: "var(--praxis-line)",
            background: "rgba(19,18,31,0.88)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 16px 36px rgba(0,0,0,0.5)",
          }}
        >
          {MOBILE_DOCK.map(([label, href, match]) => {
            const active = match.test(pathname);
            return (
              <Link
                key={href}
                href={hrefWithActiveCase(href, activeCase)}
                className="flex flex-col items-center justify-center rounded-full px-3.5 py-1.5 transition-all duration-500"
                style={{
                  color: active ? "var(--praxis-argon)" : "var(--praxis-mute)",
                  background: active ? "rgba(62,255,168,0.08)" : "transparent",
                }}
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ fontWeight: active ? 500 : 400 }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function TopbarTitle({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <>
      <div className="flex min-w-0 items-baseline gap-4">
        <div className="min-w-0">
          <span className="block truncate font-display text-[24px] font-semibold tracking-[-0.02em]">{title}</span>
          {subtitle && (
            <span className="mt-1 hidden truncate font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--praxis-mute)] md:block">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-[10px]">{right}</div>
    </>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "plasma" | "argon" | "crit";
}) {
  const colorMap: Record<typeof tone, string> = {
    default: "var(--praxis-mute)",
    plasma: "var(--praxis-plasma)",
    argon: "var(--praxis-argon)",
    crit: "var(--praxis-crit)",
  };
  return (
    <span
      className="inline-flex items-center gap-[6px] border bg-[rgba(10,10,20,0.66)] px-[10px] py-[5px] font-mono text-[10.5px] uppercase tracking-[0.08em]"
      style={{ borderColor: colorMap[tone], color: colorMap[tone] }}
    >
      {children}
    </span>
  );
}

export function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 border border-[var(--praxis-plasma)] px-4 py-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] transition-transform duration-700 hover:scale-105"
      style={{
        background: "linear-gradient(135deg, var(--praxis-plasma), color-mix(in srgb, var(--praxis-plasma) 70%, var(--praxis-bone)))",
        color: "var(--praxis-obsidian)",
      }}
    >
      {children}
    </Link>
  );
}

export function GhostAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 border border-[var(--praxis-line)] bg-[rgba(10,10,20,0.54)] px-4 py-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--praxis-bone)] transition-transform duration-700 hover:scale-105"
    >
      {children}
    </Link>
  );
}
