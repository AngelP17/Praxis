import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

const entrances = [
  {
    title: "Command Center",
    href: "/command-center",
    eyebrow: "Primary view",
    description:
      "Open the ranked queue, review live decisions, and move from triage to action without extra clicks.",
  },
  {
    title: "Incident Board",
    href: "/board",
    eyebrow: "Ops board",
    description:
      "Jump straight into the operational board for the current ticket stream, clustering cues, and queue pressure.",
  },
  {
    title: "New Ticket",
    href: "/tickets/new",
    eyebrow: "Transactional",
    description:
      "Create and manage real tickets, attach files, and keep the new Aether design tied to actual operational work.",
  },
  {
    title: "Reports",
    href: "/reports",
    eyebrow: "Exports",
    description:
      "Download the styled Excel workbook and review the operational summary in a format stakeholders actually use.",
  },
  {
    title: "Admin Console",
    href: "/admin",
    eyebrow: "Management",
    description:
      "Manage users, privileges, categories, labels, and your own password inside the new control plane.",
  },
  {
    title: "Sign In",
    href: "/login",
    eyebrow: "Authentication",
    description:
      "Access the OpsCenter with your credentials to manage tickets and view reports.",
  },
];

export default function Home() {
  return (
    <main className="min-h-[100dvh] px-4 py-6 text-zinc-50 sm:px-6 lg:px-8">
      <div className="ops-grid absolute inset-0 opacity-50" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[1400px] flex-col justify-center">
        <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/70 shadow-2xl shadow-black/20">
          <div className="grid gap-0 lg:grid-cols-[1.2fr,0.8fr]">
            <section className="relative p-6 sm:p-8 lg:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.08),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.05),_transparent_32%)]" />
              <div className="relative">
                <p className="mono-data text-xs font-medium uppercase tracking-[0.35em] text-amber-300">
                  Aether Sentinel
                </p>
                <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Operational intelligence control room.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                  Signal ingestion, decision evaluation, incident response, and audit replay in one unified platform. Start where you need to work.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/command-center"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
                  >
                    Open Command Center
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </section>

            <aside className="border-t border-zinc-800 bg-zinc-950/60 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <div className="space-y-4">
                {entrances.map((entrance) => (
                  <Link
                    key={entrance.title}
                    href={entrance.href}
                    className="group block rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 transition hover:border-amber-500/30 hover:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                          {entrance.eyebrow}
                        </p>
                        <h2 className="mt-1 text-lg font-medium text-white">{entrance.title}</h2>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 text-amber-300 transition group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">{entrance.description}</p>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
