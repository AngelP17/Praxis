import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_EVENT_STREAM } from "@/lib/demo-scenario";

export async function GET() {
  return proxyBackend("/api/events", undefined, () => NextResponse.json(DEMO_EVENT_STREAM));
}
