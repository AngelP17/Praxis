import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_PLATFORM_TOPOLOGY } from "@/app/api/_lib/ops-demo";

export async function GET() {
  return proxyBackend("/api/platform/topology", undefined, () => NextResponse.json(DEMO_PLATFORM_TOPOLOGY));
}
