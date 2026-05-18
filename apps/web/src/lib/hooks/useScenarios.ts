"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SCENARIOS as FALLBACK_SCENARIOS,
  adaptScenarios,
  type Scenario,
  type ScenarioResponse,
} from "@/lib/scenarios";

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>(FALLBACK_SCENARIOS);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/scenarios");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setScenarios(adaptScenarios(data as ScenarioResponse[]));
        }
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
