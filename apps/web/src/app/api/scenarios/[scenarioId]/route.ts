import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { getScenarioById, toScenarioResponse } from "@/lib/scenarios";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  const { scenarioId } = await params;
  const scenario = getScenarioById(scenarioId);
  return proxyBackend(`/api/scenarios/${scenarioId}`, undefined, () =>
    scenario
      ? NextResponse.json(toScenarioResponse(scenario))
      : NextResponse.json({ error: "Scenario not found" }, { status: 404 })
  );
}
