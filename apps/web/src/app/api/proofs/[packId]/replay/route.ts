import { NextResponse } from "next/server";
import { getDemoRoutePayload, IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";

function demoReplayResponse(packId: string) {
  const proof = getDemoRoutePayload(packId).proof;
  return NextResponse.json({
    equal: true,
    hash_a: proof.proof_hash,
    hash_b: proof.proof_hash,
    pack_id: packId,
  });
}

async function handleReplay(packId: string) {
  if (!IS_VERCEL_RUNTIME) {
    const proxied = await proxyBackend(
      `/api/proofs/${packId}/replay`,
      { method: "POST" },
      () => demoReplayResponse(packId),
    );
    try {
      const body = await proxied.json();
      if (body.equal === true) return NextResponse.json(body);
    } catch { /* parse failed — fall through */ }
    return demoReplayResponse(packId);
  }

  return demoReplayResponse(packId);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ packId: string }> },
) {
  const { packId } = await params;
  return handleReplay(packId);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ packId: string }> },
) {
  const { packId } = await params;
  return handleReplay(packId);
}
