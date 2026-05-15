import { NextRequest, NextResponse } from "next/server";

import { createDemoAssignee, deleteDemoAssignee, getDemoAssignees } from "@/app/api/_lib/ops-demo";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function GET() {
  return proxyBackend("/api/assignees", undefined, () => NextResponse.json(getDemoAssignees()));
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyBackend(
    "/api/assignees",
    {
      method: "POST",
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
      return NextResponse.json(
        createDemoAssignee(typeof parsed.display_name === "string" ? parsed.display_name : "New Assignee"),
        { status: 201 },
      );
    },
  );
}

export async function DELETE(request: NextRequest) {
  const search = request.nextUrl.search || "";
  const displayName = request.nextUrl.searchParams.get("display_name") ?? "";
  return proxyBackend(`/api/assignees${search}`, { method: "DELETE" }, () =>
    NextResponse.json(deleteDemoAssignee(displayName)),
  );
}
