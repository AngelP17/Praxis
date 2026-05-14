import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoAuditExport } from "@/app/api/_lib/ops-demo";

export async function GET(_: Request, { params }: { params: Promise<{ incidentId: string }> }) {
  const { incidentId } = await params;
  return proxyBackend(`/api/audit/export/${incidentId}`, undefined, () =>
    NextResponse.json(getDemoAuditExport(incidentId)),
  );
}
