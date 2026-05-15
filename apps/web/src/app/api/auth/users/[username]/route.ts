import { NextResponse } from "next/server";

import { deleteDemoUser, updateDemoUser } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function PUT(request: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const body = await request.text();
  return proxyBackend(
    `/api/auth/users/${username}`,
    {
      method: "PUT",
      body,
      headers: { "Content-Type": "application/json" },
    },
    () => {
      let parsed: { role?: string; display_name?: string } = {};
      try {
        parsed = JSON.parse(body) as typeof parsed;
      } catch {
        parsed = {};
      }
      return NextResponse.json(updateDemoUser(username, parsed));
    },
  );
}

export async function DELETE(_: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return proxyBackend(`/api/auth/users/${username}`, { method: "DELETE" }, () =>
    NextResponse.json(deleteDemoUser(username)),
  );
}
