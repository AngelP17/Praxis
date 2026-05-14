import { NextResponse } from "next/server";
import { getDemoRoutePayload, IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  if (!IS_VERCEL_RUNTIME) {
    return proxyBackend(
      "/api/solution-packs",
      undefined,
      () => NextResponse.json(getDemoRoutePayload("manufacturing-printer-gpo").packs),
    );
  }

  return NextResponse.json(getDemoRoutePayload("manufacturing-printer-gpo").packs);
}
