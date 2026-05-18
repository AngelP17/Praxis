import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { SCENARIOS } from "@/lib/scenarios";
import { deterministicHash } from "@/lib/deterministic-hash";

export async function GET() {
  const demoBenchmarks = await Promise.all(
    SCENARIOS.map(async (s) => {
      const hash = await deterministicHash({
        scenario_id: s.id,
        source: s.source,
        event_type: s.eventType,
        asset_id: s.assetId,
        site: s.site,
        line: s.line,
        payload: {
          severity: s.severity,
          raw: s.payload,
        },
      });
      return {
        scenario_id: s.id,
        event_type: s.eventType,
        risk_level: s.severity,
        priority_score: s.priorityScore,
        replay_hash: hash,
        deterministic: true,
        estimated_value_usd: s.estimatedValueUsd,
      };
    })
  );
  return proxyBackend("/api/scenarios/benchmarks", undefined, () =>
    NextResponse.json({ scenarios: demoBenchmarks })
  );
}
