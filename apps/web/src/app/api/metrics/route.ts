import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoMetrics } from "@/app/api/_lib/ops-demo";

export async function GET() {
  return proxyBackend("/api/metrics", undefined, () => NextResponse.json(getDemoMetrics()));
}
