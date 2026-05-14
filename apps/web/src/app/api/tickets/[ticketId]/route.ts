import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";
import { getDemoTicket } from "@/app/api/_lib/ops-demo";

export async function GET(_: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  return proxyBackend(`/api/tickets/${ticketId}`, undefined, () => NextResponse.json(getDemoTicket(ticketId)));
}
