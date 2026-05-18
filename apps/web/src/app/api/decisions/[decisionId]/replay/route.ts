import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_EVENT_STREAM, getDemoReplay } from "@/lib/demo-scenario";

function demoReplay(decisionId: string) {
  const base = getDemoReplay("INC-4821");
  const event = DEMO_EVENT_STREAM[0];
  return {
    decision: {
      id: Number(decisionId),
      event_id: event.event_id,
      priority_score: 0.78,
      confidence_score: 0.88,
      root_cause_hypothesis: "printer_fleet_dependency_disruption",
      risk_level: "high",
      replay_hash: `sha256:${decisionId}.demo`,
      recommendations: [],
    },
    original_event: {
      ...event,
      asset_id: "printer.weifps01",
      site: event.site,
    },
    replayed_decision: {
      priority_score: 0.78,
      confidence_score: 0.88,
      root_cause_hypothesis: "printer_fleet_dependency_disruption",
      rationale: {
        impacted_assets: [
          { asset_name: "Zebra Labeling", criticality: "critical", depth: 1, relationship: "supports" },
          { asset_name: "Texas Production Line", criticality: "critical", depth: 2, relationship: "supports" },
          { asset_name: "Shipping Label Workflow", criticality: "high", depth: 2, relationship: "supports" },
        ],
      },
    },
    stored_replay_hash: `sha256:${decisionId}.demo`,
    replayed_hash: `sha256:${decisionId}.demo`,
    determinism: true,
    feedback: base.operator_feedback,
    replayed_at: new Date("2026-04-27T16:42:00.000Z").toISOString(),
  };
}

export async function POST(_: Request, { params }: { params: Promise<{ decisionId: string }> }) {
  const { decisionId } = await params;
  return proxyBackend(
    `/api/decisions/${decisionId}/replay`,
    { method: "POST" },
    () => NextResponse.json(demoReplay(decisionId)),
  );
}
