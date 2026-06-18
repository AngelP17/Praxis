"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SCENARIOS as FALLBACK_SCENARIOS,
  adaptScenarios,
  type Scenario,
  type ScenarioResponse,
} from "@/lib/scenarios";
import { fetchJsonWithTimeout } from "@/lib/api";

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>(FALLBACK_SCENARIOS);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchJsonWithTimeout<ScenarioResponse[]>("/api/scenarios", 5000);
      if (Array.isArray(data) && data.length > 0) {
        setScenarios(adaptScenarios(data));
      }
    } catch {
      // keep fallback
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { scenarios, ready };
}

export function useScenarioById(id: string | null) {
  const { scenarios } = useScenarios();
  if (!id) return scenarios[0];
  return scenarios.find((s) => s.id === id) ?? scenarios[0];
}
