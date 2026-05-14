"use client";

import { useCallback, useEffect, useState } from "react";
import { praxisClient, type SolutionPack } from "@/lib/praxis-client";
import { DEMO_PACKS } from "@/lib/praxis-demo-data";

const IS_DEMO = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");

export function useSolutionPacks() {
  const [packs, setPacks] = useState<SolutionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    if (IS_DEMO) {
      setPacks(DEMO_PACKS);
      setLoading(false);
      return;
    }

    praxisClient
      .listSolutionPacks()
      .then(setPacks)
      .catch((err) => setError(err instanceof Error ? err : new Error("Could not load packs")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { packs, loading, error, reload: load, isDemo: IS_DEMO };
}
