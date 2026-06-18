"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ReadoutBoard } from "@/components/praxis/workbench/ReadoutBoard";

function resolvePackId(runId: string): string {
  if (runId.includes("erp") || runId.includes("onboarding") || runId.includes("identity")) return "identity-onboarding-drift";
  if (runId.includes("k8s") || runId.includes("ingress") || runId.includes("db") || runId.includes("database") || runId.includes("failover")) return "database-failover-lag";
  if (runId.includes("wan") || runId.includes("network") || runId.includes("isp") || runId.includes("starlink")) return "network-edge-failover";
  return "manufacturing-printer-gpo";
}

export default function ExecutiveReadoutRunPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const runId = (params.runId as string) ?? "unknown";
  const packId = searchParams.get("pack") ?? resolvePackId(runId);
  return <ReadoutBoard packId={packId} runId={runId} />;
}
