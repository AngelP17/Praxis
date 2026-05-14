"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Stack } from "@phosphor-icons/react";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";

export function SolutionPackRail() {
  const { packs } = useSolutionPacks();

  return (
    <div className="grid grid-flow-dense gap-4 lg:grid-cols-12">
      {packs.map((pack, index) => (
        <article
          key={pack.id}
          className={`min-h-56 border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-5 ${
            index === 0 ? "lg:col-span-6 lg:row-span-2" : "lg:col-span-3"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <Stack className="h-8 w-8 text-[var(--praxis-mint)]" weight="duotone" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
              {pack.event_count} events
            </span>
          </div>
          <h4 className={`${index === 0 ? "mt-14 text-5xl" : "mt-10 text-3xl"} font-display font-medium leading-none`}>
            {pack.name}
          </h4>
          <p className="mt-4 text-sm leading-6 text-[var(--praxis-muted)]">{pack.primary_pain}</p>
          <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)]">
            <CheckCircle className="h-3 w-3 text-[var(--praxis-mint)]" />
            {pack.sources.length} sources
          </div>
          <Link
            href={`/fieldlab?pack=${pack.id}`}
            className="mt-5 inline-flex items-center gap-2 bg-[var(--praxis-violet)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bg)] transition hover:scale-105"
          >
            Run FieldLab <ArrowRight className="h-3 w-3" />
          </Link>
        </article>
      ))}
    </div>
  );
}
