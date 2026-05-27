"use client";

import { useEffect, useRef, useState } from "react";
import { Shuffle, X } from "@phosphor-icons/react";
import { SEVERITY_COLORS, SEVERITY_DOT, type Scenario } from "@/lib/scenarios";
import { useScenarios } from "@/lib/hooks/useScenarios";

type Props = {
  activeId: string;
  onChange: (scenario: Scenario) => void;
};

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
      <div className="inline-flex items-center gap-2.5 rounded-full border border-zinc-600/50 bg-zinc-800/70 px-4 py-2 text-sm text-zinc-500">
        <Shuffle size={13} className="animate-pulse" />
        <span>Loading scenarios…</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2.5 rounded-full border border-zinc-600/50 bg-zinc-800/70 px-4 py-2 text-sm text-zinc-200 transition-all duration-300 hover:border-zinc-500 hover:bg-zinc-800"
      >
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[active.severity]}`} />
        <span className="font-medium">{active.icon} {active.label}</span>
        <Shuffle size={13} className="text-zinc-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[420px] rounded-2xl border border-zinc-700/70 bg-zinc-900/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Scenario · {scenarios.length} incidents · press 1-{scenarios.length}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-full text-zinc-600 transition-transform duration-300 hover:scale-105 hover:text-zinc-400"
            >
              <X size={14} />
            </button>
          </div>
          <div className="max-h-[480px] overflow-y-auto p-2">
            {scenarios.map((scenario, idx) => (
              <button
                key={scenario.id}
                onClick={() => { onChange(scenario); setOpen(false); }}
                className={`group w-full rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-zinc-800/70 ${scenario.id === activeId ? "bg-zinc-800/50 ring-1 ring-violet-500/30" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-zinc-600 mt-0.5 w-4 flex-shrink-0">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{scenario.icon}</span>
                      <span className="text-sm font-medium text-zinc-100 truncate">{scenario.label}</span>
                      <span className={`ml-auto flex-shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${SEVERITY_COLORS[scenario.severity]}`}>
                        {scenario.severity}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-zinc-500 truncate">
                      {scenario.site} · {scenario.category} · {scenario.ticketId}
                    </div>
                    <div className="mt-1 text-xs text-zinc-400 line-clamp-1">{scenario.title}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-zinc-800 px-4 py-2">
            <div className="font-mono text-[10px] text-zinc-600">
              press <kbd className="rounded border border-zinc-700 px-1">1</kbd>-<kbd className="rounded border border-zinc-700 px-1">{scenarios.length}</kbd> to switch · <kbd className="rounded border border-zinc-700 px-1">esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
