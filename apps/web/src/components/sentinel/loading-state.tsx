"use client";

export function LoadingState() {
  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ops-card rounded-[24px] border border-zinc-800/60 bg-black/20 p-5">
            <div className="h-3 w-24 animate-pulse rounded-full bg-zinc-800/90" />
            <div className="mt-5 h-10 w-20 animate-pulse rounded-full bg-zinc-800/80" />
            <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-zinc-900/80" />
          </div>
        ))}
      </div>
      <div className="ops-card rounded-[26px] p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-3 w-48 animate-pulse rounded-full bg-zinc-800" />
          <div className="mt-3 h-2 w-72 animate-pulse rounded-full bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
