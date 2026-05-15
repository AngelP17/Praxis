import { NextResponse } from "next/server";

import { DEMO_ONTOLOGY_ACTIONS } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  return proxyBackend("/api/ontology/actions", undefined, () =>
    NextResponse.json({ actions: DEMO_ONTOLOGY_ACTIONS }),
  );
}
