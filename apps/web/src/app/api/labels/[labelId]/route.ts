import { NextResponse } from "next/server";

import { deleteDemoLabel } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function DELETE(_: Request, { params }: { params: Promise<{ labelId: string }> }) {
  const { labelId } = await params;
  return proxyBackend(`/api/labels/${labelId}`, { method: "DELETE" }, () =>
    NextResponse.json(deleteDemoLabel(Number(labelId))),
  );
}
