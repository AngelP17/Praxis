import { NextResponse } from "next/server";
import { getDemoRoutePayload, IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";

function demoHealthResponse() {
  return NextResponse.json(getDemoRoutePayload("manufacturing-printer-gpo").health);
}

export async function GET() {
  if (!IS_VERCEL_RUNTIME) {
    const proxied = await proxyBackend(
      "/health/floci",
      undefined,
      () => demoHealthResponse(),
    );
    try {
      const body = await proxied.json();
      if (body.status === "healthy") return NextResponse.json(body);
    } catch { /* parse failed */ }
    return demoHealthResponse();
  }

  return demoHealthResponse();
}
