"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ForensicAccordion } from "./forensic-accordion";
import { SignalMarquee } from "@/components/sentinel-v2/motion/signal-marquee";
import { Pulse, Gauge, WarningCircle, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { SystemMetrics, RecentIncident, LiveSignal } from "@/lib/hooks/use-landing-data";

export function BentoSection({
  metrics,
  recentIncidents,
  liveSignals,
  status,
  errorMessage,
}: {
  metrics: SystemMetrics | null;
  recentIncidents: RecentIncident[];
  liveSignals: LiveSignal[];
  status: string;
  errorMessage: string | null;
}) {
  const hasData = status === "ready" && metrics !== null;

  return (
    <section className="relative px-4 py-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium leading-tight tracking-tight text-zinc-50">
            Operational intelligence in real time
          </h2>
        </div>

        <div className="grid grid-cols-4 grid-flow-dense gap-3">
          {/* Card 1: Large Feature */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="bento-card col-span-4 md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-zinc-600/40 bg-zinc-800/50 p-6 transition-all duration-500 hover:border-amber-500/40 hover:bg-zinc-700/40"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.1),transparent_50%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-400">Architecture</div>
                <h3 className="mt-3 font-display text-2xl font-medium leading-snug text-zinc-100">
                  From sensor gateway to operator checkpoint
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  Signals enter through the gateway, are scored by Astraea, routed to the correct workflow, and human-reviewed before execution.
                </p>
              </div>
              <div className="mt-6 overflow-hidden rounded-xl">
                <img
                  src="https://picsum.photos/seed/architecture/800/500"
                  alt="System architecture"
                  className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ filter: "grayscale(60%) contrast(120%) opacity(85%)" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Card 2: System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.04 }}
            className="bento-card col-span-4 md:col-span-2 group relative overflow-hidden rounded-2xl border border-zinc-600/40 bg-zinc-800/50 p-6 transition-all duration-500 hover:border-amber-500/40 hover:bg-zinc-700/40"
          >
            <div className="relative z-10">
              <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-400">System Health</div>
              {hasData ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Status</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      metrics.critical > 0
                        ? "border-rose-500/30 bg-rose-500/15 text-rose-200"
                        : "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                    }`}>
                      {metrics.critical > 0 ? (
                        <><WarningCircle size={10} /> Degraded</>
                      ) : (
                        <><CheckCircle size={10} /> Healthy</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Open Tickets</span>
                    <span className="mono-data text-sm text-zinc-100">{metrics.total_open}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Critical</span>
                    <span className="mono-data text-sm text-rose-300">{metrics.critical}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">SLA Risk</span>
                    <span className="mono-data text-sm text-amber-300">{metrics.sla_breach_risk}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Incident Clusters</span>
                    <span className="mono-data text-sm text-zinc-100">{metrics.incident_clusters}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-zinc-400">
                  {status === "error" ? `Error: ${errorMessage}` : "Loading system metrics..."}
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 3: Throughput */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.08 }}
            className="bento-card col-span-2 md:col-span-1 group relative overflow-hidden rounded-2xl border border-zinc-600/40 bg-zinc-800/50 p-5 transition-all duration-500 hover:border-amber-500/40 hover:bg-zinc-700/40"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400">
                <Pulse size={11} className="text-amber-300" />
                Throughput
              </div>
              <div className="mono-data mt-3 text-2xl text-zinc-100">
                {metrics?.signals_processed_24h ? `${(metrics.signals_processed_24h / 1_000_000).toFixed(1)}M` : "--"}
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">signals processed daily</div>
            </div>
          </motion.div>

          {/* Card 4: Latency */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.12 }}
            className="bento-card col-span-2 md:col-span-1 group relative overflow-hidden rounded-2xl border border-zinc-600/40 bg-zinc-800/50 p-5 transition-all duration-500 hover:border-amber-500/40 hover:bg-zinc-700/40"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400">
                <Gauge size={11} className="text-amber-300" />
                Decision Latency
              </div>
              <div className="mono-data mt-3 text-2xl text-zinc-100">
                {metrics?.avg_decision_latency_ms ? `<${metrics.avg_decision_latency_ms}ms` : "--"}
              </div>
              <div className="mt-1 text-[11px] text-zinc-400">p99 inference time</div>
            </div>
          </motion.div>

          {/* Card 5: Horizontal Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.16 }}
            className="bento-card col-span-4 md:col-span-2 group relative overflow-hidden rounded-2xl border border-zinc-600/40 bg-zinc-800/50 p-1 transition-all duration-500 hover:border-amber-500/40 hover:bg-zinc-700/40"
          >
            <ForensicAccordion
              items={[
                { id: "a", label: "Signal", detail: "Vibration threshold breach", meta: "sensor gateway + operator ticket" },
                { id: "b", label: "Decision", detail: "Bearing degradation P96", meta: "Astraea deterministic inference" },
                { id: "c", label: "Workflow", detail: "Mechanical route opened", meta: "orchestrator handoff" },
                { id: "d", label: "Replay", detail: "sha256:inc-4821c9a2f", meta: "audit export path" },
              ]}
            />
          </motion.div>

          {/* Card 6: Live Signals Marquee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
            className="bento-card col-span-4 md:col-span-2 group relative overflow-hidden rounded-2xl border border-zinc-600/40 bg-zinc-800/50 p-4 transition-all duration-500 hover:border-amber-500/40 hover:bg-zinc-700/40"
          >
            <div className="mono-data mb-3 text-[10px] uppercase tracking-[0.18em] text-zinc-400">Live Lane</div>
            {liveSignals.length > 0 ? (
              <SignalMarquee
                items={liveSignals.map((s) => `${s.ticket_id} / ${s.title.slice(0, 30)}${s.title.length > 30 ? "..." : ""} / score ${s.priority_score}`)}
              />
            ) : (
              <div className="rounded-xl border border-zinc-600/40 bg-zinc-950/70 px-4 py-2.5 text-[10px] text-zinc-500">
                No live signals currently
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Incidents */}
        {recentIncidents.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="mono-data text-[10px] uppercase tracking-[0.18em] text-zinc-400">Recent Incidents</div>
              <Link href="/incidents" className="text-[11px] text-amber-300 transition hover:text-amber-200">
                View all incidents
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {recentIncidents.slice(0, 4).map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="group flex items-center justify-between rounded-xl border border-zinc-600/40 bg-zinc-800/50 px-5 py-4 transition hover:border-amber-500/40 hover:bg-zinc-700/40"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="mono-data text-[10px] text-zinc-400">{incident.id}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        incident.status === "Investigating" ? "border-rose-500/20 bg-rose-500/10 text-rose-200" :
                        incident.status === "Mitigating" ? "border-amber-500/20 bg-amber-500/10 text-amber-200" :
                        "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-medium text-zinc-100">{incident.title}</p>
                  </div>
                  <div className="ml-4 shrink-0 text-[11px] text-zinc-400">
                    {incident.ticket_count} tickets
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
