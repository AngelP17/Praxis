import { NextResponse } from "next/server";

import { createDemoUser, getDemoUsers } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  return proxyBackend("/api/auth/users", undefined, () => NextResponse.json(getDemoUsers()));
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyBackend(
    "/api/auth/users",
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    },
    () => {
      let parsed: { username?: string; role?: string; display_name?: string } = {};
      try {
        parsed = JSON.parse(body) as typeof parsed;
      } catch {
        parsed = {};
      }
      return NextResponse.json(
        createDemoUser({
          username: parsed.username ?? "demo-user",
          role: parsed.role ?? "viewer",
          display_name: parsed.display_name ?? parsed.username ?? "Demo User",
        }),
        { status: 201 },
      );
    },
  );
}
