"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-24 pb-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(https://picsum.photos/seed/commandcenter/1920/1080)",
            filter: "grayscale(60%) contrast(120%) opacity(30%)",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(7,8,9,0.2),rgba(7,8,9,0.88))]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 text-center">
        <h1 className="font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-medium leading-[1.08] tracking-tight text-zinc-50">
          Every signal becomes a traceable decision.
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
          Aether Sentinel transforms machine telemetry, operator tickets, and infrastructure alerts into explainable priorities, routed workflows, and audit-ready replay trails.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/command-center"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-zinc-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]"
          >
            Enter Command Center
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/replay/INC-4821"
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full border border-zinc-600/80 bg-zinc-900/60 px-7 py-3.5 text-sm font-medium text-zinc-100 backdrop-blur-sm transition-all duration-300 hover:border-zinc-400 hover:bg-zinc-800/60"
          >
            View Replay
          </Link>
        </div>
      </div>
    </section>
  );
}
