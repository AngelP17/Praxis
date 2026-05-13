"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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

function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g fill="currentColor">
        <polygon points="43,50 44.23,4.02 50,50" opacity="0.96" />
        <polygon points="50,50 44.23,4.02 56.77,48.78" opacity="0.48" />
        <polygon points="44.86,44.86 83.72,16.72 50,50" opacity="0.96" />
        <polygon points="50,50 83.72,16.72 55.14,55.14" opacity="0.5" />
        <polygon points="51.04,44.09 78.19,60.26 50,50" opacity="0.96" />
        <polygon points="50,50 78.19,60.26 48.96,55.91" opacity="0.48" />
        <polygon points="56.93,49.02 10.61,55.57 50,50" opacity="0.96" />
        <polygon points="50,50 10.61,55.57 43.07,50.98" opacity="0.5" />
        <polygon points="54.46,54.01 20.35,72.86 50,50" opacity="0.96" />
        <polygon points="50,50 20.35,72.86 45.54,45.99" opacity="0.5" />
        <polygon points="48.06,56.72 86.05,65.08 50,50" opacity="0.96" />
        <polygon points="50,50 86.05,65.08 51.94,43.28" opacity="0.48" />
      </g>
    </svg>
  );
}

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
  return (
    <div className="grid min-h-[100dvh] grid-cols-1 grid-flow-dense bg-[var(--praxis-obsidian)] text-[var(--praxis-bone)] md:grid-cols-[224px_1fr]">
      <aside className="hidden flex-col border-r border-[var(--praxis-line)] bg-[var(--praxis-surface)] md:flex">
        <Link href="/" className="flex items-center gap-[10px] px-5 py-5 transition-transform hover:scale-105" style={{ color: "var(--praxis-bone)" }}>
          <Mark size={22} />
          <span className="font-display text-[18px] font-semibold tracking-[-0.02em]">Praxis</span>
        </Link>
        <div className="px-5 pb-[10px] pt-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">
          Workbench
        </div>
        <nav className="flex flex-col">
          {NAV.map(([label, href, match]) => {
            const active = match.test(pathname);
            return (
              <Link
                key={href}
                href={href}
                className="border-l-2 px-5 py-[9px] text-[12.5px] transition-transform hover:translate-x-1"
                style={{
                  borderColor: active ? "var(--praxis-plasma)" : "transparent",
                  color: active ? "var(--praxis-bone)" : "var(--praxis-mute)",
                  background: active ? "color-mix(in srgb, var(--praxis-plasma) 10%, transparent)" : "transparent",
                  fontWeight: active ? 500 : 400,
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-[var(--praxis-line)] p-4 font-mono text-[10px] text-[var(--praxis-mute)]">
          <div className="flex items-center gap-[10px]">
            <span
              className="inline-block h-[26px] w-[26px] rounded-full"
              style={{ background: "linear-gradient(135deg, var(--praxis-plasma), var(--praxis-argon))" }}
            />
            <div>
              <div className="font-sans text-[12px] text-[var(--praxis-bone)]">Ava Chen</div>
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
        </div>
      </aside>

      <div className="flex flex-col overflow-hidden">
        <div className="flex h-14 items-center justify-between border-b border-[var(--praxis-line)] px-6">
          {topbar}
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
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
      <div className="flex items-baseline gap-4 min-w-0">
        <span className="truncate font-display text-[22px] font-semibold tracking-[-0.015em]">{title}</span>
        {subtitle && (
          <span className="hidden truncate font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--praxis-mute)] md:block">
            {subtitle}
          </span>
        )}
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
      className="inline-flex items-center gap-[6px] border px-[10px] py-[4px] font-mono text-[10.5px] uppercase tracking-[0.06em]"
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
      className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] transition-transform hover:scale-105"
      style={{ background: "var(--praxis-plasma)", color: "var(--praxis-obsidian)" }}
    >
      {children}
    </Link>
  );
}

export function GhostAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 border border-[var(--praxis-line)] px-4 py-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--praxis-bone)] transition-transform hover:scale-105"
    >
      {children}
    </Link>
  );
}
