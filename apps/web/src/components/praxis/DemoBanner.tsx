"use client";

const IS_DEMO = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

export function DemoBanner() {
  if (!IS_DEMO) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--praxis-violet)] bg-[rgba(28,26,46,0.95)] px-4 py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--praxis-violet)] backdrop-blur-xl">
      Demo deployment &middot; API Gateway deploys separately &middot; all computed values shown are live artifact hashes
    </div>
  );
}
