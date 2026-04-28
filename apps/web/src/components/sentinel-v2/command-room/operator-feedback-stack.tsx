import { ChatCircleDots, CheckCircle, WarningCircle } from "@phosphor-icons/react";

import type { DataStatus, FeedbackRecord } from "@/components/sentinel-v2/command-room/types";

export function OperatorFeedbackStack({
  feedback,
  dataStatus,
}: {
  feedback: FeedbackRecord[];
  dataStatus: DataStatus;
}) {
  return (
    <section className="sentinel-v2-panel h-full p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="sentinel-v2-eyebrow">Human Feedback</div>
          <p className="mt-1 text-xs text-zinc-400">Operator checkpoints before closure</p>
        </div>
        <ChatCircleDots size={15} className="text-amber-200" />
      </div>

      <div className="mt-3 space-y-2">
        {feedback.length === 0 ? (
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/70 p-3 text-sm text-zinc-400">
            {dataStatus === "loading" ? "Loading review checkpoints." : "No human feedback recorded yet."}
          </div>
        ) : (
          feedback.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-zinc-800/80 bg-zinc-950/72 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-zinc-300">{entry.author}</div>
                <span className="mono-data text-[10px] text-zinc-500">{entry.timestamp}</span>
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]">
                {entry.verdict === "approve" ? (
                  <>
                    <CheckCircle size={13} className="text-emerald-300" />
                    <span className="text-emerald-100">Approve</span>
                  </>
                ) : (
                  <>
                    <WarningCircle size={13} className="text-amber-300" />
                    <span className="text-amber-100">Needs another sampling window</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-xs leading-5 text-zinc-300">{entry.comment}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
