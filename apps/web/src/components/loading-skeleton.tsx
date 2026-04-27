"use client";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="legacy-card rounded-[1.5rem] p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded-md bg-zinc-800" />
            <div className="h-2 w-48 animate-pulse rounded-md bg-zinc-800/70" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-xl bg-zinc-800" />
        </div>
        <div className="mt-6 h-2 animate-pulse rounded-md bg-zinc-800/50" />
        <div className="mt-3 h-2 w-3/4 animate-pulse rounded-md bg-zinc-800/50" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="legacy-card rounded-[1.25rem] p-5">
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 animate-pulse rounded-md bg-zinc-800" />
              <div className="h-10 w-10 animate-pulse rounded-2xl bg-zinc-800" />
            </div>
            <div className="mt-4 h-8 w-16 animate-pulse rounded-md bg-zinc-800" />
            <div className="mt-3 h-2 w-full animate-pulse rounded-md bg-zinc-800/50" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="legacy-card rounded-[1.5rem] p-4">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-zinc-800" />
              <div className="h-4 w-24 animate-pulse rounded-md bg-zinc-800" />
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((__, j) => (
                <div key={j} className="h-20 animate-pulse rounded-[1.15rem] bg-zinc-800/40" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
