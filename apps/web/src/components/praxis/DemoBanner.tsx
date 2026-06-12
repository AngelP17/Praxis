"use client";

import { IS_DEMO_MODE } from "@/lib/demo-mode";
import { useDemoSessionStore } from "@/lib/demo/demo-session-store";

export function DemoBanner() {
  const resetDemo = useDemoSessionStore((state) => state.resetDemo);

  if (!IS_DEMO_MODE) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4 border-b border-[var(--praxis-violet)] bg-[rgba(28,26,46,0.95)] px-4 py-2 text-center font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--praxis-violet)] backdrop-blur-xl">
      <span>Demo session &middot; deterministic scenario data &middot; connect production data in your own workspace</span>
      <button
        type="button"
        onClick={resetDemo}
        className="border border-[var(--praxis-line)] px-2 py-1 text-[9px] text-[var(--praxis-bone)] transition-transform hover:scale-105 hover:border-[var(--praxis-plasma)]"
      >
        Reset demo
      </button>
    </div>
  );
}
