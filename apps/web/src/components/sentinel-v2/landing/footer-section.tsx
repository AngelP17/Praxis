"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function FooterSection() {
  return (
    <footer className="relative px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-700/60 bg-zinc-900/50 px-6 py-24 text-center backdrop-blur-sm sm:px-12">
          <h2 className="max-w-3xl font-display text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.1] tracking-tight text-zinc-50">
            Ready to trace every decision?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-zinc-400">
            Enter the command center to run a live incident demo, inspect the decision trace, and verify the replay hash chain.
          </p>
          <div className="mt-10">
            <Link
              href="/command-center"
              className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-amber-500 px-8 py-4 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_50px_rgba(245,158,11,0.3)]"
            >
              Enter Command Center
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-zinc-800/60 pt-8 md:flex-row">
          <div className="text-[12px] text-zinc-600">
            Aether Sentinel &middot; Operational Intelligence Platform
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[12px] text-zinc-500">
            <Link href="/dashboard" className="transition-colors hover:text-zinc-300 hover:scale-105 transition-transform duration-500">
              Dashboard
            </Link>
            <Link href="/command-center" className="transition-colors hover:text-zinc-300 hover:scale-105 transition-transform duration-500">
              Command Center
            </Link>
            <Link href="/incidents" className="transition-colors hover:text-zinc-300 hover:scale-105 transition-transform duration-500">
              Incidents
            </Link>
            <Link href="/replay/INC-4821" className="transition-colors hover:text-zinc-300 hover:scale-105 transition-transform duration-500">
              Replay
            </Link>
            <Link href="/reports" className="transition-colors hover:text-zinc-300 hover:scale-105 transition-transform duration-500">
              Audit
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
