import { NextResponse } from "next/server";

import { deleteDemoCategory, updateDemoCategory } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function PUT(request: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  const body = await request.text();
  return proxyBackend(
    `/api/categories/${categoryId}`,
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
      return NextResponse.json(updateDemoCategory(Number(categoryId), parsed));
    },
  );
}

export async function DELETE(_: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  return proxyBackend(`/api/categories/${categoryId}`, { method: "DELETE" }, () =>
    NextResponse.json(deleteDemoCategory(Number(categoryId))),
  );
}
