"use client";

import { ReactNode } from "react";

export function CommandRoomShell({ children }: { children: ReactNode }) {
  return (
    <div className="ops-shell relative flex min-h-[100dvh] overflow-hidden text-white">
      <div className="legacy-grid absolute inset-0 opacity-70" />
      <div className="scan-line" />
      <div className="relative z-10 flex w-full">
        {children}
      </div>
    </div>
  );
}
