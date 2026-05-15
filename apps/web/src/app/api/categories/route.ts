import { NextResponse } from "next/server";

import { createDemoCategory, getDemoCatalogOptions } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  return proxyBackend("/api/categories", undefined, () => NextResponse.json(getDemoCatalogOptions().categories));
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyBackend(
    "/api/categories",
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
      return NextResponse.json(createDemoCategory({
        name: typeof parsed.name === "string" ? parsed.name : "New Category",
        color: typeof parsed.color === "string" ? parsed.color : "#8B5CFF",
        icon: typeof parsed.icon === "string" ? parsed.icon : "tag",
      }), { status: 201 });
    },
  );
}
