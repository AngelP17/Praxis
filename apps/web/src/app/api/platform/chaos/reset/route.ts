import { NextResponse } from "next/server";
import { proxyBackend } from "@/app/api/_lib/praxis-server";

export async function POST() {
  return proxyBackend("/api/platform/chaos/reset", { method: "POST" }, () =>
    NextResponse.json({ message: "Demo chaos mode reset." }),
  );
}
