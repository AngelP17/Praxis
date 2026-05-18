import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { SCENARIOS, getScenarioById } from "@/lib/scenarios";
import { deterministicHash } from "@/lib/deterministic-hash";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  const { scenarioId } = await params;
  const scenario = getScenarioById(scenarioId);
  const demoResponse = scenario
    ? await (async () => {
        const hash = await deterministicHash({
          scenario_id: scenario.id,
          source: scenario.source,
          event_type: scenario.eventType,
          asset_id: scenario.assetId,
          site: scenario.site,
          line: scenario.line,
          payload: {
            severity: scenario.severity,
            raw: scenario.payload,
          },
        });
        const index = SCENARIOS.findIndex((s) => s.id === scenario.id);
        return {
          scenario_id: scenario.id,
          event_id: `evt-demo-${scenario.id}`,
          decision_id: 9000 + Math.max(0, index) + 1,
          event_type: scenario.eventType,
          priority_score: scenario.priorityScore,
          risk_level: scenario.severity,
          replay_hash: hash,
          determinism: true,
          replayed_at: new Date().toISOString(),
          auto_approved: false,
          estimated_value_usd: scenario.estimatedValueUsd,
        };
      })()
    : null;
  return proxyBackend(
    `/api/scenarios/${scenarioId}/run`,
    { method: "POST" },
    () =>
      demoResponse
        ? NextResponse.json(demoResponse)
        : NextResponse.json({ error: "Scenario not found" }, { status: 404 })
  );
}
