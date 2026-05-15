import { NextResponse } from "next/server";

import { createDemoLabel, getDemoLabels } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  return proxyBackend("/api/labels", undefined, () => NextResponse.json(getDemoLabels()));
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyBackend(
    "/api/labels",
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    },
    () => {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(body) as Record<string, unknown>;
      } catch {
        parsed = {};
      }
      return NextResponse.json(createDemoLabel({
        name: typeof parsed.name === "string" ? parsed.name : "new-label",
        color: typeof parsed.color === "string" ? parsed.color : "#8B5CFF",
      }), { status: 201 });
    },
  );
}
