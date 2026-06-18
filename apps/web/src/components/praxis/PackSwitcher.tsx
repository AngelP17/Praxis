"use client";

import { Stack } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { getActiveCase, hrefWithActiveCase } from "@/lib/active-case";

interface PackSwitcherProps {
  activePackId: string;
  variant?: "nav" | "inline";
}

export function PackSwitcher({ activePackId, variant = "inline" }: PackSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { packs } = useSolutionPacks();

  const handleChange = (packId: string) => {
    router.push(hrefWithActiveCase(pathname ?? "/", getActiveCase(packId)));
  };

  if (variant === "nav") {
    return (
      <div className="flex items-center gap-2">
        <Stack className="h-4 w-4 text-[var(--praxis-violet)]" />
        <select
          value={activePackId}
          onChange={(event) => handleChange(event.target.value)}
          className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)] focus:border-[var(--praxis-violet)] focus:outline-none"
        >
          {packs.map((pack) => (
            <option key={pack.id} value={pack.id}>
              {pack.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {packs.map((pack) => (
        <button
          key={pack.id}
          type="button"
          onClick={() => handleChange(pack.id)}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-transform hover:scale-105 ${
            pack.id === activePackId
              ? "bg-[var(--praxis-violet)] text-[var(--praxis-bg)]"
              : "border border-[var(--praxis-line)] text-[var(--praxis-muted)] hover:scale-105 hover:border-[var(--praxis-violet)]"
          }`}
        >
          {pack.name}
        </button>
      ))}
    </div>
  );
}
