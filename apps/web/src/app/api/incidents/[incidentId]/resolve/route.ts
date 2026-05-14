import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function POST(request: Request, { params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  const body = await request.text();
  return proxyBackend(
    `/api/incidents/${incidentId}/resolve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
    () => NextResponse.json({ status: "resolved", incident_id: incidentId }),
  );
}
