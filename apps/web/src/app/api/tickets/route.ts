import { NextRequest, NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_TICKETS } from "@/lib/demo-scenario";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search || "";
  return proxyBackend(`/api/tickets${search}`, undefined, () => NextResponse.json(DEMO_TICKETS));
}
