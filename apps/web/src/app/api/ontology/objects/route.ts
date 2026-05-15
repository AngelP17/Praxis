import { NextResponse } from "next/server";

import { DEMO_ONTOLOGY_OBJECTS } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  return proxyBackend("/api/ontology/objects", undefined, () =>
    NextResponse.json({ objects: DEMO_ONTOLOGY_OBJECTS }),
  );
}
