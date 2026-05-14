import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_INCIDENTS } from "@/lib/demo-scenario";

export async function GET() {
  return proxyBackend("/api/incidents", undefined, () => NextResponse.json(DEMO_INCIDENTS));
}
