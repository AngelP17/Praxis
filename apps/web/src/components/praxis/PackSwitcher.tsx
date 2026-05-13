"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Stack } from "@phosphor-icons/react";
import { SOLUTION_PACKS } from "@/lib/praxis-api";

interface PackSwitcherProps {
  activePackId: string;
  variant?: "nav" | "inline";
}

export function PackSwitcher({ activePackId, variant = "inline" }: PackSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (packId: string) => {
    const params = new URLSearchParams();
    params.set("pack", packId);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (variant === "nav") {
    return (
      <div className="flex items-center gap-2">
        <Stack className="h-4 w-4 text-[var(--praxis-violet)]" />
        <select
          value={activePackId}
          onChange={(e) => handleChange(e.target.value)}
          className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--praxis-muted)] focus:outline-none focus:border-[var(--praxis-violet)]"
        >
          {SOLUTION_PACKS.map((pack) => (
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
      {SOLUTION_PACKS.map((pack) => (
        <button
          key={pack.id}
          onClick={() => handleChange(pack.id)}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-all duration-700 ${
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
