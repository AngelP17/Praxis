"use client";

import { useEffect, useRef, useState } from "react";
import { Shuffle, X } from "@phosphor-icons/react";
import { type Scenario } from "@/lib/scenarios";
import { useScenarios } from "@/lib/hooks/useScenarios";

type Props = {
  activeId: string;
  onChange: (scenario: Scenario) => void;
};

const SEVERITY_TONE: Record<Scenario["severity"], string> = {
  critical: "var(--praxis-crit)",
  high: "var(--praxis-plasma)",
  medium: "var(--praxis-plasma)",
  low: "var(--praxis-argon)",
};

function scenarioInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function ScenarioPicker({ activeId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scenarios, ready } = useScenarios();
  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      const idx = parseInt(e.key) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < scenarios.length && !open) {
        onChange(scenarios[idx]);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onChange, open, scenarios]);

  if (!ready) {
    return (
      <div className="inline-flex min-h-10 items-center gap-2.5 border border-[var(--praxis-line)] bg-[var(--praxis-surface)] px-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">
        <Shuffle size={13} className="animate-pulse" />
        <span>Loading scenarios…</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-10 items-center gap-2.5 border border-[var(--praxis-line)] bg-[var(--praxis-surface)] px-4 text-sm text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.01] hover:border-[var(--praxis-plasma)] active:scale-[0.99]"
      >
        <span className="h-2 w-2 shrink-0" style={{ background: SEVERITY_TONE[active.severity] }} />
        <span className="font-medium">{active.label}</span>
        <Shuffle size={13} className="text-[var(--praxis-mute)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[420px] border border-[var(--praxis-line)] bg-[var(--praxis-surface)] shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[var(--praxis-line)] px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--praxis-mute)]">
              Scenario · {scenarios.length} incidents · press 1-{scenarios.length}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center text-[var(--praxis-mute)] transition-transform duration-300 hover:scale-105 hover:text-[var(--praxis-bone)]"
            >
              <X size={14} />
            </button>
          </div>
          <div className="max-h-[480px] overflow-y-auto p-2">
            {scenarios.map((scenario, idx) => (
              <button
                key={scenario.id}
                onClick={() => { onChange(scenario); setOpen(false); }}
                className="group w-full border border-transparent px-3 py-3 text-left transition-all duration-200 hover:border-[var(--praxis-line)] hover:bg-[var(--praxis-obsidian)]"
                style={{
                  background: scenario.id === activeId ? "var(--praxis-obsidian)" : "transparent",
                  borderColor: scenario.id === activeId ? "var(--praxis-plasma)" : undefined,
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-[var(--praxis-line)] font-mono text-[10px] text-[var(--praxis-mute)]">
                    {scenarioInitials(scenario.label)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-[var(--praxis-bone)]">{scenario.label}</span>
                      <span
                        className="ml-auto shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                        style={{ borderColor: SEVERITY_TONE[scenario.severity], color: SEVERITY_TONE[scenario.severity] }}
                      >
                        {scenario.severity}
                      </span>
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] text-[var(--praxis-mute)]">
                      {scenario.site} · {scenario.category} · {scenario.ticketId}
                    </div>
                    <div className="mt-1 line-clamp-1 text-xs text-[var(--praxis-mute)]">{scenario.title}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-[var(--praxis-line)] px-4 py-2">
            <div className="font-mono text-[10px] text-[var(--praxis-mute)]">
              press <kbd className="border border-[var(--praxis-line)] px-1">1</kbd>-<kbd className="border border-[var(--praxis-line)] px-1">{scenarios.length}</kbd> to switch · <kbd className="border border-[var(--praxis-line)] px-1">esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
