"use client";

type AccordionItem = {
  id: string;
  label: string;
  detail: string;
  meta: string;
};

export function ForensicAccordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="flex h-full min-h-56 w-full flex-col gap-1 overflow-hidden rounded-xl p-3 sm:flex-row">
      {items.map((item) => (
        <article
          key={item.id}
          className="group relative flex min-h-28 flex-1 flex-col justify-between overflow-hidden rounded-lg bg-zinc-950/60 px-3.5 py-3.5 transition-all duration-500 ease-out hover:bg-zinc-800/60 sm:hover:flex-[2.5]"
        >
          <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</div>
          <div className="mt-auto">
            <div className="text-sm font-medium text-zinc-200">{item.detail}</div>
            <div className="mt-2 text-[11px] leading-relaxed text-zinc-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              {item.meta}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div className="absolute inset-x-0 bottom-0 h-px bg-amber-300/45" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-amber-500/8" />
          </div>
        </article>
      ))}
    </div>
  );
}
