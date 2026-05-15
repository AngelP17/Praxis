import { NextResponse } from "next/server";

import { DEMO_ONTOLOGY_LINKS } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  return proxyBackend("/api/ontology/links", undefined, () =>
    NextResponse.json({ links: DEMO_ONTOLOGY_LINKS }),
  );
}
