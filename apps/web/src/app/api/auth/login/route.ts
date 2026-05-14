import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";

const DEMO_USERS = new Map([
  ["admin", { username: "admin", role: "admin", display_name: "Admin" }],
  ["operator", { username: "operator", role: "agent", display_name: "Operator" }],
  ["viewer", { username: "viewer", role: "viewer", display_name: "Viewer" }],
]);

export async function POST(request: Request) {
  const body = await request.text();

  return proxyBackend(
    "/api/auth/login",
    {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    },
    () => {
      let parsed: { username?: string } = {};
      try {
        parsed = JSON.parse(body) as { username?: string };
      } catch {
        parsed = {};
      }

      const username = (parsed.username ?? "").trim().toLowerCase();
      const user = DEMO_USERS.get(username);
      if (!user) {
        return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
      }

      return NextResponse.json({
        access_token: "demo-token",
        token_type: "bearer",
        user,
      });
    },
  );
}
