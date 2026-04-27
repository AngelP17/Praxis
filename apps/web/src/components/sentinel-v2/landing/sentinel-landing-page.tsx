import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Gauge,
  ShieldCheck,
  ShieldChevron,
  Stack,
} from "@phosphor-icons/react/dist/ssr";

import { ProductShellPreview } from "@/components/sentinel-v2/landing/product-shell-preview";

const proof = [
  { label: "Deterministic replay", icon: Stack },
  { label: "Human reviewed", icon: ShieldCheck },
  { label: "SLO backed", icon: Gauge },
  { label: "Audit export ready", icon: CheckCircle },
];

export function SentinelLandingPage() {
  return (
    <main className="sentinel-v2-root min-h-[100dvh] overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="sentinel-v2-grid" />
      <div className="sentinel-v2-noise" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1660px] items-start gap-6 lg:grid-cols-[48%_52%]">
        <section className="sentinel-v2-panel-strong min-h-[calc(100dvh-3rem)] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-950/75 px-3 py-1.5">
            <ShieldChevron size={14} className="text-amber-300" />
            <span className="mono-data text-[11px] uppercase tracking-[0.22em] text-zinc-200">Aether Sentinel</span>
          </div>

          <h1 className="mt-7 max-w-6xl text-[clamp(2.4rem,4.2vw,4.8rem)] font-semibold leading-[1.02] tracking-tight text-zinc-50">
            Operational decisions, replayable by design.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            Aether Sentinel turns machine signals, tickets, and Kubernetes alerts into explainable priorities, routed
            workflows, human-reviewed actions, and audit-ready replay trails.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/command-center"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
            >
              Run Incident Demo
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/replay/INC-4821"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/75 px-5 py-3 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800/75"
            >
              View Replay
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {proof.map((entry) => {
              const Icon = entry.icon;
              return (
                <div key={entry.label} className="rounded-xl border border-zinc-700/80 bg-zinc-900/70 px-3.5 py-3">
                  <div className="inline-flex items-center gap-2 text-sm text-zinc-100">
                    <Icon size={14} className="text-amber-200" />
                    {entry.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-xl border border-zinc-700/70 bg-zinc-900/60 px-4 py-3">
            <p className="text-xs leading-6 text-zinc-400">
              Signal → Decision → Workflow → Feedback → Replay forms the primary operating loop for every incident in the
              command room.
            </p>
          </div>
        </section>

        <section className="pt-0 lg:pt-3">
          <ProductShellPreview />
        </section>
      </div>
    </main>
  );
}
