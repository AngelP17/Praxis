import { NextResponse } from "next/server";
import { IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoExecuteResponse } from "@/lib/praxis-demo-data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  const packId = runId.replace(/^demo_/, "");

  if (!IS_VERCEL_RUNTIME) {
    return proxyBackend(
      `/api/fieldlab/runs/${runId}/execute`,
      { method: "POST" },
      () => NextResponse.json(getDemoExecuteResponse(packId, runId)),
    );
  }

  return NextResponse.json(getDemoExecuteResponse(packId, runId));
}
