import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_EVENT_STREAM } from "@/lib/demo-scenario";

export async function GET() {
  return proxyBackend("/api/audit/events", undefined, () =>
    NextResponse.json(
      DEMO_EVENT_STREAM.map((event) => ({
        event_id: event.event_id,
        source: event.source,
        event_type: event.event_type,
        severity: event.severity,
        occurred_at: event.occurred_at,
        created_at: event.created_at,
      })),
    ),
  );
}
