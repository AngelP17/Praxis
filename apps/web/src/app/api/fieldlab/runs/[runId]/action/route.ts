import { NextResponse } from "next/server";
import { IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoActionCapture } from "@/lib/praxis-demo-data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const { runId } = await params;
  const packId = runId.replace(/^demo_/, "");

  if (!IS_VERCEL_RUNTIME) {
    const bodyClone = request.clone();
    return proxyBackend(`/api/fieldlab/runs/${runId}/action`, {
      method: "POST",
      body: bodyClone.body,
    } as RequestInit);
  }

  const body = await request.json().catch(() => ({}));
  const status = body?.status ?? "approved";

  return NextResponse.json(getDemoActionCapture(runId, packId, status));
}
