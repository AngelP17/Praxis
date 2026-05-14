import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_ASSETS } from "@/app/api/_lib/ops-demo";

export async function GET() {
  return proxyBackend("/api/assets", undefined, () => NextResponse.json(DEMO_ASSETS));
}
