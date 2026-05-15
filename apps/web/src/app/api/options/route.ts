import { NextResponse } from "next/server";

import { getDemoCatalogOptions } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  return proxyBackend("/api/options", undefined, () => NextResponse.json(getDemoCatalogOptions()));
}
