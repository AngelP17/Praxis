import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET(_: Request, { params }: { params: Promise<{ attachmentId: string }> }) {
  const { attachmentId } = await params;
  return proxyBackend(`/api/attachments/${attachmentId}`, undefined, () =>
    new NextResponse("Demo attachment", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'inline; filename="demo-attachment.txt"',
      },
    }),
  );
}

export async function DELETE(_: Request, { params }: { params: Promise<{ attachmentId: string }> }) {
  const { attachmentId } = await params;
  return proxyBackend(`/api/attachments/${attachmentId}`, { method: "DELETE" }, () =>
    NextResponse.json({ status: "success", id: Number(attachmentId) }),
  );
}
