import { NextResponse } from "next/server";

import { getDemoValueCase } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET(_: Request, { params }: { params: Promise<{ valueCaseId: string }> }) {
  const { valueCaseId } = await params;
  return proxyBackend(`/api/value-cases/${valueCaseId}`, undefined, () =>
    NextResponse.json(getDemoValueCase(valueCaseId)),
  );
}
