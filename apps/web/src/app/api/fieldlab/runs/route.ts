import { NextResponse } from "next/server";
import { IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoRun } from "@/lib/praxis-demo-data";

export async function POST(request: Request) {
  if (!IS_VERCEL_RUNTIME) {
    const bodyClone = request.clone();
    return proxyBackend("/api/fieldlab/runs", {
      method: "POST",
      body: bodyClone.body,
    } as RequestInit);
  }

  const body = await request.json().catch(() => ({}));
  const packId = body?.solution_pack_id ?? "manufacturing-printer-gpo";

  return NextResponse.json(getDemoRun(packId));
}

export async function GET() {
  if (!IS_VERCEL_RUNTIME) {
    return proxyBackend("/api/fieldlab/runs");
  }

  const packId = "manufacturing-printer-gpo";
  return NextResponse.json([getDemoRun(packId)]);
}
