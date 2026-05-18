import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { getScenarioById } from "@/lib/scenarios";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  const { scenarioId } = await params;
  const scenario = getScenarioById(scenarioId);
  return proxyBackend(`/api/scenarios/${scenarioId}/ontology`, undefined, () => {
    if (!scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }
    const nodes = [
      {
        id: "asset",
        label: scenario.assetId.split(".").pop() ?? scenario.assetId,
        type: scenario.assetType.replace(/_/g, " "),
        criticality: scenario.severity,
        owner: scenario.ownerTeam,
        x: 50,
        y: 50,
      },
    ];
    const positions = [
      { x: 20, y: 20 }, { x: 80, y: 20 }, { x: 15, y: 75 },
      { x: 85, y: 75 }, { x: 50, y: 88 },
    ];
    const edges: Array<{ from: string; to: string; label: string; strength: string }> = [];
    scenario.impactedSystems.slice(0, 5).forEach((sys, idx) => {
      const nodeId = `dep-${idx}`;
      nodes.push({
        id: nodeId,
        label: sys,
        type: "dependency",
        criticality: idx === 0 ? "critical" : idx === 1 ? "high" : "medium",
        owner: scenario.ownerTeam,
        x: positions[idx].x,
        y: positions[idx].y,
      });
      edges.push({
        from: "asset",
        to: nodeId,
        label: idx === 0 ? "supports" : idx === 1 ? "feeds" : "depends_on",
        strength: idx === 0 ? "strong" : idx <= 2 ? "medium" : "weak",
      });
    });
    return NextResponse.json({
      scenario_id: scenario.id,
      nodes,
      edges,
      blast_radius: [],
      critical_path: [],
    });
  });
}
