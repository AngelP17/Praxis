"use client";

import { ReactNode } from "react";

export function CommandShell({ children }: { children: ReactNode }) {
  return (
    <div className="praxis-theme ops-shell relative flex min-h-[100dvh] overflow-hidden bg-[var(--praxis-obsidian)] text-[var(--praxis-bone)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(139,92,255,0.14),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(62,255,168,0.08),transparent_20%),linear-gradient(180deg,rgba(19,18,31,0.24),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(241,237,223,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(241,237,223,0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(139,92,255,0.18),transparent_66%)]" />
      <div className="relative z-10 flex w-full">
        {children}
      </div>
    </div>
  );
}
