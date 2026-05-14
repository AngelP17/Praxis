import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoIncidentTimeline } from "@/app/api/_lib/ops-demo";

export async function GET(_: Request, { params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  return proxyBackend(`/api/incidents/${incidentId}/timeline`, undefined, () =>
    NextResponse.json(getDemoIncidentTimeline(incidentId)),
  );
}
