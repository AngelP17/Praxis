import type { ReactNode } from "react";

export function PraxisShell({ children }: { children: ReactNode }) {
  return <div className="praxis-theme min-h-[100dvh] w-full max-w-full overflow-x-hidden">{children}</div>;
}
