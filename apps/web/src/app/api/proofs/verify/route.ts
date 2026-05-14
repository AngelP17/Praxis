import { NextResponse } from "next/server";
import { getDemoRoutePayload, IS_VERCEL_RUNTIME, proxyBackend } from "@/app/api/_lib/praxis-server";

function demoVerifyResponse(packId: string) {
  const proof = getDemoRoutePayload(packId).proof;
  return NextResponse.json({
    valid: true,
    status: "verified",
    errors: [],
    proof_hash: proof.proof_hash,
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const parsed = JSON.parse(rawBody || "{}") as Record<string, string>;
  const packId = parsed.solution_pack ?? parsed.pack_id ?? "manufacturing-printer-gpo";

  if (!IS_VERCEL_RUNTIME) {
    return proxyBackend(
      "/api/proofs/verify",
      {
        method: "POST",
        body: rawBody,
        headers: { "Content-Type": "application/json" },
      },
      () => demoVerifyResponse(packId),
    );
  }

  return demoVerifyResponse(packId);
}
