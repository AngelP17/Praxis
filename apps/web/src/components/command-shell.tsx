"use client";

import { ReactNode } from "react";

export function CommandShell({ children }: { children: ReactNode }) {
  return (
    <div className="sv3 sv3-bg ops-shell relative flex min-h-[100dvh] overflow-hidden text-white">
      <div className="sv3-hero-scan" />
      <div className="relative z-10 flex w-full">
        {children}
      </div>
    </div>
  );
}
