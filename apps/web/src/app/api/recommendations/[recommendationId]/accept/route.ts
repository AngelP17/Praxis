import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function POST(request: Request, { params }: { params: Promise<{ recommendationId: string }> }) {
  const { recommendationId } = await params;
  const body = await request.text();
  return proxyBackend(
    `/api/recommendations/${recommendationId}/accept`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
    () => NextResponse.json({ status: "accepted", recommendation_id: Number(recommendationId) }),
  );
}
