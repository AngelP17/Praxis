import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoIncident } from "@/lib/demo-scenario";

export async function GET(_: Request, { params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  return proxyBackend(`/api/incidents/${incidentId}`, undefined, () => NextResponse.json(getDemoIncident(incidentId)));
}
