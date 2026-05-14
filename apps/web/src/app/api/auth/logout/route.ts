import { NextResponse } from "next/server";

import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function POST(request: Request) {
  return proxyBackend(
    "/api/auth/logout",
    { method: "POST" },
    () => NextResponse.json({ status: "success" }),
  );
}
