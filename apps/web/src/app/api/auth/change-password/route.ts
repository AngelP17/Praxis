import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function POST(request: Request) {
  const body = await request.text();
  return proxyBackend(
    "/api/auth/change-password",
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    },
    () => NextResponse.json({ status: "ok" }),
  );
}
