import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ticketId: string; commentId: string }> },
) {
  const { ticketId, commentId } = await params;
  const body = await request.text();
  return proxyBackend(
    `/api/tickets/${ticketId}/comments/${commentId}`,
    {
      method: "PUT",
      body,
      headers: { "Content-Type": "application/json" },
    },
    () => NextResponse.json({ status: "success", id: Number(commentId) }),
  );
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ ticketId: string; commentId: string }> },
) {
  const { ticketId, commentId } = await params;
  return proxyBackend(`/api/tickets/${ticketId}/comments/${commentId}`, { method: "DELETE" }, () =>
    NextResponse.json({ status: "success", id: Number(commentId) }),
  );
}
