"use client";

import { useCallback, useState } from "react";
import {
  praxisClient,
  type FieldLabExecuteResponse,
  type FieldLabTimeline,
  type FieldLabRun,
  type ActionCaptureResponse,
} from "@/lib/praxis-client";

export function useFieldLabRun(initialPackId = "manufacturing-printer-gpo") {
  const [packId, setPackId] = useState(initialPackId);
  const [run, setRun] = useState<FieldLabRun | null>(null);
  const [result, setResult] = useState<FieldLabExecuteResponse | null>(null);
  const [timeline, setTimeline] = useState<FieldLabTimeline | null>(null);
  const [actionResult, setActionResult] = useState<ActionCaptureResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runFieldLab = useCallback(
    async (nextPackId = packId) => {
      setLoading(true);
      setError(null);
      setPackId(nextPackId);
      try {
        const created = await praxisClient.createRun(nextPackId);
        const executed = await praxisClient.executeRun(created.run_id);
        const events = await praxisClient.getRunTimeline(created.run_id);
        setRun(created);
        setResult(executed);
        setTimeline(events);
        setActionResult(null);
        return executed;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Could not run FieldLab");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [packId],
  );

  const captureAction = useCallback(
    async (status: "approved" | "rejected" | "request_evidence" | "escalated") => {
      if (!run || !result) return null;
      setLoading(true);
      setError(null);
      try {
        const action = await praxisClient.captureAction(run.run_id, {
          action: result.proof.action.recommended_action,
          status,
          actor: "operator",
        });
        const events = await praxisClient.getRunTimeline(run.run_id);
        setActionResult(action);
        setTimeline(events);
        return action;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Could not capture action");
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [run, result],
  );

  return {
    packId,
    run,
    result,
    timeline,
    actionResult,
    loading,
    error,
    setPackId,
    runFieldLab,
    captureAction,
  };
}
