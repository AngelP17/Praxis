import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_PLATFORM_SUMMARY } from "@/app/api/_lib/ops-demo";

export async function GET() {
  return proxyBackend("/api/platform/summary", undefined, () => NextResponse.json(DEMO_PLATFORM_SUMMARY));
}
