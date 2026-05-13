"use client";

import Link from "next/link";
import { getWorkflowRun } from "@/lib/praxis-workflow";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction } from "./WorkbenchShell";

function Spark({ data, color, w = 120, h = 36 }: { data: number[]; color: string; w?: number; h?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const dx = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * dx},${h - ((v - min) / (max - min || 1)) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="block">
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.14" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

function Bars({ data, color, w = 120, h = 36, gap = 3 }: { data: number[]; color: string; w?: number; h?: number; gap?: number }) {
  const max = Math.max(...data);
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg width={w} height={h} className="block">
      {data.map((v, i) => (
        <rect
          key={i}
          x={i * (bw + gap)}
          y={h - (v / max) * h}
          width={bw}
          height={(v / max) * h}
          fill={color}
          opacity={0.45 + (i / data.length) * 0.55}
        />
      ))}
    </svg>
  );
}

function MetricCard({
  label,
  value,
  delta,
  deltaColor,
  chart,
}: {
  label: string;
  value: string;
  delta: string;
  deltaColor?: string;
  chart?: React.ReactNode;
}) {
  return (
    <article className="flex min-h-[124px] flex-col gap-[10px] border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-[18px]">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
      <div className="font-display text-[38px] font-medium leading-none tracking-[-0.025em]">{value}</div>
      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-[10px]" style={{ color: deltaColor ?? "var(--praxis-mute)" }}>
          {delta}
        </span>
        {chart}
      </div>
    </article>
  );
}

function SignalDensityChart() {
  // canvas-style three-line area chart with deterministic shape
  const series = (offset: number, amp: number, freqDiv: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 25; i++) {
      pts.push(`${i * 28},${offset - Math.sin(i / freqDiv) * amp - (i % 3) * 2}`);
    }
    return pts.join(" ");
  };
  return (
    <article className="col-span-1 flex min-h-[230px] flex-col gap-3 border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-[18px] md:col-span-3">
      <div className="flex justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
          Signal density &middot; last 24h
        </div>
        <div className="flex gap-[14px] font-mono text-[10px] text-[var(--praxis-mute)]">
          <span><span style={{ color: "var(--praxis-plasma)" }}>&#9632;</span> Signals</span>
          <span><span style={{ color: "var(--praxis-argon)" }}>&#9632;</span> Decisions</span>
          <span><span style={{ color: "var(--praxis-faint)" }}>&#9632;</span> Actions</span>
        </div>
      </div>
      <svg viewBox="0 0 700 210" className="h-[210px] w-full">
        <defs>
          <linearGradient id="ov-sig" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--praxis-plasma)" stopOpacity="0.35" />
            <stop offset="1" stopColor="var(--praxis-plasma)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ov-dec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--praxis-argon)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--praxis-argon)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 5 }).map((_, i) => (
          <line key={i} x1="0" x2="700" y1={i * 45 + 10} y2={i * 45 + 10} stroke="var(--praxis-line)" strokeWidth="0.6" />
        ))}
        <polygon points={`0,200 ${series(120, 35, 2.2)} 700,200`} fill="url(#ov-sig)" />
        <polyline points={series(120, 35, 2.2)} fill="none" stroke="var(--praxis-plasma)" strokeWidth="1.6" />
        <polygon points={`0,200 ${series(150, 22, 3)} 700,200`} fill="url(#ov-dec)" />
        <polyline points={series(150, 22, 3)} fill="none" stroke="var(--praxis-argon)" strokeWidth="1.4" />
        <polyline points={series(175, 14, 2.5)} fill="none" stroke="var(--praxis-faint)" strokeWidth="1.1" strokeDasharray="3 3" />
      </svg>
    </article>
  );
}

export function OverviewBoard({ packId, runId }: { packId: string; runId?: string }) {
  const run = getWorkflowRun(packId);
  const stepsDone = run.timeline.filter((s) => s.status === "completed").length;
  const eventsTotal = run.pack.eventCount;
  const sites = 7;
  const activeRuns = 24;
  const evidenceTrust = run.pack.evidenceTrust;
  const annualValue = run.pack.annualValue;

  const topbarRight = (
    <>
      <Pill>Time &middot; 24H</Pill>
      <Pill tone="plasma">&middot; 3 alerts</Pill>
      <PrimaryAction href={`/executive-readout/${runId ?? run.runId}`}>Export readout</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={runId ?? run.runId}
      packName={run.pack.name}
      topbar={
        <TopbarTitle
          title="Operational Overview"
          subtitle={`Real-time posture · ${sites} sites · ${activeRuns} active runs`}
          right={topbarRight}
        />
      }
    >
      <div className="grid grid-cols-1 grid-flow-dense auto-rows-min gap-[14px] p-[26px] md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Mission Readiness"
          value={`${(evidenceTrust * 100).toFixed(1)}%`}
          delta="+2.4% vs yesterday"
          deltaColor="var(--praxis-argon)"
          chart={<Spark data={[20, 22, 21, 23, 25, 24, 28, 27, 30, 29, 32]} color="var(--praxis-plasma)" />}
        />
        <MetricCard
          label="Active Operations"
          value={String(activeRuns)}
          delta={`across ${sites} theaters`}
          chart={<Bars data={[3, 5, 4, 6, 7, 6, 8, 9, 7, 8, 10]} color="var(--praxis-plasma)" />}
        />
        <MetricCard
          label="Signal Quality"
          value={`${(run.pack.priorityScore * 100).toFixed(1)}%`}
          delta="stable"
          chart={<Spark data={[8, 9, 7, 10, 9, 11, 10, 12, 11, 13, 12]} color="var(--praxis-argon)" />}
        />

        <article className="row-span-2 border border-[var(--praxis-line)] bg-[var(--praxis-surface)] p-[18px]">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">
            Alerts &middot; requiring action
          </div>
          <div className="mt-2 font-display text-[30px] font-medium">3 open</div>
          <div className="mt-4 flex flex-col gap-[10px]">
            {run.events.slice(0, 3).map((e, i) => {
              const color =
                e.severity === "high"
                  ? "var(--praxis-crit)"
                  : e.severity === "medium"
                  ? "var(--praxis-plasma)"
                  : "var(--praxis-argon)";
              return (
                <Link
                  key={i}
                  href={`/proof/${run.runId}`}
                  className="flex items-center gap-3 border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-3 py-[10px] transition-transform hover:translate-x-1"
                >
                  <span
                    className="block h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium">{e.summary}</div>
                    <div className="font-mono text-[10px] text-[var(--praxis-mute)]">
                      {e.source} &middot; {new Date(e.timestamp).toLocaleString()}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </article>

        <SignalDensityChart />

        <MetricCard
          label="Events ingested"
          value={String(eventsTotal)}
          delta={`+${stepsDone}/${run.timeline.length} steps complete`}
          deltaColor="var(--praxis-argon)"
        />
        <MetricCard label="Ontology objects" value={String(run.ontologyObjects.length)} delta="9 object types" deltaColor="var(--praxis-argon)" />
        <MetricCard
          label="Annual value"
          value={annualValue}
          delta={`conf ${(run.pack.priorityScore).toFixed(2)}`}
          deltaColor="var(--praxis-plasma)"
        />
        <MetricCard
          label="Proof hash"
          value={run.proofHashPreview.slice(0, 8)}
          delta="deterministic &middot; signed"
          deltaColor="var(--praxis-argon)"
        />
      </div>
    </WorkbenchShell>
  );
}
