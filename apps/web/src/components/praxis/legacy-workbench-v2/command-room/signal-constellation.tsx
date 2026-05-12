import type { QueueTicket } from "@/lib/hooks/use-command-feed";
import { Broadcast } from "@phosphor-icons/react";

import { MotionSignalQueue } from "@/components/praxis/legacy-workbench-v2/motion/motion-signal-queue";
import type { DataStatus } from "@/components/praxis/legacy-workbench-v2/command-room/types";

function confidenceFor(ticket: QueueTicket) {
  if (ticket.ticketId === "INC-4821") return 0.92;
  return Math.max(0.52, Math.min(0.96, ticket.score / 100));
}

function toneFor(ticket: QueueTicket) {
  if (ticket.priority.toLowerCase() === "critical") return "critical" as const;
  if (ticket.priority.toLowerCase() === "high") return "high" as const;
  return "normal" as const;
}

export function SignalConstellation({
  tickets,
  selectedId,
  onSelect,
  dataStatus,
}: {
  tickets: QueueTicket[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  dataStatus: DataStatus;
}) {
  const stateBadge =
    dataStatus === "live"
      ? "Verified live queue"
      : dataStatus === "demo"
        ? "Operations snapshot active"
        : dataStatus === "stale"
          ? "Stale queue snapshot"
          : dataStatus === "loading"
            ? "Loading signals"
            : "Fallback mode";

  return (
    <section className="praxis-v2-panel h-full max-h-[340px] overflow-y-auto p-4 sm:p-5 py-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="praxis-v2-eyebrow">Signal Queue</div>
          <p className="mt-1 text-xs text-zinc-400">Ranked machine and operator incidents</p>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="rounded-md border border-zinc-700/70 bg-zinc-900/75 px-2 py-1 text-[10px] text-zinc-300">{stateBadge}</span>
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/70 bg-zinc-900/75 text-amber-300">
            <Broadcast size={15} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        {dataStatus === "loading" ? (
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-[78px] rounded-xl border border-zinc-800/80 bg-zinc-900/70" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/70 p-4 text-sm text-zinc-400">
            Waiting for prioritized signals. Demo scenario will auto-load when live records are unavailable.
          </div>
        ) : (
          <MotionSignalQueue
            items={tickets.slice(0, 4).map((ticket) => ({
              id: ticket.ticketId,
              title: ticket.title,
              source: ticket.requester || "machine telemetry + operator ticket",
              priority: ticket.score,
              confidence: confidenceFor(ticket),
              tone: toneFor(ticket),
            }))}
            selectedId={selectedId ?? tickets[0]?.ticketId}
            onSelect={onSelect}
          />
        )}
      </div>
    </section>
  );
}
