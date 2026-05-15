import { NextResponse } from "next/server";

import { getDemoDiscovery } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function POST(request: Request) {
  const body = await request.text();
  return proxyBackend(
    "/api/discovery/discover",
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    },
    () => {
      let parsed: { recommended_solution_pack?: string; customer_context?: { packId?: string } } = {};
      try {
        parsed = JSON.parse(body) as typeof parsed;
      } catch {
        parsed = {};
      }
      const packId =
        parsed.customer_context?.packId ??
        parsed.recommended_solution_pack ??
        "manufacturing-printer-gpo";
      return NextResponse.json(getDemoDiscovery(packId));
    },
  );
}
