import { NextResponse } from "next/server";
import { IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoTimeline } from "@/lib/praxis-demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  const packId = runId.replace(/^demo_/, "");

  if (!IS_VERCEL_RUNTIME) {
    return proxyBackend(`/api/fieldlab/runs/${runId}/events`);
  }

  return NextResponse.json(getDemoTimeline(packId, runId));
}
