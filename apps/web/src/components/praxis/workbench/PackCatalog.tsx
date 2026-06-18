"use client";

import Link from "next/link";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction } from "./WorkbenchShell";

export function PackCatalog() {
  const { packs } = useSolutionPacks();
  const topbarRight = (
    <>
      <Pill>{packs.length} packs</Pill>
      <PrimaryAction href="/field-workbench?pack=manufacturing-printer-gpo">Open verified pack</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      topbar={<TopbarTitle title="Solution Packs" subtitle="Case catalog from /api/solution-packs" right={topbarRight} />}
    >
      <div className="p-6 md:p-8">
        <div className="flex flex-col">
          {packs.map((pack) => (
            <Link
              key={pack.id}
              href={`/field-workbench?pack=${pack.id}`}
              className="mb-3 grid grid-cols-12 grid-flow-dense items-center gap-3 overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] px-4 py-5 transition-transform duration-700 ease-out hover:translate-x-1 hover:scale-[1.01]"
            >
              <div className="col-span-12 md:col-span-5">
                <div className="font-display text-[18px] font-medium tracking-[-0.01em]">{pack.name}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-mute)]">{pack.id}</div>
              </div>
              <div className="col-span-6 text-[13px] md:col-span-2">{pack.buyer_persona}</div>
              <div className="col-span-6 font-mono text-[11px] uppercase text-[var(--praxis-mute)] md:col-span-2">
                {pack.event_count} events
              </div>
              <div className="col-span-6 md:col-span-2">
                <Pill tone="argon">{pack.sources.length} sources</Pill>
              </div>
              <div className="col-span-6 text-right font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-bone)] md:col-span-1">
                Run
              </div>
            </Link>
          ))}
        </div>
      </div>
    </WorkbenchShell>
  );
}
