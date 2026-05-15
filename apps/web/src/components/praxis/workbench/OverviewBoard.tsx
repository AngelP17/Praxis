"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProof } from "@/lib/hooks/useProof";
import { useSolutionPacks } from "@/lib/hooks/useSolutionPacks";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";
import { formatCurrency, formatPercent } from "@/lib/praxis-client";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import { WorkbenchShell, TopbarTitle, Pill, PrimaryAction } from "./WorkbenchShell";
import { ProofNarrativeStrip } from "@/components/praxis/ProofNarrativeStrip";
import { ProofJourneyTimeline } from "@/components/praxis/ProofJourneyTimeline";

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
        <rect key={i} x={i * (bw + gap)} y={h - (v / max) * h} width={bw} height={(v / max) * h} fill={color} opacity={0.45 + (i / data.length) * 0.55} />
      ))}
    </svg>
  );
}

function MetricCard({ label, value, delta, deltaColor, chart }: { label: string; value: string; delta: string; deltaColor?: string; chart?: React.ReactNode }) {
  return (
    <article className="flex min-h-[124px] flex-col gap-[10px] overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-[18px] transition-transform duration-700 ease-out hover:scale-[1.02]">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">{label}</div>
      <div className="font-display text-[38px] font-medium leading-none tracking-[-0.025em]">{value}</div>
      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-[10px]" style={{ color: deltaColor ?? "var(--praxis-mute)" }}>{delta}</span>
        {chart}
      </div>
    </article>
  );
}

function SignalDensityChart() {
  const series = (offset: number, amp: number, freqDiv: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 25; i++) pts.push(`${i * 28},${offset - Math.sin(i / freqDiv) * amp - (i % 3) * 2}`);
    return pts.join(" ");
  };
  return (
    <article className="col-span-1 flex min-h-[230px] flex-col gap-3 overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-[18px] transition-transform duration-700 ease-out hover:scale-[1.01] md:col-span-3">
      <div className="flex justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Signal density &middot; last 24h</div>
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

export function OverviewBoard({ packId: propPackId, runId }: { packId?: string; runId?: string }) {
  const searchParams = useSearchParams();
  const packId = propPackId ?? searchParams.get("pack") ?? "manufacturing-printer-gpo";
  const { proof, loading, error, reload } = useProof(packId);
  const { packs } = useSolutionPacks();
  const dashboard = useDashboardData();
  const activePack = packs.find((p) => p.id === packId);

  if (loading) return <WorkbenchShell topbar={<TopbarTitle title="Operational Overview" subtitle="Loading…" />}><div className="p-8"><LoadingSkeleton /></div></WorkbenchShell>;
  if (error || !proof) return <WorkbenchShell topbar={<TopbarTitle title="Operational Overview" subtitle="Error" />}><div className="p-8"><ErrorState title="Proof unavailable" message={error?.message ?? "Could not load proof"} onRetry={reload} /></div></WorkbenchShell>;

  const evidenceTrust = proof.evidence.evidence_trust;
  const priorityScore = proof.decision.priority_score;
  const annualValue = formatCurrency(proof.value_case.estimated_annual_value);
  const eventsTotal = proof.evidence.raw_events;
  const ontologyObjects = proof.ontology.objects_created;
  const proofShort = proof.proof_hash.slice(7, 15);
  const packName = activePack?.name ?? packId;
  const runId_ = runId ?? proof.run_id;
  const sites = proof.evidence.sources.length;

  const alerts = proof.evidence.sources.slice(0, 3).map((source, i) => ({
    source,
    summary: `Signal from ${source}`,
    severity: i === 0 ? "high" : i === 1 ? "medium" : "low",
    timestamp: proof.generated_at,
  }));
  const activeRuns = dashboard.metrics?.incidentCount ?? 24;
  const openTickets = dashboard.metrics?.openTickets ?? eventsTotal;
  const criticalTickets = dashboard.metrics?.criticalTickets ?? alerts.length;
  const signalQuality = dashboard.metrics
    ? Math.max(0, Math.min(1, 1 - criticalTickets / Math.max(openTickets, 1)))
    : priorityScore;
  const readinessDelta =
    dashboard.metrics?.systemStatus === "healthy"
      ? "live metrics nominal"
      : dashboard.metrics?.systemStatus === "degraded"
        ? "attention required"
        : "+2.4% vs yesterday";

  const topbarRight = (
    <>
      <Pill>Time &middot; 24H</Pill>
      <Pill tone="plasma">&middot; {alerts.length} alerts</Pill>
      <PrimaryAction href={`/executive-readout/${runId_}`}>Export readout</PrimaryAction>
    </>
  );

  return (
    <WorkbenchShell
      runId={runId_}
      packName={packName}
      topbar={<TopbarTitle title="Operational Overview" subtitle={`Real-time posture · ${sites} sites · ${activeRuns} active runs`} right={topbarRight} />}
    >
      <ProofNarrativeStrip proof={proof} packName={packName} />
      <div className="grid grid-cols-1 grid-flow-dense auto-rows-min gap-[14px] p-[26px] md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Mission Readiness"
          value={formatPercent(evidenceTrust)}
          delta={readinessDelta}
          deltaColor="var(--praxis-argon)"
          chart={<Spark data={[20, 22, 21, 23, 25, 24, 28, 27, 30, 29, 32]} color="var(--praxis-plasma)" />}
        />
        <MetricCard
          label="Active Operations"
          value={String(activeRuns)}
          delta={`${openTickets} open tickets across ${sites} theaters`}
          chart={<Bars data={[3, 5, 4, 6, 7, 6, 8, 9, 7, 8, 10]} color="var(--praxis-plasma)" />}
        />
        <MetricCard
          label="Signal Quality"
          value={formatPercent(signalQuality)}
          delta={`${criticalTickets} critical signals`}
          chart={<Spark data={[8, 9, 7, 10, 9, 11, 10, 12, 11, 13, 12]} color="var(--praxis-argon)" />}
        />

        <article className="row-span-2 overflow-hidden border border-[var(--praxis-line)] bg-[linear-gradient(180deg,rgba(19,18,31,0.96),rgba(10,10,20,0.94))] p-[18px] transition-transform duration-700 ease-out hover:scale-[1.01]">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-mute)]">Alerts &middot; requiring action</div>
          <div className="mt-2 font-display text-[30px] font-medium">{criticalTickets} open</div>
          <div className="mt-4 flex flex-col gap-[10px]">
            {alerts.map((e, i) => {
              const color = e.severity === "high" ? "var(--praxis-crit)" : e.severity === "medium" ? "var(--praxis-plasma)" : "var(--praxis-argon)";
              return (
                <Link key={i} href={`/proof/${runId_}`} className="flex items-center gap-3 border border-[var(--praxis-line)] bg-[var(--praxis-obsidian)] px-3 py-[10px] transition-transform duration-700 ease-out hover:translate-x-1 hover:scale-[1.01]">
                  <span className="block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium">{e.summary}</div>
                    <div className="font-mono text-[10px] text-[var(--praxis-mute)]">{e.source} &middot; {new Date(e.timestamp).toLocaleString()}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </article>

        <SignalDensityChart />

        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <ProofJourneyTimeline proof={proof} />
        </div>

        <MetricCard label="Events ingested" value={String(eventsTotal)} delta="proof-verified event count" deltaColor="var(--praxis-argon)" />
        <MetricCard label="Ontology objects" value={String(ontologyObjects)} delta={`${proof.ontology.links_created} links`} deltaColor="var(--praxis-argon)" />
        <MetricCard label="Annual value" value={annualValue} delta={`conf ${proof.value_case.confidence.toFixed(2)}`} deltaColor="var(--praxis-plasma)" />
        <MetricCard label="Proof hash" value={proofShort} delta="deterministic &middot; signed" deltaColor="var(--praxis-argon)" />
      </div>
    </WorkbenchShell>
  );
}
