import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { createDemoTicketDetail, getDemoTicketDetail } from "@/app/api/_lib/ops-demo";

export async function GET(_: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  return proxyBackend(`/api/tickets/${ticketId}`, undefined, () => NextResponse.json(getDemoTicketDetail(ticketId)));
}

export async function PUT(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  const body = await request.text();
  return proxyBackend(
    `/api/tickets/${ticketId}`,
    {
      method: "PUT",
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
      return NextResponse.json({
        ...createDemoTicketDetail(parsed),
        ticket: {
          ...createDemoTicketDetail(parsed).ticket,
          ticket_id: ticketId,
        },
      });
    },
  );
}

export async function DELETE(_: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  return proxyBackend(`/api/tickets/${ticketId}`, { method: "DELETE" }, () =>
    NextResponse.json({ status: "success", ticket_id: ticketId }),
  );
}
