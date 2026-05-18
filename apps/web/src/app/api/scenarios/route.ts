import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { SCENARIOS, toScenarioResponse } from "@/lib/scenarios";

export async function GET() {
  return proxyBackend("/api/scenarios", undefined, () =>
    NextResponse.json(SCENARIOS.map(toScenarioResponse))
  );
}
