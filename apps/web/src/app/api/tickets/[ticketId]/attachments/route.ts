import { NextResponse } from "next/server";

import { getDemoAttachments } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET(_: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  return proxyBackend(`/api/tickets/${ticketId}/attachments`, undefined, () => NextResponse.json(getDemoAttachments(ticketId)));
}

export async function POST(request: Request, { params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  return proxyBackend(
    `/api/tickets/${ticketId}/attachments`,
    {
      method: "POST",
      body: await request.formData(),
    },
    () =>
      NextResponse.json(
        {
          id: 9555,
          original_name: "demo-upload.txt",
          mime_type: "text/plain",
          file_size: 512,
          created_at: new Date("2026-04-27T17:05:00.000Z").toISOString(),
          uploaded_by: "operator",
          comment_id: null,
          url: "/api/attachments/9555",
        },
        { status: 201 },
      ),
  );
}
