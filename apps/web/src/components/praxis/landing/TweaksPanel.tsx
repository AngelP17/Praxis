"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { SlidersHorizontal, X } from "@phosphor-icons/react";

// ── Types ────────────────────────────────────────────────────────────────────

export type HeroDirection   = "centered" | "editorial" | "split";
export type SectionDensity  = "compact" | "comfy" | "spacious";
export type AccentPalette   = "plasma" | "quiet" | "amber";
export type DisplayFont     = "cabinet" | "manrope" | "mono";
export type MotionIntensity = "off" | "restrained" | "cinematic";
export type ProofEmphasis   = "lead" | "anchor" | "weave";

export interface TweaksState {
  heroDirection:   HeroDirection;
  sectionDensity:  SectionDensity;
  accentPalette:   AccentPalette;
  displayFont:     DisplayFont;
  motionIntensity: MotionIntensity;
  proofEmphasis:   ProofEmphasis;
}

const DEFAULTS: TweaksState = {
  heroDirection:   "centered",
  sectionDensity:  "comfy",
  accentPalette:   "plasma",
  displayFont:     "cabinet",
  motionIntensity: "cinematic",
  proofEmphasis:   "lead",
};

const STORAGE_KEY = "praxis-tweaks-v1";

// ── Context ──────────────────────────────────────────────────────────────────

const TweaksContext = createContext<TweaksState>(DEFAULTS);
export const useTweaks = () => useContext(TweaksContext);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<TweaksState>(DEFAULTS);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTweaks({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  // Apply CSS variables when tweaks change
  useEffect(() => {
    const root = document.documentElement;

    // Accent palette
    if (tweaks.accentPalette === "quiet") {
      root.style.setProperty("--praxis-plasma", "var(--praxis-mute)");
      root.style.removeProperty("--praxis-argon");
    } else if (tweaks.accentPalette === "amber") {
      root.style.setProperty("--praxis-plasma", "var(--praxis-amber)");
      root.style.removeProperty("--praxis-argon");
    } else {
      root.style.removeProperty("--praxis-plasma");
      root.style.removeProperty("--praxis-argon");
    }

    // Display font
    if (tweaks.displayFont === "mono") {
      root.style.setProperty("--font-display", "var(--font-mono)");
    } else if (tweaks.displayFont === "manrope") {
      root.style.setProperty("--font-display", "Manrope, system-ui, sans-serif");
    } else {
      root.style.removeProperty("--font-display");
    }

    // Motion
    root.setAttribute("data-motion", tweaks.motionIntensity);

    // Section density
    root.setAttribute("data-density", tweaks.sectionDensity);
  }, [tweaks]);

  return <TweaksContext.Provider value={tweaks}>{children}</TweaksContext.Provider>;
}

// ── Axes config ──────────────────────────────────────────────────────────────

const AXES: {
  key: keyof TweaksState;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "heroDirection",
    label: "Hero direction",
    options: [
      { value: "centered",  label: "Centered" },
      { value: "editorial", label: "Editorial" },
      { value: "split",     label: "Split" },
    ],
  },
  {
    key: "sectionDensity",
    label: "Section density",
    options: [
      { value: "compact",  label: "Compact" },
      { value: "comfy",    label: "Comfy" },
      { value: "spacious", label: "Spacious" },
    ],
  },
  {
    key: "accentPalette",
    label: "Accent palette",
    options: [
      { value: "plasma", label: "Plasma" },
      { value: "quiet",  label: "Quiet" },
      { value: "amber",  label: "+ Amber" },
    ],
  },
  {
    key: "displayFont",
    label: "Display font",
    options: [
      { value: "cabinet", label: "Cabinet" },
      { value: "manrope", label: "Manrope" },
      { value: "mono",    label: "Mono" },
    ],
  },
  {
    key: "motionIntensity",
    label: "Motion",
    options: [
      { value: "off",        label: "Off" },
      { value: "restrained", label: "Restrained" },
      { value: "cinematic",  label: "Cinematic" },
    ],
  },
  {
    key: "proofEmphasis",
    label: "Proof emphasis",
    options: [
      { value: "lead",   label: "Lead" },
      { value: "anchor", label: "Anchor" },
      { value: "weave",  label: "Weave" },
    ],
  },
];

// ── Panel UI ─────────────────────────────────────────────────────────────────

export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [tweaks, setTweaksRaw] = useState<TweaksState>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTweaksRaw({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const set = useCallback(<K extends keyof TweaksState>(key: K, value: TweaksState[K]) => {
    setTweaksRaw((prev) => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      // Update context / CSS variables immediately via DOM attribute trick
      const root = document.documentElement;
      if (key === "accentPalette") {
        if (value === "quiet") {
          root.style.setProperty("--praxis-plasma", "var(--praxis-mute)");
        } else if (value === "amber") {
          root.style.setProperty("--praxis-plasma", "var(--praxis-amber)");
        } else {
          root.style.removeProperty("--praxis-plasma");
        }
      }
      if (key === "displayFont") {
        if (value === "mono")    root.style.setProperty("--font-display", "var(--font-mono)");
        else if (value === "manrope") root.style.setProperty("--font-display", "Manrope, system-ui, sans-serif");
        else root.style.removeProperty("--font-display");
      }
      if (key === "motionIntensity") root.setAttribute("data-motion", value as string);
      if (key === "sectionDensity")  root.setAttribute("data-density", value as string);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setTweaksRaw(DEFAULTS);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    const root = document.documentElement;
    root.style.removeProperty("--praxis-plasma");
    root.style.removeProperty("--font-display");
    root.removeAttribute("data-motion");
    root.removeAttribute("data-density");
  }, []);

  return (
    <>
      {/* FAB trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open tweaks panel"
        className="fixed bottom-6 right-6 z-[990] flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105"
        style={{
          background: "var(--praxis-surface)",
          borderColor: "var(--praxis-line)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
          display: open ? "none" : "flex",
        }}
      >
        <SlidersHorizontal className="h-4 w-4" style={{ color: "var(--praxis-muted)" }} />
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-[990] w-72 overflow-hidden border"
          style={{
            background: "var(--praxis-surface)",
            borderColor: "var(--praxis-line)",
            backdropFilter: "blur(28px) saturate(160%)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
          }}
        >
          {/* header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--praxis-line)" }}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: "var(--praxis-plasma)" }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-bone)" }}>
                Tweaks
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="font-mono text-[9px] uppercase tracking-[0.12em] transition-all duration-200 hover:scale-105 hover:opacity-80"
                style={{ color: "var(--praxis-muted)" }}
              >
                reset
              </button>
              <button onClick={() => setOpen(false)} className="opacity-60 transition-all duration-200 hover:scale-110 hover:opacity-100">
                <X className="h-3.5 w-3.5" style={{ color: "var(--praxis-bone)" }} />
              </button>
            </div>
          </div>

          {/* axes */}
          <div className="divide-y" style={{ borderColor: "var(--praxis-line)" }}>
            {AXES.map((axis) => (
              <div key={axis.key} className="px-4 py-3" style={{ borderColor: "var(--praxis-line)" }}>
                <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.16em]" style={{ color: "var(--praxis-muted)" }}>
                  {axis.label}
                </div>
                <div className="flex gap-1.5">
                  {axis.options.map((opt) => {
                    const active = tweaks[axis.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => set(axis.key, opt.value as TweaksState[typeof axis.key])}
                        className="flex-1 border px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] transition-all duration-200"
                        style={{
                          borderColor: active ? "var(--praxis-plasma)" : "var(--praxis-line)",
                          background: active ? "rgba(139,92,255,0.12)" : "transparent",
                          color: active ? "var(--praxis-bone)" : "var(--praxis-muted)",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div className="border-t px-4 py-2.5" style={{ borderColor: "var(--praxis-line)" }}>
            <div className="font-mono text-[9px]" style={{ color: "var(--praxis-faint)" }}>
              settings persist across sessions
            </div>
          </div>
        </div>
      )}
    </>
  );
}
