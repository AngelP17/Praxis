import { NextResponse } from "next/server";

import { getDemoComments } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET(_: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  return proxyBackend(`/api/tickets/${ticketId}/comments`, undefined, () => NextResponse.json(getDemoComments(ticketId)));
}

export async function POST(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const body = await request.text();
  return proxyBackend(
    `/api/tickets/${ticketId}/comments`,
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    },
    () => {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(body) as Record<string, unknown>;
      } catch {
        parsed = {};
      }
      return NextResponse.json(
        {
          id: 7999,
          ticket_id: ticketId,
          author_username: "operator",
          author_display_name: "Demo Operator",
          body: typeof parsed.body === "string" ? parsed.body : "Demo comment",
          created_at: new Date("2026-04-27T17:04:00.000Z").toISOString(),
          updated_at: new Date("2026-04-27T17:04:00.000Z").toISOString(),
          attachments: [],
        },
        { status: 201 },
      );
    },
  );
}
