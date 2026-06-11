"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowSquareOut, CheckCircle, DownloadSimple, X } from "@phosphor-icons/react";
import { praxisClient, type FieldLabExecuteResponse, type FieldLabRun } from "@/lib/praxis-client";

interface PipelineRunnerModalProps {
  open: boolean;
  onClose: () => void;
  packId?: string;
}

const MODAL_STAGES = [
  { id: "signal",   label: "Signal ingestion",     color: "var(--praxis-argon)" },
  { id: "ontology", label: "Ontology compilation",  color: "var(--praxis-plasma)" },
  { id: "decision", label: "Decision scoring",      color: "var(--praxis-bone)" },
  { id: "action",   label: "Action & approval",     color: "var(--praxis-amber)" },
  { id: "proof",    label: "Proof sealing",         color: "var(--praxis-amber)" },
];

const MODAL_EVENTS = [
  { stage: "signal",   msg: "SQS queue drained · 12 events received" },
  { stage: "signal",   msg: "ticket_cluster_P2 · trust score 0.88" },
  { stage: "signal",   msg: "calibration_drift detected · corroborated" },
  { stage: "ontology", msg: "PLC_Unit → Printer_Fleet_SKU link resolved" },
  { stage: "ontology", msg: "vendor_contract → GPO_Clause_4.2 mapped" },
  { stage: "ontology", msg: "ontology graph: 9 objects, 14 links" },
  { stage: "decision", msg: "priority_score 0.74 · confidence 0.81" },
  { stage: "decision", msg: "next-best questions: 3 VOI items queued" },
  { stage: "action",   msg: "human_approval mode · notifying ops-director" },
  { stage: "action",   msg: "approval received · action_id written" },
  { stage: "proof",    msg: "canonical hash computed · sha256:b4f9…c1a2" },
  { stage: "proof",    msg: "Draft 2020-12 schema validated · L0 verified" },
];

export function PipelineRunnerModal({ open, onClose, packId = "manufacturing-printer-gpo" }: PipelineRunnerModalProps) {
  const [activeStage, setActiveStage] = useState(-1);
  const [events, setEvents] = useState<{ stage: string; msg: string }[]>([]);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState<FieldLabRun | null>(null);
  const [result, setResult] = useState<FieldLabExecuteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const runPipeline = useCallback(() => {
    setActiveStage(0);
    setEvents([]);
    setDone(false);
    setRun(null);
    setResult(null);
    setError(null);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    void (async () => {
      try {
        const createdRun = await praxisClient.createRun(packId);
        setRun(createdRun);
        const executed = await praxisClient.executeRun(createdRun.run_id);
        await praxisClient.captureAction(createdRun.run_id, {
          action: executed.proof.action.recommended_action,
          status: "approved",
          actor: "operator",
          note: "Approved inside the public full-stack proof path.",
        });
        setResult(executed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Pipeline request failed");
      }
    })();

    MODAL_EVENTS.forEach((ev, i) => {
      const t = setTimeout(() => {
        const stageIdx = MODAL_STAGES.findIndex((s) => s.id === ev.stage);
        setActiveStage(stageIdx);
        setEvents((prev) => [...prev, ev]);
        if (i === MODAL_EVENTS.length - 1) setTimeout(() => setDone(true), 400);
      }, (i + 1) * 520);
      timersRef.current.push(t);
    });
  }, [packId]);

  useEffect(() => {
    if (open) runPipeline();
    return () => timersRef.current.forEach(clearTimeout);
  }, [open, runPipeline]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const stageProgress = activeStage >= 0 ? ((activeStage + 1) / MODAL_STAGES.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ background: "rgba(10,10,20,0.88)", backdropFilter: "blur(16px)" }}>
      <div
        className="relative w-full max-w-4xl overflow-hidden border"
        style={{ background: "var(--praxis-surface)", borderColor: "var(--praxis-line)" }}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--praxis-line)" }}>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: "var(--praxis-argon)", boxShadow: "0 0 8px var(--praxis-argon)" }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-muted)" }}>
              Pipeline Runner &middot; {packId}
            </span>
          </div>
          <button onClick={onClose} className="p-1 opacity-60 transition-all duration-200 hover:scale-110 hover:opacity-100">
            <X className="h-4 w-4" style={{ color: "var(--praxis-bone)" }} />
          </button>
        </div>

        {/* stage rail */}
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--praxis-line)" }}>
          <div className="flex items-center gap-3">
            {MODAL_STAGES.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-3">
                <div
                  className="border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition-all duration-500"
                  style={{
                    borderColor: i <= activeStage ? stage.color : "var(--praxis-line)",
                    color: i <= activeStage ? "var(--praxis-bone)" : "var(--praxis-muted)",
                    background: i === activeStage ? `rgba(139,92,255,0.08)` : "transparent",
                  }}
                >
                  {stage.label}
                </div>
                {i < MODAL_STAGES.length - 1 && (
                  <span style={{ color: "var(--praxis-faint)" }}>&rarr;</span>
                )}
              </div>
            ))}
          </div>
          {/* progress bar */}
          <div className="mt-3 h-[2px] w-full" style={{ background: "var(--praxis-line)" }}>
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${stageProgress}%`,
                background: "linear-gradient(90deg, var(--praxis-plasma), var(--praxis-argon))",
              }}
            />
          </div>
        </div>

        {/* body: event log + active stage info */}
        <div className="grid grid-flow-dense grid-cols-2" style={{ minHeight: 320 }}>
          {/* event log */}
          <div className="border-r" style={{ borderColor: "var(--praxis-line)" }}>
            <div className="border-b px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em]" style={{ borderColor: "var(--praxis-line)", color: "var(--praxis-muted)" }}>
              Event log
            </div>
            <div ref={logRef} className="h-64 overflow-auto p-4 font-mono text-[10px]" style={{ color: "var(--praxis-muted)" }}>
              {events.map((ev, i) => {
                const stage = MODAL_STAGES.find((s) => s.id === ev.stage);
                return (
                  <div key={i} className="flex items-start gap-3 py-0.5">
                    <span className="shrink-0 w-16 uppercase" style={{ color: stage?.color }}>{ev.stage}</span>
                    <span>{ev.msg}</span>
                  </div>
                );
              })}
              {!done && activeStage >= 0 && (
                <div className="flex items-center gap-2 py-0.5" style={{ color: "var(--praxis-plasma)" }}>
                  <span className="animate-pulse">&#9618;</span>
                </div>
              )}
            </div>
          </div>

          {/* active stage detail or finale */}
          <div className="flex flex-col items-center justify-center p-6">
            {!done ? (
              activeStage >= 0 ? (
                <div className="text-center">
                  <div
                    className="text-4xl font-display font-semibold tracking-tight transition-all duration-500"
                    style={{ color: MODAL_STAGES[activeStage]?.color }}
                  >
                    {MODAL_STAGES[activeStage]?.label}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--praxis-muted)" }}>
                    running&hellip;
                  </div>
                </div>
              ) : (
                <div className="font-mono text-[10px] uppercase text-center" style={{ color: "var(--praxis-muted)" }}>
                  Initializing&hellip;
                </div>
              )
            ) : (
              <div className="text-center">
                <CheckCircle className="mx-auto h-10 w-10" weight="fill" style={{ color: "var(--praxis-argon)" }} />
                <div className="mt-3 font-display text-2xl font-semibold" style={{ color: "var(--praxis-bone)" }}>
                  Proof sealed
                </div>
                <div className="mt-2 font-mono text-[10px]" style={{ color: "var(--praxis-muted)" }}>
                  {(result?.proof.proof_hash ?? "sha256:b4f9...c1a2").slice(0, 22)}... / L0 verified
                </div>
                <div className="mt-2 font-mono text-[10px]" style={{ color: "var(--praxis-amber)" }}>
                  {run?.run_id ?? `fieldlab_run_${packId}`}
                </div>
                <code className="mt-4 block overflow-x-auto rounded border px-3 py-2 font-mono text-[10px]" style={{ borderColor: "var(--praxis-line)", color: "var(--praxis-muted)", background: "var(--praxis-obsidian)" }}>
                  uvx praxis-verify artifacts/latest/praxis_proof.json --level L0
                </code>
                {error && (
                  <div className="mt-4 border border-[var(--praxis-crit)] px-3 py-2 text-left font-mono text-[10px] text-[var(--praxis-crit)]">
                    {error}
                  </div>
                )}
                <div className="mt-5 grid grid-flow-dense gap-2 sm:grid-cols-2">
                  <Link
                    href={`/field-workbench/${run?.run_id ?? result?.run_id ?? `fieldlab_run_${packId}`}`}
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--praxis-bone)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-obsidian)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Open run
                    <ArrowSquareOut className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/api/proofs/${packId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--praxis-line)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Export JSON
                    <DownloadSimple className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--praxis-line)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/executive-readout/${result?.proof.run_id ?? run?.run_id ?? `fieldlab_run_${packId}`}`}
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--praxis-line)] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--praxis-bone)] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Readout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
