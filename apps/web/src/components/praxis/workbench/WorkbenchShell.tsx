"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowSquareOut, BracketsCurly, CirclesThreePlus } from "@phosphor-icons/react";
import { PraxisMark } from "@/components/praxis/PraxisMark";

const NAV: Array<[label: string, href: string, match: RegExp]> = [
  ["Overview", "/field-workbench", /^\/field-workbench/],
  ["Solution Packs", "/solution-packs", /^\/solution-packs/],
  ["FieldLab", "/fieldlab", /^\/fieldlab/],
  ["Ontology", "/ontology", /^\/ontology/],
  ["Decisions", "/decision", /^\/decision/],
  ["Discovery", "/discovery", /^\/discovery/],
  ["Value Case", "/value-case", /^\/value-case/],
  ["Expansion", "/expansion-map", /^\/expansion-map/],
  ["Readout", "/executive-readout", /^\/executive-readout/],
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
  const searchParams = useSearchParams();
  const packParam = searchParams.get("pack");
  const packSuffix = packParam ? `?pack=${packParam}` : "";
  return (
    <div className="relative grid min-h-[100dvh] grid-cols-1 grid-flow-dense overflow-hidden bg-[var(--praxis-obsidian)] text-[var(--praxis-bone)] md:grid-cols-[264px_1fr]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(139,92,255,0.14),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(62,255,168,0.08),transparent_20%),linear-gradient(180deg,rgba(19,18,31,0.18),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(241,237,223,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />

      <aside className="relative hidden flex-col border-r border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.98))] md:flex">
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
        <nav className="mt-5 flex flex-col px-3">
          {NAV.map(([label, href, match]) => {
            const active = match.test(pathname);
            return (
              <Link
                key={href}
                href={`${href}${packSuffix}`}
                className="group relative mb-1 overflow-hidden border px-4 py-[12px] text-[12.5px] transition-transform duration-700 hover:translate-x-1"
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
              <CirclesThreePlus className="h-3.5 w-3.5 text-[var(--praxis-argon)]" />
              Unified Praxis shell
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
