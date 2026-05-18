import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { DEMO_EVENT_STREAM } from "@/lib/demo-scenario";

export async function GET(_: Request, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return proxyBackend(`/api/events/${eventId}`, undefined, () => {
    const event = DEMO_EVENT_STREAM.find((item) => item.event_id === eventId) ?? DEMO_EVENT_STREAM[0];
    return NextResponse.json(event);
  });
}
