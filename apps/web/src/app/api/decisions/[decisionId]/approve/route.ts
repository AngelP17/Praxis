import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function POST(request: Request, { params }: { params: Promise<{ decisionId: string }> }) {
  const { decisionId } = await params;
  const body = await request.text();
  return proxyBackend(
    `/api/decisions/${decisionId}/approve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
    () => NextResponse.json({ status: "approved", decision_id: Number(decisionId) }),
  );
}
