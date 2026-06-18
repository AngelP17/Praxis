import { NextResponse } from "next/server";
import { IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoRun, DEMO_PACK_IDS } from "@/lib/praxis-demo-data";

export async function POST(request: Request) {
  if (!IS_VERCEL_RUNTIME) {
    const bodyClone = request.clone();
    const body = await request.json().catch(() => ({}));
    const packId = body?.solution_pack_id ?? "manufacturing-printer-gpo";
    return proxyBackend("/api/fieldlab/runs", {
      method: "POST",
      body: bodyClone.body,
    } as RequestInit, () => NextResponse.json(getDemoRun(packId)));
  }

  const body = await request.json().catch(() => ({}));
  const packId = body?.solution_pack_id ?? "manufacturing-printer-gpo";

  return NextResponse.json(getDemoRun(packId));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const packId = searchParams.get("pack");
  const demoRuns = packId
    ? [getDemoRun(packId)]
    : DEMO_PACK_IDS.map((id) => getDemoRun(id));

  if (!IS_VERCEL_RUNTIME) {
    return proxyBackend("/api/fieldlab/runs", undefined, () => NextResponse.json({ runs: demoRuns }));
  }

  return NextResponse.json({ runs: demoRuns });
}
