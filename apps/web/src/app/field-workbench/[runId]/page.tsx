"use client";

import { useParams } from "next/navigation";
import { OverviewBoard } from "@/components/praxis/workbench/OverviewBoard";

function resolvePackId(runId: string): string {
  if (runId.includes("erp")) return "erp-access-disruption";
  if (runId.includes("k8s") || runId.includes("ingress")) return "k8s-ingress-degradation";
  return "manufacturing-printer-gpo";
}

export default function FieldWorkbenchRunPage() {
  const params = useParams();
  const runId = (params.runId as string) ?? "unknown";
  const packId = resolvePackId(runId);
  return <OverviewBoard packId={packId} runId={runId} />;
}
