"use client";

import Link from "next/link";
import { ArrowRight, ShieldChevron } from "@phosphor-icons/react/dist/ssr";
import { ProductShellPreview } from "./product-shell-preview";

export function HeroSection() {
  const proofCapsules = ["Deterministic replay", "Human reviewed", "SLO backed", "Audit export ready"];

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-[4%] top-[16%] h-px bg-gradient-to-r from-transparent via-amber-400/45 to-transparent" />
        <div className="absolute bottom-[16%] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
        <div className="absolute left-[12%] top-[28%] h-[34%] w-px bg-gradient-to-b from-transparent via-amber-400/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1580px]">
        <div className="grid grid-flow-dense items-center gap-8 lg:grid-cols-[48%_52%]">
          <section className="sentinel-v2-panel-strong p-6 sm:p-8 py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-950/75 px-3 py-1.5">
              <ShieldChevron size={14} className="text-amber-300" />
              <span className="mono-data text-[11px] uppercase tracking-[0.22em] text-zinc-200">Aether Sentinel</span>
            </div>

            <h1 className="mt-6 max-w-5xl text-[clamp(2.1rem,4.8vw,4.45rem)] font-semibold leading-[1.03] tracking-tight text-zinc-50">
              Operational decisions, replayable by design.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
              Aether Sentinel turns machine signals, tickets, and Kubernetes alerts into explainable priorities, routed workflows, human-reviewed actions, and audit-ready replay trails.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/command-center"
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:bg-amber-400"
              >
                Run Incident Demo
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/replay/INC-4821"
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-zinc-600/80 bg-zinc-900/70 px-6 py-3 text-sm font-medium text-zinc-100 backdrop-blur-sm transition-all duration-300 hover:border-zinc-400"
              >
                View Replay
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {proofCapsules.map((proof) => (
                <span
                  key={proof}
                  className="rounded-full border border-zinc-700/75 bg-zinc-900/75 px-3 py-1.5 text-xs text-zinc-200"
                >
                  {proof}
                </span>
              ))}
            </div>
          </section>

          <section className="relative py-20">
            <ProductShellPreview />
          </section>
        </div>
      </div>
    </section>
  );
}
