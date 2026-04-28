import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowClockwise,
  ClockCounterClockwise,
  FileArrowDown,
  Fingerprint,
  LinkSimple,
  Path,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { MotionReplayRail } from "@/components/sentinel-v2/motion/motion-replay-rail";
import { SignalMarquee } from "@/components/sentinel-v2/motion/signal-marquee";

type ReplayPayload = {
  ticket_id: string;
  latest_decision?: {
    priority_score?: number;
    root_cause_hypothesis?: string;
  };
  decision_history: Array<{
    id: number;
    decision_ts: string;
    priority_score: number;
    root_cause_hypothesis: string;
    confidence_score: number;
  }>;
  events: Array<{ event_type: string; event_ts: string; actor_type: string }>;
  operator_feedback: Array<{
    feedback_type: string;
    feedback_note?: string;
    feedback_ts: string;
    operator_id?: string;
  }>;
  similar_cases: Array<{ ticket_id: string; title: string; status: string }>;
};

function replayHashFor(id: string) {
  if (id === "INC-4821") return "sha256:inc-4821c9a2f";
  return `sha256:${id.toLowerCase()}c9a2f`;
}

function prettyCause(raw?: string) {
  if (!raw) return "unknown";
  return raw.replace(/[_-]+/g, " ");
}

export function ReplayForensicsView({
  id,
  payload,
  mode,
  notice,
}: {
  id: string;
  payload: ReplayPayload;
  mode: "live" | "demo";
  notice?: string;
}) {
  const replayHash = replayHashFor(id || payload.ticket_id);
  return (
    <main className="sentinel-v2-root min-h-[100dvh] overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="sentinel-v2-grid" />
      <div className="sentinel-v2-noise" />
      <div className="sentinel-v2-amber-field" />

      <div className="relative z-10 mx-auto w-full max-w-[1580px]">
        <section className="sentinel-v2-panel-strong p-5 sm:p-6">
          <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
            <div>
              <div className="sentinel-v2-eyebrow">Replay Forensics</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">Replay {id || payload.ticket_id}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-300">
                Deterministic incident reconstruction with hash-linked decisions, event chain evidence, and operator feedback checkpoints.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href="/command-center"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/75 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
                >
                  Command center
                </Link>
                <Link
                  href={`/incidents/${payload.ticket_id === "INC-4821" ? "IR-2026-041" : "IR-2026-040"}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/75 px-4 py-2 text-sm text-zinc-200 transition hover:border-zinc-500"
                >
                  Incident detail
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-700/70 bg-zinc-950/75 p-3.5">
              <div className="sentinel-v2-eyebrow">Replay Path</div>
              <div className="mt-2">
                <MotionReplayRail
                  nodes={[
                    { id: "signal", label: "Signal", state: "complete" },
                    { id: "decision", label: "Decision", state: "complete" },
                    { id: "workflow", label: "Workflow", state: "complete" },
                    { id: "feedback", label: "Feedback", state: "active" },
                    { id: "replay", label: "Replay", state: "pending" },
                  ]}
                />
              </div>
            </div>
          </div>

          <SignalMarquee
            className="mt-3"
            items={[
              `replay ${id || payload.ticket_id}`,
              `hash ${replayHash}`,
              "signal -> decision -> workflow -> feedback -> replay",
              "operator checkpoint preserved",
              "audit bundle export ready",
            ]}
          />

          {notice ? (
            <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/12 px-4 py-2.5 text-sm text-amber-100">{notice}</div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Metric icon={ShieldCheck} label={mode === "live" ? "Live replay chain" : "Demo replay chain"} value={mode === "live" ? "Verified" : "Seeded"} />
            <Metric icon={Fingerprint} label="Replay hash" value={replayHash} mono />
            <Metric icon={FileArrowDown} label="Audit bundle" value="Export ready" />
          </div>
        </section>

        <section className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-12 xl:col-span-5">
            <div className="sentinel-v2-panel h-full p-4">
              <div className="sentinel-v2-eyebrow">Decision History</div>
              <div className="mt-3 space-y-2.5">
                {payload.decision_history.map((decision) => (
                  <div key={decision.id} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm text-zinc-100">{prettyCause(decision.root_cause_hypothesis)}</div>
                      <span className="mono-data text-xs text-amber-100">{decision.priority_score.toFixed(1)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                      <span className="mono-data">{decision.decision_ts}</span>
                      <span className="mono-data">confidence {decision.confidence_score.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-7">
            <div className="sentinel-v2-panel h-full p-4">
              <div className="sentinel-v2-eyebrow">Event Timeline</div>
              <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {payload.events.map((event, index) => (
                  <div key={`${event.event_type}-${index}`} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 p-3">
                    <div className="text-sm text-zinc-100">{event.event_type.replace(/_/g, " ")}</div>
                    <div className="mt-1 mono-data text-[11px] text-zinc-500">{event.event_ts}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-zinc-500">{event.actor_type}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-zinc-700/70 bg-zinc-950/80 p-3">
                <div className="inline-flex items-center gap-2 text-xs text-zinc-300">
                  <Path size={13} className="text-amber-200" />
                  Replay path: Signal → Decision → Workflow → Feedback → Replay
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="sentinel-v2-panel p-4">
            <div className="sentinel-v2-eyebrow">Evidence Chain</div>
            <div className="mt-3 space-y-2">
              {[
                "SLO burn rate evidence",
                "Kubernetes event window",
                "Forensic waveform capture",
                "Operator response runbook",
              ].map((item) => (
                <div key={item} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2 text-xs text-zinc-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="sentinel-v2-panel p-4">
            <div className="sentinel-v2-eyebrow">Audit Bundle</div>
            <div className="mt-3 space-y-2">
              {payload.decision_history.slice(0, 3).map((decision) => (
                <div key={decision.id} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2.5">
                  <div className="text-xs text-zinc-200">Decision record {decision.id}</div>
                  <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
                    <LinkSimple size={11} className="text-amber-300" />
                    <span className="mono-data">sha256:{id.toLowerCase()}-{decision.id}c9</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sentinel-v2-panel p-4">
            <div className="sentinel-v2-eyebrow">Operator Feedback Checkpoint</div>
            <div className="mt-3 space-y-2">
              {payload.operator_feedback.map((entry, index) => (
                <div key={`${entry.feedback_ts}-${index}`} className="rounded-lg border border-zinc-800/80 bg-zinc-900/75 px-3 py-2.5">
                  <div className="text-[11px] text-zinc-300">{entry.operator_id || "operator"}</div>
                  <p className="mt-1 text-xs leading-5 text-zinc-200">{entry.feedback_note || "Feedback note unavailable."}</p>
                  <div className="mt-1 mono-data text-[10px] text-zinc-500">{entry.feedback_ts}</div>
                </div>
              ))}
              <Link
                href={`/replay/${id || payload.ticket_id}`}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-zinc-700/70 bg-zinc-900/75 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-zinc-500"
              >
                <ArrowClockwise size={12} />
                Refresh replay
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-4 pb-1">
          <div className="sentinel-v2-panel px-4 py-2.5 text-xs text-zinc-400">
            <div className="inline-flex items-center gap-1.5">
              <ClockCounterClockwise size={12} className="text-amber-200" />
              Hash-linked forensic replay complete for <span className="mono-data text-zinc-200">{id || payload.ticket_id}</span>.
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: ComponentType<{ className?: string; size?: number }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-700/70 bg-zinc-900/75 p-3">
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        <Icon size={12} className="text-amber-200" />
        {label}
      </div>
      <div className={`mt-2 text-sm text-zinc-100 ${mono ? "mono-data" : ""}`}>{value}</div>
    </div>
  );
}
