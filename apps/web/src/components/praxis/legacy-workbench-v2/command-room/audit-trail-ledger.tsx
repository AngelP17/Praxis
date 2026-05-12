import { Fingerprint, LinkSimple } from "@phosphor-icons/react";

import type { AuditRecord, DataStatus } from "@/components/praxis/legacy-workbench-v2/command-room/types";

export function AuditTrailLedger({
  items,
  dataStatus,
}: {
  items: AuditRecord[];
  dataStatus: DataStatus;
}) {
  return (
    <section className="praxis-v2-panel h-full p-4 py-20">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="praxis-v2-eyebrow">Audit Trail</div>
          <p className="mt-1 text-xs text-zinc-400">Hash-linked forensic artifacts</p>
        </div>
        <Fingerprint size={15} className="text-amber-200" />
      </div>

      <div className="mt-3 divide-y divide-zinc-800/80 rounded-lg border border-zinc-800/80 bg-zinc-950/72">
        {items.length === 0 ? (
          <div className="p-3 text-sm text-zinc-400">
            {dataStatus === "loading" ? "Compiling audit ledger." : "Audit artifacts unavailable."}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="px-3 py-2.5">
              <div className="text-xs text-zinc-200">{item.label}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
                <LinkSimple size={11} className="text-amber-300" />
                <span className="mono-data">{item.hash}</span>
              </div>
              <div className="mono-data mt-1 text-[10px] text-zinc-600">{item.timestamp}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
