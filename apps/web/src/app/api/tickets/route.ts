import { NextRequest, NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_TICKETS } from "@/lib/demo-scenario";
import { createDemoTicketDetail } from "@/app/api/_lib/ops-demo";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search || "";
  return proxyBackend(`/api/tickets${search}`, undefined, () => NextResponse.json(DEMO_TICKETS));
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyBackend(
    "/api/tickets",
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
      return NextResponse.json(createDemoTicketDetail(parsed), { status: 201 });
    },
  );
}
