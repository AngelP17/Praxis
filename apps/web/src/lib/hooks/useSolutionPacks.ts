"use client";

import { useCallback, useEffect, useState } from "react";
import { praxisClient, type SolutionPack } from "@/lib/praxis-client";

export function useSolutionPacks() {
  const [packs, setPacks] = useState<SolutionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    praxisClient
      .listSolutionPacks()
      .then(setPacks)
      .catch((err) => setError(err instanceof Error ? err : new Error("Could not load packs")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { packs, loading, error, reload: load };
}
