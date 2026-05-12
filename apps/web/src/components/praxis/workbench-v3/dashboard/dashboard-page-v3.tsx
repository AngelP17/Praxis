"use client";

/**
 * V3 dashboard. Reads useDashboardData() — same hook v2 used.
 * Drop-in: replace dashboard/page.tsx body with <DashboardPageV3 />.
 */

import Link from "next/link";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ErrorState } from "@/components/error-state";
import {
  SvIco, SvPulse, SvCorners, SvChip, SvSparkline, SvWaveform, SvHeatmap, SvPrioBar,
} from "@/components/praxis/workbench-v3/primitives";

const STATUS_KIND: Record<string, "ok" | "amber" | "warn" | "crit"> = {
  healthy: "ok",
  degraded: "warn",
  critical: "crit",
  unknown: "amber",
};

export function DashboardPageV3() {
  const { metrics, recentTickets, activeIncidents, status, errorMessage, refresh } = useDashboardData();

  if (status === "loading") {
    return (
      <main className="sv3 sv3-bg" style={{ minHeight: "100dvh", padding: "24px 16px" }}>
        <div style={{ maxWidth: 1500, margin: "0 auto" }}>
          <LoadingSkeleton />
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="sv3 sv3-bg" style={{ minHeight: "100dvh", padding: "24px 16px" }}>
        <div style={{ maxWidth: 1500, margin: "0 auto" }}>
          <ErrorState title="Dashboard unavailable" message={errorMessage || "Live dashboard could not load."} onRetry={refresh} />
        </div>
      </main>
    );
  }

  const sysKind = STATUS_KIND[metrics?.systemStatus ?? "unknown"];

  return (
    <main className="sv3 sv3-bg" style={{ minHeight: "100dvh", padding: "20px 16px 32px" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Header */}
        <header className="sv3-plate sv3-plate-crisp" style={{ padding: "14px 18px", position: "relative" }}>
          <SvCorners />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
            <div>
              <span className="label label-amber">[ system overview ]</span>
              <h1 style={{ margin: "8px 0 0", fontSize: "clamp(1.4rem, 2.2vw, 1.9rem)", fontWeight: 600, color: "var(--sv3-fg)", letterSpacing: "-0.018em" }}>
                Operational dashboard
              </h1>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              <SvPulse kind={sysKind} />
              <span className="mono" style={{ fontSize: 11, color: "var(--sv3-muted)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                {metrics?.systemStatus ?? "unknown"}
              </span>
              <SvChip>30s refresh</SvChip>
            </div>
          </div>
        </header>

        {/* 12-col bento */}
        <div
          className="sv3-dash-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 12,
            gridAutoRows: "minmax(120px, auto)",
          }}
        >
          {/* Big queue card */}
          <Plate cols={6} rows={2}>
            <PlateHeader label="Queue overview" status={<SvPulse kind="amber" />} right={<span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{metrics?.totalTickets ?? 0} total</span>} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginTop: 18 }}>
              <Stat label="Total tickets" value={metrics?.totalTickets ?? 0} />
              <Stat label="Open queue" value={metrics?.openTickets ?? 0} amber />
              <Stat label="Critical" value={metrics?.criticalTickets ?? 0} tone="crit" />
              <Stat label="Resolved today" value={metrics?.resolvedToday ?? 0} tone="ok" />
            </div>
            <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", gap: 8 }}>
              <Link href="/command-center" className="sv3-cta hover:scale-105 transition-transform duration-500" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Command center <SvIco.Arrow size={12} />
              </Link>
              <Link href="/board" className="sv3-cta ghost hover:scale-105 transition-transform duration-500">Board view</Link>
            </div>
          </Plate>

          {/* Active incidents */}
          <Plate cols={6}>
            <PlateHeader
              label="Active incidents"
              right={<span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{activeIncidents.length} clusters</span>}
            />
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {activeIncidents.length === 0 && <div style={{ fontSize: 12, color: "var(--sv3-subtle)" }}>No active incidents</div>}
              {activeIncidents.slice(0, 3).map((incident) => {
                const tone =
                  incident.status === "Investigating" ? "crit" :
                  incident.status === "Mitigating" ? "amber" : "ok";
                return (
                  <Link
                    key={incident.id}
                    href={`/incidents/${incident.id}`}
                    className="hover:scale-105 transition-transform duration-500"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div className="sv3-plate" style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{incident.id}</span>
                          <SvChip tone={tone}>{incident.status}</SvChip>
                        </div>
                        <div style={{ fontSize: 12, marginTop: 4, color: "var(--sv3-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {incident.title}
                        </div>
                      </div>
                      <SvIco.Arrow size={11} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Plate>

          {/* SLA risk */}
          <Plate cols={3}>
            <PlateHeader label="SLA risk" right={<SvIco.Bolt size={11} />} />
            <div className="num" style={{ fontSize: 36, marginTop: 10, color: "var(--sv3-amber)" }}>
              {metrics?.slaRiskCount ?? 0}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)", marginTop: 6 }}>tickets at risk</div>
            <div style={{ marginTop: 12 }}><SvSparkline stroke="var(--sv3-amber)" /></div>
          </Plate>

          {/* Incident clusters */}
          <Plate cols={3}>
            <PlateHeader label="Incident clusters" right={<SvIco.Layers size={11} />} />
            <div className="num" style={{ fontSize: 36, marginTop: 10, color: "var(--sv3-fg)" }}>
              {metrics?.incidentCount ?? 0}
            </div>
            <div className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)", marginTop: 6 }}>active clusters</div>
            <div style={{ marginTop: 12 }}><SvHeatmap cells={20} height={14} /></div>
          </Plate>

          {/* Decision waveform — long */}
          <Plate cols={6}>
            <PlateHeader label="Decision throughput" right={<span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>last 30m</span>} />
            <div style={{ marginTop: 14 }}><SvWaveform /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 14 }}>
              <Stat label="p50 ms" value={184} compact />
              <Stat label="p95 ms" value={612} compact />
              <Stat label="approved" value="78%" compact tone="ok" />
              <Stat label="overridden" value="12%" compact amber />
            </div>
          </Plate>

          {/* Active queue — full width */}
          <Plate cols={12}>
            <PlateHeader
              label="Active queue"
              right={<Link href="/board" className="mono hover:scale-105 transition-transform duration-500" style={{ fontSize: 10, color: "var(--sv3-amber)", letterSpacing: "0.18em", textDecoration: "none" }}>VIEW BOARD →</Link>}
            />
            <div style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 8,
            }}>
              {recentTickets.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--sv3-subtle)" }}>Clear queue.</div>
              )}
              {recentTickets.slice(0, 6).map((t) => {
                const tone =
                  t.priority_raw === "Critical" ? "crit" :
                  t.priority_raw === "High" ? "amber" : "default";
                return (
                  <Link key={t.ticket_id} href={`/tickets/${t.ticket_id}`} className="hover:scale-105 transition-transform duration-500" style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="sv3-plate" style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                        <span className="mono" style={{ fontSize: 10, color: "var(--sv3-muted)" }}>{t.ticket_id}</span>
                        <SvChip tone={tone}>{t.priority_raw}</SvChip>
                      </div>
                      <div style={{ fontSize: 12, marginTop: 6, color: "var(--sv3-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.title}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <SvPrioBar value={t.priority_score ?? 50} />
                        <span className="mono" style={{ fontSize: 9, color: "var(--sv3-subtle)", marginLeft: 8 }}>{t.days_open}d</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Plate>
        </div>

        <style jsx>{`
          @media (max-width: 900px) {
            :global(.sv3-dash-grid) {
              grid-template-columns: 1fr !important;
            }
            :global(.sv3-dash-grid > section) {
              grid-column: 1 / -1 !important;
            }
          }
        `}</style>
      </div>
    </main>
  );
}

function Plate({ children, cols, rows = 1 }: { children: React.ReactNode; cols: number; rows?: number }) {
  return (
    <section
      className="sv3-plate py-20"
      style={{
        gridColumn: `span ${cols}`,
        gridRow: `span ${rows}`,
        padding: 16,
        display: "flex", flexDirection: "column",
        position: "relative", minHeight: 0,
      }}
    >
      {children}
    </section>
  );
}

function PlateHeader({ label, status, right }: { label: string; status?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        {status}
        <span className="label">{label}</span>
      </div>
      {right}
    </div>
  );
}

function Stat({
  label, value, amber, tone, compact,
}: { label: string; value: number | string; amber?: boolean; tone?: "ok" | "crit"; compact?: boolean }) {
  const color =
    tone === "crit" ? "var(--sv3-crit)" :
    tone === "ok" ? "var(--sv3-ok)" :
    amber ? "var(--sv3-amber)" : "var(--sv3-fg)";
  return (
    <div className={compact ? undefined : "sv3-plate"} style={compact ? {} : { padding: "10px 12px" }}>
      <div className="label" style={{ fontSize: 9 }}>{label}</div>
      <div className="num" style={{ fontSize: compact ? 18 : 28, marginTop: 4, color, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}
