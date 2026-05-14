import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";

function demoUserFromToken(token: string | null) {
  if (!token) return null;
  if (token === "demo-local-token" || token === "demo-token") {
    return {
      username: "operator",
      role: "agent",
      display_name: "Demo Operator",
    };
  }
  return null;
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  const demoUser = demoUserFromToken(token);
  if (demoUser) {
    return NextResponse.json(demoUser);
  }

  return proxyBackend(
    "/api/auth/me",
    {
      method: "GET",
      headers: authorization ? { authorization } : undefined,
    },
    () => NextResponse.json({ detail: "Missing bearer token" }, { status: 401 }),
  );
}
