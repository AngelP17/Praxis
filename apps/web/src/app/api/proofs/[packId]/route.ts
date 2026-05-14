import { NextResponse } from "next/server";
import { getDemoRoutePayload, IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ packId: string }> },
) {
  const { packId } = await params;

  if (!IS_VERCEL_RUNTIME) {
    return proxyBackend(
      `/api/proofs/${packId}`,
      undefined,
      () => NextResponse.json(getDemoRoutePayload(packId).proof),
    );
  }

  return NextResponse.json(getDemoRoutePayload(packId).proof);
}
