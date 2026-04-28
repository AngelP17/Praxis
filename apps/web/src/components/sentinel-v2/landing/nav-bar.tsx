"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldChevron, Circle, List, X } from "@phosphor-icons/react/dist/ssr";

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/command-center", label: "Command Center" },
    { href: "/incidents", label: "Incidents" },
    { href: "/replay/INC-4821", label: "Replay" },
    { href: "/reports", label: "Audit" },
  ];

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2">
      <nav className="flex items-center justify-between rounded-full border border-zinc-800/70 bg-zinc-950/60 px-5 py-3 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
        <div className="inline-flex items-center gap-2.5">
          <ShieldChevron size={16} className="text-amber-300" />
          <span className="font-display text-sm font-medium tracking-tight text-zinc-100">
            Aether Sentinel
          </span>
        </div>

        <div className="hidden items-center gap-6 text-[13px] text-zinc-400 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-zinc-200">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 text-[11px] text-zinc-500">
            <Circle size={7} weight="fill" className="text-emerald-400" />
            <span>Live</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900/50 text-zinc-400 transition hover:text-zinc-200 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={16} /> : <List size={16} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mt-2 rounded-2xl border border-zinc-800/70 bg-zinc-950/80 p-4 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.3)] md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900/60 hover:text-zinc-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
