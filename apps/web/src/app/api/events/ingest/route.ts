import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function POST(request: Request) {
  const body = await request.text();
  return proxyBackend(
    "/api/events/ingest",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
    () => NextResponse.json({ event_id: `evt-demo-${Date.now()}` }),
  );
}
