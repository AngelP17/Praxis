"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CheckCircle, Database, Envelope, BracketsCurly, ArrowRight } from "@phosphor-icons/react";
import { PraxisMark } from "./PraxisMark";
import { DEMO_PIPELINE_STAGES, getDemoPipelineCompletion, getDemoProof } from "@/lib/praxis-demo-data";

interface StageEvent {
  stage: string;
  label: string;
  index: number;
  total: number;
  progress: number;
  run_id: string;
  stage_hash: string;
  timestamp: number;
}

interface CompletedEvent {
  run_id: string;
  solution_pack: string;
  proof_hash: string;
  conformance: string;
  events_processed: number;
  ontology_objects: number;
  priority_score: number;
  evidence_trust: number;
  estimated_value: number;
  download_url: string;
  verify_command: string;
}

const STAGE_ICONS: Record<string, any> = {
  "s3.write": Database,
  "sqs.send": Envelope,
  "dynamo.put": Database,
  "events.emit": Envelope,
  "proof.hash": BracketsCurly,
  "proof.sign": PraxisMark,
};

const IS_DEMO = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

function StageDot({ active }: { active: boolean }) {
  return (
    <span
      className={`h-2 w-2 rounded-full transition-colors duration-500 ${
        active ? "bg-[var(--praxis-mint)]" : "bg-[var(--praxis-line)]"
      }`}
    />
  );
}

function renderStageIcon(Icon: any) {
  if (Icon === PraxisMark) {
    return <PraxisMark size={20} />;
  }
  return <Icon className="h-5 w-5 text-[var(--praxis-violet)]" />;
}

export function PipelineLive({
  packId = "manufacturing-printer-gpo",
  demo = IS_DEMO,
}: { packId?: string; demo?: boolean }) {
  const [stages, setStages] = useState<StageEvent[]>([]);
  const [completed, setCompleted] = useState<CompletedEvent | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];
    };
  }, []);

  const startPipeline = useCallback(() => {
    setRunning(true);
    setStages([]);
    setCompleted(null);
    setError(null);

    if (demo) {
      const proof = getDemoProof(packId);
      const runId = proof.run_id;
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];

      DEMO_PIPELINE_STAGES.forEach((stage, index) => {
        const timeoutId = window.setTimeout(() => {
          setStages((prev) => {
            const existing = prev.find((item) => item.stage === stage.stage);
            if (existing) return prev;
            return [
              ...prev,
              {
                stage: stage.stage,
                label: stage.label,
                index,
                total: DEMO_PIPELINE_STAGES.length,
                progress: (index + 1) / DEMO_PIPELINE_STAGES.length,
                run_id: runId,
                stage_hash: `${proof.proof_hash.slice(0, 15)}${index}`,
                timestamp: Date.now(),
              },
            ].sort((a, b) => a.index - b.index);
          });

          if (index === DEMO_PIPELINE_STAGES.length - 1) {
            setCompleted(getDemoPipelineCompletion(packId, runId));
            setRunning(false);
          }
        }, (index + 1) * 500);

        timeoutsRef.current.push(timeoutId);
      });
      return;
    }

    const eventSource = new EventSource(`/api/proofs/${packId}/stream`);

    eventSource.addEventListener("stage", (event) => {
      const data: StageEvent = JSON.parse(event.data);
      setStages((prev) => {
        const existing = prev.find((s) => s.stage === data.stage);
        return existing ? prev : [...prev, data].sort((a, b) => a.index - b.index);
      });
    });

    eventSource.addEventListener("completed", (event) => {
      const data: CompletedEvent = JSON.parse(event.data);
      setCompleted(data);
      setRunning(false);
      eventSource.close();
    });

    eventSource.onerror = () => {
      setError("SSE connection lost. The pipeline may still be running.");
      setRunning(false);
      eventSource.close();
    };
  }, [demo, packId]);

  return (
    <article className="border border-[var(--praxis-line)] bg-[var(--praxis-panel)] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-muted)]">
          <BracketsCurly className="h-4 w-4 text-[var(--praxis-violet)]" />
          Live Pipeline
        </div>
        <button
          onClick={startPipeline}
          disabled={running}
          className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-transform duration-700 hover:scale-105 ${
            running
              ? "border border-[var(--praxis-line)] text-[var(--praxis-muted)] cursor-not-allowed"
              : "bg-[var(--praxis-bone)] text-[var(--praxis-bg)]"
          }`}
        >
          {running ? "Running…" : "Run Pipeline"}
        </button>
      </div>

      {error && (
        <div className="mt-4 border border-[var(--praxis-crit)] p-3 font-mono text-[10px] uppercase text-[var(--praxis-crit)]">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {running && stages.length === 0 && (
          <div className="py-8 text-center font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
            Connecting to FieldLab…
          </div>
        )}

          {stages.map((stage) => {
          return (
            <div
              key={stage.stage}
              className="flex items-center gap-4 border border-[var(--praxis-line)] bg-[var(--praxis-bg)] p-4"
            >
              <StageDot active />
              {renderStageIcon(STAGE_ICONS[stage.stage] || Database)}
              <div className="flex-1">
                <div className="text-sm">{stage.label}</div>
                <div className="mt-1 font-mono text-[10px] uppercase text-[var(--praxis-muted)]">
                  {stage.stage} · {stage.stage_hash}
                </div>
              </div>
              <span className="font-mono text-[10px] text-[var(--praxis-mint)]">
                {Math.round(stage.progress * 100)}%
              </span>
            </div>
          );
        })}
      </div>

      {completed && (
        <div className="mt-6 border border-[var(--praxis-mint)] bg-[rgba(62,255,168,0.04)] p-5">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[var(--praxis-mint)]" weight="fill" />
            <span className="font-display text-xl font-medium">Proof Complete</span>
          </div>
          <div className="mt-4 grid grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4">
            <div className="border border-[var(--praxis-line)] p-3">
              <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Hash</div>
              <div className="mt-1 break-all font-mono text-xs text-[var(--praxis-mint)]">
                {completed.proof_hash.substring(0, 18)}…
              </div>
            </div>
            <div className="border border-[var(--praxis-line)] p-3">
              <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Conformance</div>
              <div className="mt-1 font-display text-2xl text-[var(--praxis-violet)]">{completed.conformance}</div>
            </div>
            <div className="border border-[var(--praxis-line)] p-3">
              <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Events</div>
              <div className="mt-1 font-display text-2xl">{completed.events_processed}</div>
            </div>
            <div className="border border-[var(--praxis-line)] p-3">
              <div className="font-mono text-[10px] uppercase text-[var(--praxis-muted)]">Value</div>
              <div className="mt-1 font-display text-2xl text-[var(--praxis-mint)]">
                ${(completed.estimated_value / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-full border border-[rgba(241,237,223,0.16)] bg-[var(--praxis-bg)] px-5 py-3 font-mono text-xs text-[var(--praxis-muted)]">
            {completed.verify_command}
          </div>
        </div>
      )}

      {!running && !completed && stages.length === 0 && (
        <div className="py-12 text-center">
          <ArrowRight className="mx-auto h-8 w-8 text-[var(--praxis-muted)]" />
          <p className="mt-3 max-w-md mx-auto text-sm leading-6 text-[var(--praxis-muted)]">
            Press &ldquo;Run Pipeline&rdquo; to stream the full proof generation path through Floci services in real time.
          </p>
        </div>
      )}
    </article>
  );
}
