import { Hash, Path } from "@phosphor-icons/react";
import type { QueueTicket } from "@/lib/hooks/use-command-feed";

import { MotionReplayRail } from "@/components/sentinel-v2/motion/motion-replay-rail";
import type { DataStatus } from "@/components/sentinel-v2/command-room/types";

function replayHashFor(ticket?: QueueTicket) {
  if (!ticket) return "sha256:pending";
  if (ticket.ticketId === "INC-4821") return "sha256:inc-4821c9a2f";
  return `sha256:${ticket.ticketId.toLowerCase()}c9a2f`;
}

export function ReplayHashRail({
  ticket,
  dataStatus,
}: {
  ticket?: QueueTicket;
  dataStatus: DataStatus;
}) {
  return (
    <section className="sentinel-v2-panel p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="sentinel-v2-eyebrow">Replay Navigation</div>
          <p className="mt-1 text-xs text-zinc-400">Signal → Decision → Workflow → Feedback → Replay</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/70 bg-zinc-900/75 px-3 py-1.5 text-xs text-zinc-300">
          <Hash size={13} className="text-amber-200" />
          <span className="mono-data">{replayHashFor(ticket)}</span>
        </div>
      </div>

      <div className="mt-2.5">
        <MotionReplayRail
          nodes={[
            { id: "signal", label: "Signal", state: "complete" },
            { id: "decision", label: "Decision", state: "complete" },
            { id: "workflow", label: "Workflow", state: "active" },
            { id: "feedback", label: "Feedback", state: dataStatus === "loading" ? "pending" : "complete" },
            { id: "replay", label: "Replay", state: "pending" },
          ]}
        />
      </div>

      <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg border border-zinc-700/70 bg-zinc-900/75 px-3 py-1.5 text-xs text-zinc-300">
        <Path size={13} className="text-emerald-300" />
        Mini replay timeline ready for forensic export.
      </div>
    </section>
  );
}
