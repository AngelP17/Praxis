import {
  ChartLine,
  ClockCounterClockwise,
  DotsThree,
  Gauge,
  Pulse,
  ShieldCheck,
  TrendUp,
  Waveform,
} from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";

const queue = [
  { id: "INC-4821", title: "Press Line 3 vibration cascade", source: "machine telemetry + operator ticket", score: 96 },
  { id: "INC-4814", title: "Telemetry ingest retry burst", source: "kubernetes ingress", score: 88 },
  { id: "INC-4799", title: "ERP auth drift cluster", source: "operator ticket + IAM events", score: 82 },
];

const evidence = ["SLO burn rate", "Kubernetes event window", "Forensic waveform capture", "Operator response runbook"];

export function ProductShellPreview() {
  return (
    <div className="praxis-v2-shell-preview praxis-v2-shell-preview-floating">
      <div className="praxis-v2-shell-preview-glow" />
      <div className="praxis-v2-shell-preview-rail" />
      <div className="relative z-10 grid grid-flow-dense grid-cols-12 gap-3.5">
        <div className="col-span-12 rounded-xl border border-zinc-800/70 bg-zinc-950/85 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2">
              <Pulse size={12} className="text-emerald-300" />
              <span className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-300">Replay + Decision Context</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
              <ClockCounterClockwise size={11} className="text-violet-200" />
              26:27 UTC
            </div>
          </div>
        </div>

        <div className="col-span-12 rounded-xl border border-zinc-700/70 bg-zinc-950/85 p-3.5 md:col-span-4">
          <div className="flex items-center justify-between gap-2">
            <div className="praxis-v2-eyebrow">Signal Queue</div>
            <span className="mono-data text-[10px] text-zinc-500">4 visible</span>
          </div>
          <div className="mt-2.5 space-y-2">
            {queue.map((item, index) => (
              <div
                key={item.id}
                className={`rounded-lg border px-2.5 py-2 ${index === 0 ? "border-violet-400/40 bg-violet-500/12" : "border-zinc-800/80 bg-zinc-900/75"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="mono-data text-[11px] text-zinc-100">{item.id}</span>
                  <span className="mono-data text-[11px] text-violet-200">P{item.score}</span>
                </div>
                <div className="mt-1 text-[11px] leading-5 text-zinc-300">{item.title}</div>
                <div className="mt-1 text-[10px] text-zinc-500">{item.source}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 space-y-3.5 md:col-span-8">
          <div className="rounded-xl border border-zinc-700/70 bg-zinc-950/85 p-3.5">
            <div className="praxis-v2-eyebrow">Selected Incident</div>
            <h3 className="mt-1.5 text-sm font-medium text-zinc-100">Press Line 3 vibration cascade</h3>
            <div className="mt-1 text-[10px] text-zinc-500">INC-4821 · machine telemetry + operator ticket</div>
            <div className="mt-2 grid grid-flow-dense grid-cols-1 gap-2 sm:grid-cols-3">
              <MiniMetric icon={TrendUp} label="Priority score" value="96" />
              <MiniMetric icon={ShieldCheck} label="Confidence" value="0.92" />
              <MiniMetric icon={Gauge} label="Source" value="telemetry + ticket" />
            </div>
          </div>

          <div className="grid grid-flow-dense grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-700/70 bg-zinc-950/85 p-3.5">
              <div className="praxis-v2-eyebrow">Praxis Decision</div>
              <p className="mt-1.5 text-xs leading-5 text-zinc-200">Route to mechanical team and schedule bearing replacement.</p>
              <div className="mt-2 text-[11px] text-zinc-500">Root cause: bearing degradation</div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-zinc-700/70 bg-zinc-900/75 px-2 py-1 text-[10px] text-zinc-300">
                <DotsThree size={12} className="text-violet-200" />
                operator checkpoint pending
              </div>
            </div>
            <div className="rounded-xl border border-zinc-700/70 bg-zinc-950/85 p-3.5">
              <div className="praxis-v2-eyebrow">Replay Hash</div>
              <div className="mono-data mt-1.5 text-[11px] text-violet-100">sha256:inc-4821c9a2f</div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
                <ClockCounterClockwise size={12} className="text-violet-200" />
                Deterministic replay chain
              </div>
            </div>
          </div>

          <div className="grid grid-flow-dense grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-700/70 bg-zinc-950/85 p-3.5">
              <div className="praxis-v2-eyebrow">Mini Replay Timeline</div>
              <div className="mt-2 grid grid-flow-dense grid-cols-2 gap-1.5 text-center sm:grid-cols-4">
                {["Signal", "Decision", "Workflow", "Audit"].map((step, index) => (
                  <div key={step} className="rounded-md border border-zinc-800/80 bg-zinc-900/75 px-1.5 py-1.5">
                    <div className="mono-data text-[9px] text-zinc-500">0{index + 1}</div>
                    <div className="mt-1 text-[10px] text-zinc-200">{step}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-700/70 bg-zinc-950/85 p-3.5">
              <div className="praxis-v2-eyebrow">SLO Evidence</div>
              <div className="mt-2 space-y-1.5">
                {evidence.map((item, index) => (
                  <div key={item} className="inline-flex w-full items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-900/75 px-2 py-1.5">
                    <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-300">
                      {index % 2 === 0 ? <Waveform size={11} className="text-violet-200" /> : <ChartLine size={11} className="text-violet-200" />}
                      {item}
                    </div>
                    <span className="mono-data text-[9px] text-zinc-500">{index === 2 ? "captured" : "ok"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-zinc-800/80 bg-zinc-900/75 px-2 py-1.5">
      <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
        <Icon size={11} className="text-violet-200" />
        {label}
      </div>
      <div className="mono-data mt-1 text-[11px] text-zinc-100">{value}</div>
    </div>
  );
}
