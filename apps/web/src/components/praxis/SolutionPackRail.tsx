"use client";

import { Stack, ArrowRight, CheckCircle, Play, Pause } from "@phosphor-icons/react";
import { SOLUTION_PACKS, type SolutionPack } from "@/lib/praxis-api";

function PackCard({ pack, featured = false }: { pack: SolutionPack; featured?: boolean }) {
  return (
    <article
      className={`group min-h-56 overflow-hidden border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 transition-transform duration-700 hover:scale-[1.02] ${
        featured ? "lg:col-span-6 lg:row-span-2" : "lg:col-span-3"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <Stack className="h-8 w-8 text-[var(--praxis-mint)]" weight="duotone" />
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          {pack.status}
        </span>
      </div>
      <h4 className={`${featured ? "mt-14 text-5xl" : "mt-10 text-3xl"} font-display font-medium leading-none`}>
        {pack.name}
      </h4>
      <div className="mt-7 grid grid-cols-3 gap-3">
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Buyer</div>
          <div className="mt-1 text-sm">{pack.buyer}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Score</div>
          <div className="mt-1 font-display text-3xl text-[var(--praxis-violet)]">{pack.score}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Value</div>
          <div className="mt-1 font-display text-3xl text-[var(--praxis-mint)]">{pack.annualValue}</div>
        </div>
      </div>
      {featured && (
        <div className="mt-6 border-t border-[var(--praxis-line)] pt-4">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">
            <CheckCircle className="h-3 w-3 text-[var(--praxis-mint)]" />
            {pack.eventCount} events · {pack.sources.length} sources · {pack.objectsCreated} objects
          </div>
          <div className="mt-3 flex gap-2">
            <button className="inline-flex items-center gap-2 bg-[var(--praxis-violet)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bg)]">
              <Play className="h-3 w-3" /> Launch
            </button>
            <button className="inline-flex items-center gap-2 border border-[var(--praxis-line)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">
              View proof <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export function SolutionPackRail() {
  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      {SOLUTION_PACKS.map((pack, index) => (
        <PackCard key={pack.id} pack={pack} featured={index === 0} />
      ))}
      <article className="lg:col-span-6 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">Pack contents</div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
          {["scenario", "context", "events", "ontology", "demo script", "roi model", "objections", "security", "implementation"].map((item) => (
            <div key={item} className="border border-[var(--praxis-line)] px-3 py-2 text-[var(--praxis-muted)]">
              {item}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
