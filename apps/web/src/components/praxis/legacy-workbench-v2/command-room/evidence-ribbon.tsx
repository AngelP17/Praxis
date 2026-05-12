import { ChartLine, FileText, Pulse, Webcam } from "@phosphor-icons/react";

import type { DataStatus, EvidenceRecord } from "@/components/praxis/legacy-workbench-v2/command-room/types";

const iconMap = [ChartLine, Pulse, Webcam, FileText];

export function EvidenceRibbon({
  items,
  dataStatus,
}: {
  items: EvidenceRecord[];
  dataStatus: DataStatus;
}) {
  return (
    <section className="praxis-v2-panel h-full p-4 py-20">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="praxis-v2-eyebrow">Platform Evidence</div>
          <p className="mt-1 text-xs text-zinc-400">SLO burn rate, Kubernetes event window, waveform, runbook</p>
        </div>
        <div className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${dataStatus === "live" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-amber-500/30 bg-amber-500/10 text-amber-100"}`}>
          {dataStatus === "live" ? "Verified" : "Seeded"}
        </div>
      </div>

      <div className="mt-3 divide-y divide-zinc-800/80 rounded-lg border border-zinc-800/80 bg-zinc-950/72">
        {items.map((item, index) => {
          const Icon = iconMap[index % iconMap.length];
          return (
            <div key={item.id} className="px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-sm text-zinc-200">
                  <Icon size={14} className="text-amber-200" />
                  {item.label}
                </div>
                <span className="mono-data text-[10px] text-zinc-500">{item.timestamp}</span>
              </div>
              <div className="mt-1 text-xs text-zinc-500">{item.source}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
