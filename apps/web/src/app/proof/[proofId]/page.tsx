"use client";

import { useParams, useSearchParams } from "next/navigation";
import { DecisionBoard } from "@/components/praxis/workbench/DecisionBoard";

function resolvePackId(proofId: string, queryPack: string | null): string {
  if (queryPack) return queryPack;
  if (proofId.includes("erp")) return "erp-access-disruption";
  if (proofId.includes("k8s") || proofId.includes("ingress")) return "k8s-ingress-degradation";
  return "manufacturing-printer-gpo";
}

export default function ProofDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const proofId = (params.proofId as string) ?? "unknown";
  const queryPack = searchParams.get("pack");
  const packId = resolvePackId(proofId, queryPack);
  return <DecisionBoard packId={packId} runId={proofId} />;
}
